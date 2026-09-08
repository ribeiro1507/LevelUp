import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Navigation, Footprints, Bike, Flame, Timer, Compass, Zap, ArrowLeft, Trash2, Route, ShieldCheck } from 'lucide-react';
import L from 'leaflet';
import { ActivityType, LocationPoint, WorkoutRecord } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface RecordScreenProps {
  onFinishWorkout: (record: WorkoutRecord) => void;
  onBack?: () => void;
}

export const RecordScreen: React.FC<RecordScreenProps> = ({ onFinishWorkout, onBack }) => {
  const [activity, setActivity] = useState<ActivityType>('correr');
  const [isTracking, setIsTracking] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [currentSpeedKmH, setCurrentSpeedKmH] = useState(0);
  const [calories, setCalories] = useState(0);
  const [locationPoints, setLocationPoints] = useState<LocationPoint[]>([]);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isOsmSnapped, setIsOsmSnapped] = useState<boolean>(false);
  const [isMatchingLoading, setIsMatchingLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isSimulatingGps, setIsSimulatingGps] = useState(false);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);

  // Raw coordinates ref to prevent closure staleness and feed OSRM map-matching
  const rawPointsRef = useRef<LocationPoint[]>([]);
  const isMatchingInProgressRef = useRef<boolean>(false);
  const osrmDebounceTimerRef = useRef<any>(null);

  // Smooth animated path drawing refs
  const lastDrawnPosRef = useRef<{ lat: number; lng: number } | null>(null);
  const activeAnimationRef = useRef<{
    rafId: number;
    targetLat: number;
    targetLng: number;
  } | null>(null);

  // Map DOM reference
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Default location: São Paulo, Brasil or user's current GPS position
  const [centerCoords, setCenterCoords] = useState<{ lat: number; lng: number }>({
    lat: -23.55052,
    lng: -46.633308,
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([centerCoords.lat, centerCoords.lng], 16);

      // Dark theme map tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Custom Neon Green pulse marker icon
      const neonIcon = L.divIcon({
        className: 'custom-neon-marker',
        html: `
          <div class="relative w-7 h-7 flex items-center justify-center">
            <div class="absolute inset-0 bg-[#78FF00] rounded-full opacity-60 animate-ping"></div>
            <div class="relative w-4 h-4 bg-[#78FF00] border-2 border-[#0A0D0B] rounded-full shadow-[0_0_12px_#78FF00]"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([centerCoords.lat, centerCoords.lng], { icon: neonIcon }).addTo(map);

      const polyline = L.polyline([], {
        color: '#78FF00',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
        className: 'smooth-route-polyline',
      }).addTo(map);

      mapInstanceRef.current = map;
      markerRef.current = marker;
      polylineRef.current = polyline;
    }

    return () => {
      if (activeAnimationRef.current) {
        cancelAnimationFrame(activeAnimationRef.current.rafId);
        activeAnimationRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Distance accumulation & last position refs for high precision GPS speed
  const accumulatedMetersRef = useRef<number>(0);
  const lastPositionRef = useRef<{ lat: number; lng: number; timestamp: number } | null>(null);

  // Haversine formula to compute actual distance in meters between 2 GPS coordinates
  const getHaversineDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Timer interval
  useEffect(() => {
    let timer: any = null;
    if (isTracking) {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isTracking]);

  // Calories calculation based on elapsed time & activity type
  useEffect(() => {
    if (!isTracking) return;

    let calPerMin = 10;
    if (activity === 'caminhar') calPerMin = 5;
    if (activity === 'pedalar') calPerMin = 12;

    setCalories(Math.round((seconds / 60) * calPerMin));
  }, [seconds, isTracking, activity]);

  // OSRM Map-Matching function: snaps GPS points to real road geometries
  const matchRouteWithOSRM = async (points: LocationPoint[], currentActivity: ActivityType) => {
    if (points.length < 2 || isMatchingInProgressRef.current) return;

    try {
      isMatchingInProgressRef.current = true;
      setIsMatchingLoading(true);

      const profile = currentActivity === 'pedalar' ? 'bike' : 'foot';

      // Keep up to 80 points to respect public OSRM URL limits
      let queryPoints = points;
      if (points.length > 80) {
        const step = Math.ceil(points.length / 80);
        queryPoints = points.filter((_, idx) => idx % step === 0 || idx === points.length - 1);
      }

      const coordsStr = queryPoints
        .map((p) => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`)
        .join(';');
      const radiusesStr = queryPoints.map(() => '25').join(';');

      const url = `https://router.project-osrm.org/match/v1/${profile}/${coordsStr}?overview=full&geometries=geojson&radiuses=${radiusesStr}&gaps=split`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) return;

      const data = await response.json();
      if (data.code === 'Ok' && Array.isArray(data.matchings) && data.matchings.length > 0) {
        const snappedLatLngs: [number, number][] = [];
        let matchedDistanceMeters = 0;

        data.matchings.forEach((match: any) => {
          if (match.distance) {
            matchedDistanceMeters += match.distance;
          }
          if (match.geometry?.coordinates) {
            match.geometry.coordinates.forEach(([lng, lat]: [number, number]) => {
              snappedLatLngs.push([lat, lng]);
            });
          }
        });

        if (snappedLatLngs.length > 0 && polylineRef.current) {
          if (activeAnimationRef.current) {
            cancelAnimationFrame(activeAnimationRef.current.rafId);
            activeAnimationRef.current = null;
          }
          // Substitui e suaviza o traçado da Polyline pelas ruas reais mapeadas
          polylineRef.current.setLatLngs(snappedLatLngs);
          setIsOsmSnapped(true);

          const lastCoord = snappedLatLngs[snappedLatLngs.length - 1];
          if (lastCoord) {
            lastDrawnPosRef.current = { lat: lastCoord[0], lng: lastCoord[1] };
            if (markerRef.current) {
              markerRef.current.setLatLng(lastCoord);
            }
          }

          if (matchedDistanceMeters > 0) {
            const matchedKm = Number((matchedDistanceMeters / 1000).toFixed(2));
            if (matchedKm > 0) {
              setDistanceKm(matchedKm);
              accumulatedMetersRef.current = matchedDistanceMeters;
            }
          }
        }
      }
    } catch (err) {
      console.debug('OSRM match status:', err);
    } finally {
      isMatchingInProgressRef.current = false;
      setIsMatchingLoading(false);
    }
  };

  const scheduleOsrmMatch = (points: LocationPoint[], currentActivity: ActivityType) => {
    if (points.length < 2) return;
    if (osrmDebounceTimerRef.current) {
      clearTimeout(osrmDebounceTimerRef.current);
    }
    // Debounce to allow continuous smooth GPS acquisition while periodically snapping to roads
    osrmDebounceTimerRef.current = setTimeout(() => {
      matchRouteWithOSRM(points, currentActivity);
    }, 2500);
  };

  // Real Mobile GPS Geolocation or Simulation Watcher
  useEffect(() => {
    let watchId: number | null = null;

    if (isTracking && !isSimulatingGps) {
      if ('geolocation' in navigator) {
        // 1. Refatoração da lógica de captura do GPS com alta precisão
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, speed, accuracy } = position.coords;
            const now = position.timestamp || Date.now();

            // 2. Filtro de precisão das coordenadas: ignorar se accuracy > 15 metros
            if (accuracy !== undefined && accuracy !== null && accuracy > 15) {
              console.warn(`[GPS] Ponto descartado por imprecisão: ${accuracy.toFixed(1)}m (> 15m)`);
              setGpsAccuracy(Math.round(accuracy));
              return;
            }
            setGpsAccuracy(accuracy !== undefined && accuracy !== null ? Math.round(accuracy) : null);

            let speedKmH = 0;

            // Direct device hardware GPS speed (m/s -> km/h)
            if (speed !== null && speed !== undefined && speed >= 0) {
              speedKmH = Number((speed * 3.6).toFixed(1));
            }

            // Calculate distance & fallback speed if device doesn't report raw speed
            if (lastPositionRef.current) {
              const deltaMeters = getHaversineDistanceMeters(
                lastPositionRef.current.lat,
                lastPositionRef.current.lng,
                latitude,
                longitude
              );
              const deltaTimeSec = (now - lastPositionRef.current.timestamp) / 1000;

              // Filter stationary noise (ignore shifts < 1.5 meters)
              if (deltaMeters >= 1.5) {
                accumulatedMetersRef.current += deltaMeters;
                const newKm = Number((accumulatedMetersRef.current / 1000).toFixed(2));
                setDistanceKm(newKm);

                if ((speed === null || speed === undefined || speed === 0) && deltaTimeSec > 0) {
                  const calculatedSpeed = (deltaMeters / deltaTimeSec) * 3.6;
                  if (calculatedSpeed < 120) {
                    speedKmH = Number(calculatedSpeed.toFixed(1));
                  }
                }
              }
            }

            lastPositionRef.current = { lat: latitude, lng: longitude, timestamp: now };
            setCurrentSpeedKmH(speedKmH);

            const newPoint: LocationPoint = {
              lat: latitude,
              lng: longitude,
              timestamp: now,
              speedKmH,
            };

            updateMapPosition(latitude, longitude, newPoint);
          },
          (err) => {
            // Se for timeout transitório buscando satélites, não abortar
            if (err.code === 3) {
              console.warn('[GPS] Aguardando sinal preciso (timeout 5s)...');
              return;
            }
            console.warn('GPS position error:', err.message);
            setGpsError('GPS indisponível no navegador. Usando simulação de percurso.');
            setIsSimulatingGps(true);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        setIsSimulatingGps(true);
      }
    } else {
      lastPositionRef.current = null;
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking, isSimulatingGps]);

  // Simulation tick for testing on desktop / non-GPS devices
  useEffect(() => {
    let simInterval: any = null;
    if (isTracking && isSimulatingGps) {
      simInterval = setInterval(() => {
        setCenterCoords((prev) => {
          let baseSpeed = 10;
          if (activity === 'caminhar') baseSpeed = 5;
          if (activity === 'pedalar') baseSpeed = 22;

          // Realistic natural speed fluctuation (+/- 1.2 km/h)
          const currentSimSpeed = Number(Math.max(1, baseSpeed + (Math.random() - 0.5) * 2.4).toFixed(1));
          setCurrentSpeedKmH(currentSimSpeed);

          const deltaLat = (Math.random() - 0.3) * 0.00015;
          const deltaLng = (Math.random() - 0.2) * 0.00015;
          const newLat = prev.lat + deltaLat;
          const newLng = prev.lng + deltaLng;

          if (lastPositionRef.current) {
            const distMeters = getHaversineDistanceMeters(
              lastPositionRef.current.lat,
              lastPositionRef.current.lng,
              newLat,
              newLng
            );
            accumulatedMetersRef.current += distMeters;
            setDistanceKm(Number((accumulatedMetersRef.current / 1000).toFixed(2)));
          }

          lastPositionRef.current = { lat: newLat, lng: newLng, timestamp: Date.now() };

          const newPoint: LocationPoint = {
            lat: newLat,
            lng: newLng,
            timestamp: Date.now(),
            speedKmH: currentSimSpeed,
          };

          updateMapPosition(newLat, newLng, newPoint);
          return { lat: newLat, lng: newLng };
        });
      }, 2000);
    }
    return () => clearInterval(simInterval);
  }, [isTracking, isSimulatingGps, activity]);

  // Animação suave para desenhar progressivamente a Polyline entre a coordenada anterior e a nova
  const animatePolylineStep = (
    startLat: number,
    startLng: number,
    targetLat: number,
    targetLng: number,
    durationMs = 450
  ) => {
    if (!polylineRef.current || !mapInstanceRef.current || !markerRef.current) return;

    // Adiciona o novo vértice na ponta da Polyline começando na posição anterior
    polylineRef.current.addLatLng([startLat, startLng]);

    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // Curva ease-out quad para desaceleração suave ao se aproximar da coordenada final
      const ease = 1 - (1 - progress) * (1 - progress);

      const curLat = startLat + (targetLat - startLat) * ease;
      const curLng = startLng + (targetLng - startLng) * ease;

      if (polylineRef.current) {
        const latLngs = polylineRef.current.getLatLngs() as L.LatLng[];
        if (latLngs.length > 0) {
          latLngs[latLngs.length - 1] = L.latLng(curLat, curLng);
          polylineRef.current.setLatLngs(latLngs);
        }
      }

      if (markerRef.current) {
        markerRef.current.setLatLng([curLat, curLng]);
      }

      if (progress < 1) {
        const rafId = requestAnimationFrame(step);
        activeAnimationRef.current = {
          rafId,
          targetLat,
          targetLng,
        };
      } else {
        activeAnimationRef.current = null;
        lastDrawnPosRef.current = { lat: targetLat, lng: targetLng };
        if (polylineRef.current) {
          const latLngs = polylineRef.current.getLatLngs() as L.LatLng[];
          if (latLngs.length > 0) {
            latLngs[latLngs.length - 1] = L.latLng(targetLat, targetLng);
            polylineRef.current.setLatLngs(latLngs);
          }
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([targetLat, targetLng]);
        }
      }
    };

    const rafId = requestAnimationFrame(step);
    activeAnimationRef.current = {
      rafId,
      targetLat,
      targetLng,
    };

    // Suaviza também o deslocamento da câmera do mapa para a nova coordenada
    mapInstanceRef.current.panTo([targetLat, targetLng], {
      animate: true,
      duration: durationMs / 1000,
      easeLinearity: 0.25,
    });
  };

  const updateMapPosition = (lat: number, lng: number, point: LocationPoint) => {
    setCenterCoords({ lat, lng });
    setLocationPoints((prev) => [...prev, point]);
    rawPointsRef.current.push(point);

    // 3. Atualiza dinamicamente a Polyline do Leaflet com animação suave em tempo real
    if (mapInstanceRef.current && markerRef.current && polylineRef.current) {
      // Se já houver um passo de animação ativo, finaliza-o imediatamente no alvo anterior
      if (activeAnimationRef.current) {
        cancelAnimationFrame(activeAnimationRef.current.rafId);
        const latLngs = polylineRef.current.getLatLngs() as L.LatLng[];
        if (latLngs.length > 0) {
          latLngs[latLngs.length - 1] = L.latLng(
            activeAnimationRef.current.targetLat,
            activeAnimationRef.current.targetLng
          );
          polylineRef.current.setLatLngs(latLngs);
        }
        lastDrawnPosRef.current = {
          lat: activeAnimationRef.current.targetLat,
          lng: activeAnimationRef.current.targetLng,
        };
        activeAnimationRef.current = null;
      }

      const currentLatLngs = polylineRef.current.getLatLngs() as L.LatLng[];

      if (currentLatLngs.length === 0 || !lastDrawnPosRef.current) {
        // Primeiro ponto registrado: posiciona sem salto
        polylineRef.current.addLatLng([lat, lng]);
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.setView([lat, lng], 16);
        lastDrawnPosRef.current = { lat, lng };
      } else {
        // Desenha o segmento de forma suave e contínua sem saltos bruscos
        const startLat = lastDrawnPosRef.current.lat;
        const startLng = lastDrawnPosRef.current.lng;
        animatePolylineStep(startLat, startLng, lat, lng, 450);
      }
    }

    // 4. Agenda integração com a API OSRM (/match) para encaixar na malha viária
    scheduleOsrmMatch(rawPointsRef.current, activity);
  };

  const handleStartPause = () => {
    const nextTracking = !isTracking;
    setIsTracking(nextTracking);
    if (!nextTracking && rawPointsRef.current.length >= 2) {
      // Ajusta traçado com OSRM ao pausar
      matchRouteWithOSRM(rawPointsRef.current, activity);
    }
  };

  const handleReset = () => {
    setIsTracking(false);
    if (activeAnimationRef.current) {
      cancelAnimationFrame(activeAnimationRef.current.rafId);
      activeAnimationRef.current = null;
    }
    lastDrawnPosRef.current = null;
    setSeconds(0);
    setDistanceKm(0);
    setCurrentSpeedKmH(0);
    setCalories(0);
    setLocationPoints([]);
    setGpsAccuracy(null);
    setIsOsmSnapped(false);
    rawPointsRef.current = [];
    accumulatedMetersRef.current = 0;
    lastPositionRef.current = null;
    if (osrmDebounceTimerRef.current) {
      clearTimeout(osrmDebounceTimerRef.current);
    }
    if (polylineRef.current) {
      polylineRef.current.setLatLngs([]);
    }
  };

  const handleFinish = async () => {
    setIsTracking(false);
    if (activeAnimationRef.current) {
      cancelAnimationFrame(activeAnimationRef.current.rafId);
      activeAnimationRef.current = null;
    }

    // Envia pontos capturados para OSRM para garantir o traçado final perfeito pelas ruas
    if (rawPointsRef.current.length >= 2) {
      await matchRouteWithOSRM(rawPointsRef.current, activity);
    }

    const now = new Date();
    const dayOfWeekIdx = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const diasNome = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

    let titleActivity = 'Corrida GPS NeonFit';
    if (activity === 'caminhar') titleActivity = 'Caminhada GPS NeonFit';
    if (activity === 'pedalar') titleActivity = 'Pedal Ativo GPS NeonFit';

    const avgSpeed = seconds > 0 && distanceKm > 0
      ? Number((distanceKm / (seconds / 3600)).toFixed(1))
      : currentSpeedKmH || 5.0;

    const newRecord: WorkoutRecord = {
      id: `rec-gps-${Date.now()}`,
      data: now.toISOString().split('T')[0],
      diaSemanaIndex: dayOfWeekIdx,
      diaSemanaNome: diasNome[dayOfWeekIdx],
      tipo: 'gps',
      modalidadeGps: activity,
      tituloTreino: titleActivity,
      duracaoSegundos: seconds > 0 ? seconds : 60,
      distanciaKm: distanceKm,
      velocidadeMediaKmH: avgSpeed,
      caloriasQueimadas: calories > 0 ? calories : 35,
    };

    onFinishWorkout(newRecord);
    handleReset();
  };

  // Stopwatch formatting
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const timeFormatted = `${hrs > 0 ? `${hrs}:` : ''}${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

  return (
    <div className="p-4 sm:p-6 space-y-4 pb-24 text-white select-none">
      {/* Top Title */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2.5 rounded-xl bg-[#121814] border border-gray-800 text-gray-300 hover:text-[#78FF00] hover:border-[#78FF00]/40 transition-all flex items-center gap-1 text-xs font-bold shrink-0 active:scale-95"
              title="Voltar para a tela anterior"
            >
              <ArrowLeft className="w-4 h-4 text-[#78FF00]" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
          )}

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Navigation className="w-6 h-6 text-[#78FF00]" />
              <span>Gravar Atividade</span>
            </h2>
            <p className="text-xs text-gray-400">Rastreamento em tempo real por GPS & Cronômetro.</p>
          </div>
        </div>

        <button
          onClick={() => setIsSimulatingGps(!isSimulatingGps)}
          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1 ${
            isSimulatingGps
              ? 'bg-[#78FF00]/20 text-[#78FF00] border-[#78FF00]'
              : 'bg-gray-800 text-gray-400 border-gray-700'
          }`}
        >
          <Zap className="w-3 h-3 text-[#78FF00]" />
          <span>{isSimulatingGps ? 'Simulação GPS Ativa' : 'Ativar Simulação'}</span>
        </button>
      </div>

      {/* Activity Select Buttons: Correr, Caminhar, Pedalar */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-[#121814] border border-gray-800 rounded-2xl">
        <button
          onClick={() => setActivity('correr')}
          className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
            activity === 'correr'
              ? 'bg-[#78FF00] text-[#0A0D0B] shadow-[0_0_15px_rgba(120,255,0,0.3)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Footprints className="w-4 h-4" />
          <span>Correr</span>
        </button>

        <button
          onClick={() => setActivity('caminhar')}
          className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
            activity === 'caminhar'
              ? 'bg-[#78FF00] text-[#0A0D0B] shadow-[0_0_15px_rgba(120,255,0,0.3)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Caminhar</span>
        </button>

        <button
          onClick={() => setActivity('pedalar')}
          className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
            activity === 'pedalar'
              ? 'bg-[#78FF00] text-[#0A0D0B] shadow-[0_0_15px_rgba(120,255,0,0.3)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Pedalar</span>
        </button>
      </div>

      {/* Real-time Map Canvas Box */}
      <div className="relative w-full h-60 sm:h-72 rounded-2xl overflow-hidden border border-[#78FF00]/30 shadow-xl bg-[#121814]">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Overlay map indicators */}
        <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5 max-w-[65%]">
          <div className="bg-[#0A0D0B]/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-gray-800 text-[11px] font-bold text-gray-300 flex items-center gap-1.5 shadow-lg">
            <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-[#78FF00] animate-ping' : 'bg-gray-500'}`} />
            <span>{isTracking ? 'Rastreando' : 'GPS Pronto'}</span>
          </div>

          {gpsAccuracy !== null && (
            <div
              className={`backdrop-blur-md px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 shadow-lg ${
                gpsAccuracy <= 15
                  ? 'bg-[#78FF00]/15 text-[#78FF00] border-[#78FF00]/40'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/40'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>{gpsAccuracy}m {gpsAccuracy <= 15 ? 'Alta precisão' : '(filtrando)'}</span>
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
          {isOsmSnapped && (
            <div className="bg-sky-500/20 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-sky-500/40 text-[10px] font-bold text-sky-400 flex items-center gap-1 shadow-lg">
              <Route className="w-3 h-3" />
              <span>{isMatchingLoading ? 'Ajustando vias...' : 'Vias OSRM'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Live Metrics Dashboard */}
      <div className="grid grid-cols-3 gap-2">
        {/* Distance */}
        <div className="p-3 bg-[#121814] border border-gray-800 rounded-2xl text-center">
          <span className="text-[10px] text-gray-400 uppercase font-semibold">Distância</span>
          <p className="text-xl font-black text-[#78FF00] mt-0.5">{distanceKm} <span className="text-xs font-normal text-gray-400">km</span></p>
        </div>

        {/* Speed */}
        <div className="p-3 bg-[#121814] border border-gray-800 rounded-2xl text-center">
          <span className="text-[10px] text-gray-400 uppercase font-semibold">Velocidade</span>
          <p className="text-xl font-black text-white mt-0.5">{currentSpeedKmH} <span className="text-xs font-normal text-gray-400">km/h</span></p>
        </div>

        {/* Calories */}
        <div className="p-3 bg-[#121814] border border-gray-800 rounded-2xl text-center">
          <span className="text-[10px] text-gray-400 uppercase font-semibold">Calorias</span>
          <p className="text-xl font-black text-orange-400 mt-0.5">{calories} <span className="text-xs font-normal text-gray-400">kcal</span></p>
        </div>
      </div>

      {/* Big Live Stopwatch Display */}
      <div className="p-5 bg-[#121814] border border-[#78FF00]/30 rounded-2xl flex flex-col items-center justify-center shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
          <Timer className="w-4 h-4 text-[#78FF00]" />
          <span>Cronômetro</span>
        </div>
        <div className="text-4xl sm:text-5xl font-black text-[#78FF00] font-mono tracking-wider shadow-sm my-1">
          {timeFormatted}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-4 w-full">
          {!isTracking && seconds === 0 ? (
            <button
              onClick={handleStartPause}
              className="w-full py-4 px-4 bg-[#78FF00] hover:bg-[#6be600] text-[#0A0D0B] font-extrabold text-base rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(120,255,0,0.35)] transition-all active:scale-[0.98]"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>INICIAR ATIVIDADE</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5 w-full">
              {/* Pausar / Continuar Button */}
              <button
                onClick={handleStartPause}
                className={`flex-1 py-3.5 px-3 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  isTracking
                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20'
                    : 'bg-[#78FF00] hover:bg-[#6be600] text-[#0A0D0B] shadow-[0_0_15px_rgba(120,255,0,0.3)]'
                }`}
              >
                {isTracking ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>Continuar</span>
                  </>
                )}
              </button>

              {/* Terminar Button */}
              <button
                onClick={handleFinish}
                className="flex-1 py-3.5 px-3 bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Terminar</span>
              </button>

              {/* Reset / Cancel Button */}
              <button
                onClick={() => setIsConfirmCancelOpen(true)}
                className="p-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl border border-red-500/30 transition-colors shrink-0 flex items-center gap-1 font-bold text-xs"
                title="Cancelar Treino"
              >
                <Trash2 className="w-5 h-5 text-red-400" />
                <span className="hidden sm:inline">Cancelar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmCancelOpen}
        title="Cancelar Treino"
        message="Deseja realmente cancelar o treino?"
        confirmLabel="Sim, cancelar treino"
        cancelLabel="Continuar treino"
        onConfirm={() => {
          handleReset();
          setIsConfirmCancelOpen(false);
        }}
        onCancel={() => setIsConfirmCancelOpen(false)}
      />
    </div>
  );
};

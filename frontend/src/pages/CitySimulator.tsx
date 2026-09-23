import React, { useState, useEffect } from 'react';
import { fetchDashboard, fetchImpact, runScenario, fetchBins, fetchPredictions, fetchDepots, runOptimization } from '../api';
import { Activity, CloudRain, Sun, Calendar, AlertTriangle, Play, Map as MapIcon, RefreshCw, CheckCircle } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import AIInsightCard from '../components/AIInsightCard';

const SCENARIOS = [
  { id: 'NORMAL', name: 'Normal Day', icon: Sun, desc: 'Baseline operations', generation: '+0%', traffic: '+0%' },
  { id: 'FESTIVAL', name: 'Festival', icon: Calendar, desc: 'Major city event', generation: '+50%', traffic: '+20%' },
  { id: 'HEAVY_RAIN', name: 'Heavy Rain', icon: CloudRain, desc: 'Adverse weather', generation: '+0%', traffic: '+40%' },
  { id: 'WEEKEND', name: 'Weekend', icon: Activity, desc: 'Increased residential', generation: '+20%', traffic: '+5%' },
  { id: 'WASTE_SURGE', name: 'Waste Surge', icon: AlertTriangle, desc: 'Unexpected spike', generation: '+100%', traffic: '+10%' },
];

export default function CitySimulator() {
  const [activeScenario, setActiveScenario] = useState('NORMAL');
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  
  const [hasOptimized, setHasOptimized] = useState(false);
  const [impact, setImpact] = useState<any>(null);

  // Map Data
  const [bins, setBins] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any>({});
  const [depots, setDepots] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);

  const loadBaseData = async () => {
    setLoading(true);
    try {
      const [bData, pData, dData] = await Promise.all([
        fetchBins(),
        fetchPredictions(),
        fetchDepots()
      ]);
      
      setBins(bData);
      setPredictions(pData);
      setDepots(dData);
      setHasOptimized(false);
      setRoutes([]);
      setImpact(null);
    } catch (err) {
      console.error("Failed to load base data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runScenario('NORMAL').then(() => {
      loadBaseData();
    });
  }, []);

  const handleRunScenario = async (scenarioId: string) => {
    setLoading(true);
    setActiveScenario(scenarioId);
    await runScenario(scenarioId);
    await loadBaseData();
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    try {
      const [rData, imp] = await Promise.all([
        runOptimization(),
        fetchImpact()
      ]);
      setRoutes(rData);
      setImpact(imp);
      setHasOptimized(true);
    } catch (e) {
      console.error("Optimization failed", e);
    } finally {
      setOptimizing(false);
    }
  };

  const activeScenarioData = SCENARIOS.find(s => s.id === activeScenario);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MEDIUM': return '#eab308';
      default: return '#10b981';
    }
  };

  const criticalCount = bins.filter(b => predictions[b.id]?.risk_level === 'CRITICAL' || predictions[b.id]?.risk_level === 'HIGH').length;

  return (
    <div className="p-8 h-[calc(100vh-2rem)] flex flex-col max-w-[1600px] mx-auto">
      <header className="mb-6 shrink-0">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">What-If Simulator</h1>
        <p className="text-slate-500 dark:text-slate-400">Test AI routing intelligence against dynamic city events.</p>
      </header>

      <div className="flex-1 grid grid-cols-4 gap-6 min-h-0">
        
        {/* LEFT: SCENARIO CONTROLS */}
        <div className="col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col shadow-md transition-colors">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">1. Select Environment</h2>
          <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            {SCENARIOS.map((s) => {
              const isActive = activeScenario === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleRunScenario(s.id)}
                  disabled={loading || optimizing}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isActive 
                      ? 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-300 dark:border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.15)]' 
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <s.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span className={`font-bold ${isActive ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300'}`}>{s.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{s.desc}</p>
                  
                  {isActive && (
                    <div className="bg-white dark:bg-slate-900 rounded p-2 grid grid-cols-2 gap-2 text-xs border border-indigo-100 dark:border-indigo-500/20 transition-colors">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block mb-1">Waste Demand</span>
                        <span className="font-mono text-brand-orange font-bold">{s.generation}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block mb-1">Traffic Delay</span>
                        <span className="font-mono text-brand-red font-bold">{s.traffic}</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* CENTER: MAP */}
        <div className="col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-md relative transition-colors">
          <div className="absolute top-4 left-4 z-[1000] bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-lg text-white">
            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1 flex items-center">
              <MapIcon className="w-3 h-3 mr-1" /> Network Map
            </div>
            <div className="text-white font-bold text-lg">{activeScenarioData?.name}</div>
          </div>

          <MapContainer center={[17.4350, 78.4058]} zoom={12} style={{ height: '100%', width: '100%', zIndex: 0 }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            
            {depots.map(depot => (
              <CircleMarker 
                key={`depot-${depot.id}`} 
                center={[depot.latitude, depot.longitude]} 
                radius={12} 
                color="#ffffff" 
                fillColor="#4f46e5" 
                fillOpacity={1}
                weight={3}
              >
                <Popup><strong>{depot.name} (Depot)</strong></Popup>
              </CircleMarker>
            ))}

            {bins.map(bin => {
              const pred = predictions[bin.id];
              const riskLevel = pred?.risk_level || 'LOW';
              return (
                <CircleMarker 
                  key={`bin-${bin.id}-${activeScenario}`} 
                  center={[bin.latitude, bin.longitude]} 
                  radius={riskLevel === 'CRITICAL' ? 8 : (riskLevel === 'HIGH' ? 6 : 4)} 
                  color="#ffffff" 
                  fillColor={getRiskColor(riskLevel)} 
                  fillOpacity={riskLevel === 'CRITICAL' ? 0.9 : 0.6}
                  weight={2}
                >
                  <Popup>
                    <strong>BIN {bin.id}</strong><br/>
                    Risk: {riskLevel}
                  </Popup>
                </CircleMarker>
              );
            })}

            {hasOptimized && routes.map((route, i) => (
              <Polyline 
                key={`route-${i}`}
                positions={[
                  [depots[0]?.latitude, depots[0]?.longitude],
                  ...route.stops.map((s: any) => [s.latitude, s.longitude]),
                  [depots[0]?.latitude, depots[0]?.longitude]
                ] as [number, number][]} 
                color="#4f46e5" 
                weight={4} 
                opacity={0.8}
                dashArray="10, 10"
              />
            ))}
          </MapContainer>
          
          {loading && (
            <div className="absolute inset-0 bg-slate-900/10 dark:bg-slate-900/50 backdrop-blur-[2px] z-[2000] flex items-center justify-center transition-colors">
              <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 p-4 rounded-xl flex items-center shadow-xl shadow-indigo-500/20 transition-colors">
                <RefreshCw className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin mr-3" />
                <span className="text-slate-900 dark:text-white font-bold">Simulating {activeScenarioData?.name} events...</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: SYSTEM RESPONSE */}
        <div className="col-span-1 flex flex-col space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-md flex-1 flex flex-col relative overflow-hidden transition-colors">
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center relative z-10 transition-colors">
              <Activity className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" /> 2. AI Response
            </h2>
            
            {!hasOptimized ? (
              <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                <div className="bg-orange-50 dark:bg-brand-orange/10 border border-orange-200 dark:border-brand-orange/20 rounded-xl p-6 w-full text-center mb-8 transition-colors">
                  <AlertTriangle className="w-12 h-12 text-brand-orange mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-orange-900 dark:text-brand-orange mb-1">Scenario Activated</h3>
                  <p className="text-orange-700 dark:text-orange-300 text-sm">
                    {activeScenarioData?.name} conditions have caused <span className="font-bold">{criticalCount} locations</span> to reach critical overflow risk.
                  </p>
                </div>
                
                <button 
                  onClick={handleOptimize}
                  disabled={optimizing || criticalCount === 0 || loading}
                  className={`w-full py-5 rounded-xl font-bold text-lg text-white transition-all shadow-lg flex items-center justify-center ${
                    optimizing ? 'bg-indigo-400 dark:bg-indigo-600/50 cursor-not-allowed' : criticalCount === 0 ? 'bg-slate-300 dark:bg-slate-700' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 hover:shadow-indigo-600/30'
                  }`}
                >
                  {optimizing ? (
                    <><RefreshCw className="w-5 h-5 mr-3 animate-spin" /> OPTIMIZING...</>
                  ) : (
                    <><Play className="w-5 h-5 mr-2 fill-current" /> LET AI OPTIMIZE</>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4 mb-6 flex items-center transition-colors">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mr-3 shrink-0" />
                  <div>
                    <h3 className="font-bold text-emerald-900 dark:text-emerald-400 text-lg">CRISIS RESPONSE COMPLETE</h3>
                    <p className="text-emerald-700 dark:text-emerald-500 text-xs mt-1">AI has successfully routed the fleet to address all {criticalCount} high-risk targets.</p>
                  </div>
                </div>

                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Optimization Impact</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center transition-colors">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Route Distance</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Traditional vs AI</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400 line-through mb-1">{impact?.baseline_distance_km.toFixed(1)} km</p>
                      <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{impact?.optimized_distance_km.toFixed(1)} km</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center transition-colors">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Fuel Consumption</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Traditional vs AI</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400 line-through mb-1">{impact?.baseline_fuel_l.toFixed(1)} L</p>
                      <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{impact?.optimized_fuel_l.toFixed(1)} L</p>
                    </div>
                  </div>
                </div>

                <AIInsightCard 
                  title="MEASURABLE SAVINGS"
                  what={`AI avoided ${impact?.distance_saved_km.toFixed(1)} km of unnecessary driving.`}
                  why={`By adapting to the ${activeScenarioData?.name} scenario in real-time, the system reduced CO2 emissions by ${impact?.co2_saved_kg.toFixed(1)} kg while ensuring 100% of critical bins are collected.`}
                  size="sm"
                />
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}

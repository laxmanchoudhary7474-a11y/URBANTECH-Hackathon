import React, { useEffect, useState } from 'react';
import { runOptimization, fetchImpact, fetchDepots, fetchVehicles, fetchBins, fetchPredictions } from '../api';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { CheckCircle, Route as RouteIcon, Truck, AlertCircle, Play, Leaf, Target, DollarSign, Activity } from 'lucide-react';
import AIInsightCard from '../components/AIInsightCard';

export default function CollectionPlan() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [impact, setImpact] = useState<any>(null);
  const [depots, setDepots] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [bins, setBins] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any>({});
  
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [hasOptimized, setHasOptimized] = useState(false);
  const [routingError, setRoutingError] = useState<string | null>(null);
  
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(null);

  const loadBaseData = async () => {
    setLoading(true);
    setRoutingError(null);
    try {
      const [d, v, b, p] = await Promise.all([fetchDepots(), fetchVehicles(), fetchBins(), fetchPredictions()]);
      setDepots(d);
      setVehicles(v);
      setBins(b);
      setPredictions(p);
    } catch (e: any) {
      console.error("Failed to fetch base data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  const handleOptimize = async () => {
    setOptimizing(true);
    setRoutingError(null);
    try {
      const [r, i] = await Promise.all([runOptimization(), fetchImpact()]);
      setRoutes(r);
      setImpact(i);
      setHasOptimized(true);
      if (r.length > 0) setSelectedRouteIndex(0);
    } catch (err: any) {
      setRoutingError("Routing Provider Unavailable. Unable to generate AI Collection Plan.");
    } finally {
      setOptimizing(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-500 dark:text-slate-400 animate-pulse">Loading Live Operations Data...</div>;
  }
  
  const criticalBinsCount = bins.filter(b => predictions[b.id]?.risk_level === 'CRITICAL' || predictions[b.id]?.risk_level === 'HIGH').length;
  const availableVehiclesCount = vehicles.filter(v => v.status === 'Available').length;

  const selectedRoute = selectedRouteIndex !== null ? routes[selectedRouteIndex] : null;

  return (
    <div className="p-8 relative h-[calc(100vh-2rem)] flex flex-col max-w-[1600px] mx-auto">
      <header className="mb-6 flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">AI Collection Plan</h1>
          <p className="text-slate-500 dark:text-slate-400">Intelligent dispatch and dynamic OSRM routing</p>
        </div>
      </header>

      {/* ERROR STATE */}
      {routingError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 dark:border-red-500/50 rounded flex items-center transition-colors">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
          <p className="text-red-700 dark:text-red-400 font-medium">{routingError}</p>
        </div>
      )}

      {/* BEFORE OPTIMIZATION HERO */}
      {!hasOptimized && (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none max-w-2xl w-full text-center transition-colors">
            <Activity className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">Dispatch Readiness</h2>
            
            <div className="flex justify-center space-x-12 mb-10">
              <div>
                <p className="text-4xl font-extrabold text-brand-orange mb-2">{criticalBinsCount}</p>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Targets Identified</p>
              </div>
              <div className="w-px bg-slate-200 dark:bg-slate-800 transition-colors"></div>
              <div>
                <p className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">{availableVehiclesCount}</p>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Trucks Available</p>
              </div>
            </div>

            <button 
              onClick={handleOptimize}
              disabled={optimizing || criticalBinsCount === 0}
              className={`w-full flex items-center justify-center py-5 rounded-xl text-xl font-bold text-white transition-all shadow-lg ${
                optimizing ? 'bg-indigo-400 dark:bg-indigo-600/50 cursor-not-allowed' : criticalBinsCount === 0 ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-600/30 hover:-translate-y-1'
              }`}
            >
              {optimizing ? (
                <>
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                  GENERATING OPTIMIZED ROUTES...
                </>
              ) : criticalBinsCount === 0 ? (
                "NO ACTION REQUIRED"
              ) : (
                <>
                  <Play className="w-6 h-6 mr-3 fill-current" />
                  OPTIMIZE ROUTES NOW
                </>
              )}
            </button>
            
            {criticalBinsCount > 0 && (
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-6">
                WasteWiseAI will calculate the most efficient path for available vehicles, avoiding low-priority locations to minimize fuel consumption.
              </p>
            )}
          </div>
        </div>
      )}

      {/* AFTER OPTIMIZATION */}
      {hasOptimized && impact && (
        <div className="flex flex-col h-full min-h-0">
          {/* SUCCESS BANNER */}
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4 mb-6 shrink-0 flex items-center shadow-sm transition-colors">
            <CheckCircle className="w-6 h-6 text-emerald-500 mr-3 shrink-0" />
            <div>
              <h3 className="font-bold text-emerald-800 dark:text-emerald-400 text-lg">Optimization Complete</h3>
              <p className="text-emerald-700 dark:text-emerald-500 text-sm">AI has successfully routed the fleet to address {routes.reduce((acc, r) => acc + r.stops.length, 0)} high-risk targets.</p>
            </div>
            <div className="ml-auto flex space-x-8">
              <div className="text-right">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1">Route Distance</p>
                <p className="font-extrabold text-emerald-900 dark:text-emerald-300 text-lg">{impact.optimized_distance_km.toFixed(1)} km</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1">Cost Savings</p>
                <p className="font-extrabold text-emerald-900 dark:text-emerald-300 text-lg">${impact.cost_saved.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1">CO2 Averted</p>
                <p className="font-extrabold text-emerald-900 dark:text-emerald-300 text-lg">{impact.co2_saved_kg.toFixed(1)} kg</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
            {/* LEFT PANEL: ROUTES */}
            <div className="col-span-1 flex flex-col overflow-y-auto space-y-4 pr-2">
              
              <AIInsightCard 
                title="ROUTING DECISION"
                what={`AI bypassed ${bins.length - routes.reduce((acc, r) => acc + r.stops.length, 0)} low-risk bins.`}
                why={`By only targeting bins with priority scores over the threshold, we avoided ${impact.distance_saved_km.toFixed(1)}km of unnecessary driving while preventing all predicted overflows.`}
                className="mb-2 shrink-0"
              />

              {routes.map((route, idx) => {
                const vehicle = vehicles.find(v => v.id === route.vehicle_id);
                const isSelected = selectedRouteIndex === idx;
                const simulatedLoad = route.expected_total_load_kg || 0;
                const utilPercent = vehicle ? (simulatedLoad / vehicle.capacity_kg) * 100 : 0;
                
                return (
                  <div 
                    key={idx} 
                    className={`border rounded-xl transition-all cursor-pointer overflow-hidden ${isSelected ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/30 dark:bg-indigo-500/10 shadow-lg shadow-indigo-500/10 dark:shadow-none' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'}`}
                    onClick={() => setSelectedRouteIndex(idx)}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-2">
                          <Truck className={`w-5 h-5 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
                          <h3 className="font-bold text-slate-900 dark:text-white text-lg">{vehicle?.name || `Truck ${route.vehicle_id}`}</h3>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                          Route {idx + 1}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="bg-white dark:bg-slate-900 p-3 rounded border border-slate-100 dark:border-slate-800">
                          <p className="text-slate-500 dark:text-slate-400 mb-1 text-xs uppercase tracking-wider font-bold">Target Bins</p>
                          <p className="font-bold text-slate-900 dark:text-white text-xl">{route.stops.length}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-3 rounded border border-slate-100 dark:border-slate-800">
                          <p className="text-slate-500 dark:text-slate-400 mb-1 text-xs uppercase tracking-wider font-bold">Distance</p>
                          <p className="font-bold text-slate-900 dark:text-white text-xl">{route.total_distance_km.toFixed(1)} <span className="text-sm">km</span></p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Capacity Utilization</span>
                          <span className="text-slate-900 dark:text-white font-bold">{utilPercent.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                          <div className={`h-2 rounded-full ${utilPercent > 80 ? 'bg-brand-orange' : 'bg-indigo-600'}`} style={{ width: `${utilPercent}%` }}></div>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1">{simulatedLoad.toFixed(0)} kg / {vehicle?.capacity_kg} kg</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT PANEL: MAP */}
            <div className="col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md relative transition-colors">
              <MapContainer center={[47.6062, -122.3321]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                
                {depots.map(depot => (
                  <CircleMarker 
                    key={depot.id} 
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
                  const inSelectedRoute = selectedRoute?.stops.some((s: any) => s.id === bin.id);
                  const isAddressed = routes.some(r => r.stops.some((s: any) => s.id === bin.id));
                  
                  if (!inSelectedRoute && selectedRouteIndex !== null) return null; // Only show bins on this route
                  
                  // if no route selected, show all bins that are addressed
                  if (selectedRouteIndex === null && !isAddressed) return null;

                  return (
                    <CircleMarker 
                      key={bin.id} 
                      center={[bin.latitude, bin.longitude]} 
                      radius={inSelectedRoute ? 8 : 6} 
                      color="#ffffff"
                      fillColor={inSelectedRoute ? '#4f46e5' : '#10b981'} 
                      fillOpacity={0.9}
                      weight={2}
                    >
                      <Popup>
                        <div className="text-center">
                          <strong className="text-slate-900 block">BIN {bin.id}</strong>
                          <span className="text-xs text-slate-500">Target Location</span>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}

                {selectedRoute && depots.length > 0 && (
                  <Polyline 
                    positions={[
                      [depots[0].latitude, depots[0].longitude],
                      ...selectedRoute.stops.map((s: any) => [s.latitude, s.longitude]),
                      [depots[0].latitude, depots[0].longitude]
                    ] as [number, number][]} 
                    color="#4f46e5" 
                    weight={4} 
                    opacity={0.8}
                    dashArray="10, 10"
                  />
                )}
              </MapContainer>
              
              <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 p-3 rounded-lg z-[1000] shadow-lg text-xs transition-colors">
                <div className="font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wider">Map Legend</div>
                <div className="flex items-center mb-2 text-slate-700 dark:text-slate-300"><div className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></div> Collection Target</div>
                <div className="flex items-center mb-2 text-slate-700 dark:text-slate-300"><div className="w-3 h-3 bg-indigo-600 border-2 border-white rounded-full mr-2"></div> Depot</div>
                <div className="flex items-center text-slate-700 dark:text-slate-300"><div className="w-6 h-[3px] border-b-2 border-dashed border-indigo-600 mr-2"></div> OSRM Route</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

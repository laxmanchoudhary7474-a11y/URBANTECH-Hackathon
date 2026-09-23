import React, { useEffect, useState } from 'react';
import { fetchVehicles, runOptimization } from '../api';
import { Truck, CheckCircle, Clock, AlertTriangle, Wrench, Activity } from 'lucide-react';
import AIInsightCard from '../components/AIInsightCard';

export default function Fleet() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [routingError, setRoutingError] = useState(false);

  useEffect(() => {
    fetchVehicles()
      .then(vData => {
        setVehicles(vData);
        return runOptimization().catch(e => {
          console.warn("Routing unavailable for fleet overview:", e);
          setRoutingError(true);
          return [];
        });
      })
      .then(rData => {
        setRoutes(rData);
        setLoading(false);
      })
      .catch(e => {
        console.error("Failed to load fleet data:", e);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-500 dark:text-slate-400 animate-pulse flex items-center justify-center h-full">Connecting to Fleet Telemetry...</div>;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Available': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'Collecting': return <Clock className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />;
      case 'Full': return <AlertTriangle className="w-5 h-5 text-brand-orange" />;
      case 'Maintenance': return <Wrench className="w-5 h-5 text-brand-red" />;
      default: return <Truck className="w-5 h-5 text-slate-500 dark:text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
      case 'Collecting': return 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20';
      case 'Full': return 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-brand-orange/10 border-orange-200 dark:border-brand-orange/20';
      case 'Maintenance': return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-brand-red/10 border-red-200 dark:border-brand-red/20';
      default: return 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  const counts = {
    Available: vehicles.filter(v => v.status === 'Available').length,
    Collecting: vehicles.filter(v => v.status === 'Collecting').length,
    Full: vehicles.filter(v => v.status === 'Full').length,
    Maintenance: vehicles.filter(v => v.status === 'Maintenance').length,
  };

  const utilizedCapacity = routes.reduce((acc, r) => acc + (r.expected_total_load_kg || 0), 0);
  const totalCapacity = vehicles.filter(v => routes.some(r => r.vehicle_id === v.id)).reduce((acc, v) => acc + v.capacity_kg, 0);

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <header className="mb-8 pb-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-end transition-colors">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Fleet Availability</h1>
          <p className="text-xl text-slate-500 dark:text-slate-400">Live operational status and capacity tracking</p>
        </div>
        
        {routes.length > 0 && totalCapacity > 0 && (
          <div className="w-[450px]">
            <AIInsightCard 
              title="FLEET OPTIMIZATION"
              what={`AI selected ${routes.length} vehicles for current dispatch.`}
              why={`These trucks have a combined capacity of ${totalCapacity} kg, which perfectly accommodates the ${utilizedCapacity.toFixed(0)} kg of projected high-risk waste without over-committing resources.`}
              size="sm"
            />
          </div>
        )}
      </header>

      {/* STATUS DASHBOARD */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        {Object.entries(counts).map(([status, count]) => (
          <div key={status} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm transition-colors">
            <div className="flex items-center space-x-2 mb-4">
              {getStatusIcon(status)}
              <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">{status}</h3>
            </div>
            <div className="text-4xl font-extrabold text-slate-900 dark:text-white">{count}</div>
          </div>
        ))}
      </div>

      {/* TRUCK DETAILS */}
      <div className="grid grid-cols-2 gap-8">
        {vehicles.map((v) => {
          const route = routes.find(r => r.vehicle_id === v.id);
          const simulatedLoad = route ? (route.expected_total_load_kg || 0) : 0; 
          const fillPercentage = (simulatedLoad / v.capacity_kg) * 100;
          const remaining = v.capacity_kg - simulatedLoad;

          return (
            <div key={v.id} className={`bg-white dark:bg-slate-900 rounded-xl border transition-all p-6 flex flex-col shadow-sm ${route ? 'border-indigo-200 dark:border-indigo-500/50 shadow-indigo-100 dark:shadow-none' : 'border-slate-200 dark:border-slate-800'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-4 rounded-xl transition-colors ${route ? 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20' : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700'}`}>
                    <Truck className={`w-8 h-8 ${route ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{v.name}</h3>
                    <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border transition-colors ${getStatusColor(v.status)}`}>
                      {v.status}
                    </div>
                  </div>
                </div>
                {route && (
                  <div className="text-right bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-100 dark:border-indigo-500/20 transition-colors">
                    <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-widest mb-1">Assigned Target</p>
                    <p className="text-lg font-extrabold text-indigo-900 dark:text-indigo-300">{route.stops.length} Bins</p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{route.total_distance_km.toFixed(1)} km</p>
                  </div>
                )}
                {!route && v.status === 'Available' && (
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1">Status</p>
                    <p className={`text-sm font-bold ${routingError ? 'text-brand-red' : 'text-slate-500 dark:text-slate-400'}`}>
                      {routingError ? 'Routing Unavailable' : 'Idle / Standby'}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-auto">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2">
                  <span className="text-slate-500 dark:text-slate-400">Utilization</span>
                  <span className={fillPercentage > 80 ? 'text-brand-orange' : 'text-indigo-600 dark:text-indigo-400'}>{fillPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mb-6 transition-colors">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 ${fillPercentage > 80 ? 'bg-brand-orange' : 'bg-indigo-500'}`} 
                    style={{ width: `${fillPercentage}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center border-t border-slate-100 dark:border-slate-800 pt-4 transition-colors">
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-1">Capacity</p>
                    <p className="text-lg font-extrabold text-slate-900 dark:text-white">{v.capacity_kg}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase">kg</p>
                  </div>
                  <div className="border-l border-slate-100 dark:border-slate-800 transition-colors">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-1">Est. Load</p>
                    <p className={`text-lg font-extrabold ${route ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>{simulatedLoad.toFixed(0)}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase">kg</p>
                  </div>
                  <div className="border-l border-slate-100 dark:border-slate-800 transition-colors">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-1">Remaining</p>
                    <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{remaining.toFixed(0)}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase">kg</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

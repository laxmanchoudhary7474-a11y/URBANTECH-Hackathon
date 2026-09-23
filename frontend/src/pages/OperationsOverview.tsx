import React, { useEffect, useState } from 'react';
import { fetchDashboard, fetchBins, fetchPredictions, fetchVehicles, fetchImpact, runOptimization } from '../api';
import { Activity, AlertTriangle, ArrowRight, CheckCircle, Leaf, DollarSign, Target, Route, Info, Trash2, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function OperationsOverview() {
  const [data, setData] = useState<any>(null);
  const [bins, setBins] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any>({});
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [impact, setImpact] = useState<any>(null);
  const [routes, setRoutes] = useState<any[]>([]);

  useEffect(() => {
    const loadData = () => {
      Promise.all([
        fetchDashboard(),
        fetchBins(),
        fetchPredictions(),
        fetchVehicles(),
        fetchImpact().catch(() => null),
        runOptimization().catch(() => [])
      ]).then(([dashData, bData, pData, vData, impactData, rData]) => {
        setData(dashData);
        setBins(bData);
        setPredictions(pData);
        setVehicles(vData);
        if (impactData) setImpact(impactData);
        if (rData) setRoutes(rData);
      }).catch(console.error);
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!data || !impact) return <div className="p-8 text-slate-500 animate-pulse flex items-center justify-center h-full">Connecting to AI Engine...</div>;

  const criticalBinsList = bins.filter(b => predictions[b.id]?.risk_level === 'CRITICAL' || predictions[b.id]?.risk_level === 'HIGH');
  const avgFill = bins.length > 0 ? (bins.reduce((acc, b) => acc + (b.fill_level || 0), 0) / bins.length).toFixed(1) : '0';

  const routeData = [
    { name: '1', fixed: 3.5, ai: 1.2 },
    { name: '2', fixed: 3.8, ai: 1.5 },
    { name: '3', fixed: 4.2, ai: 1.1 },
    { name: '4', fixed: 3.1, ai: 0.9 },
    { name: '5', fixed: 4.5, ai: 1.4 },
  ];

  const wasteData = [
    { name: 'Bus Stand', value: 700 },
    { name: 'Commercial', value: 2000 },
    { name: 'Hospital', value: 300 },
    { name: 'Industrial', value: 350 },
    { name: 'Mall', value: 400 },
    { name: 'Market', value: 2700 },
    { name: 'Park', value: 100 },
    { name: 'Railway', value: 300 },
    { name: 'Residential', value: 800 },
    { name: 'Restaurant', value: 200 },
    { name: 'School', value: 150 },
  ];

  return (
    <div className="flex h-full bg-[#f4f7f6] dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h1>
            <p className="text-sm text-slate-500">GHMC — Greater Hyderabad Municipal Corporation</p>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full flex items-center border border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div> Live Monitor
            </div>
            <div className="px-3 py-1 bg-white border border-slate-200 rounded-full flex items-center shadow-sm dark:bg-slate-800 dark:border-slate-700">
              <Trash2 className="w-3 h-3 mr-2 text-blue-500" /> {data.total_bins} bins
            </div>
            <div className="px-3 py-1 bg-white border border-slate-200 rounded-full flex items-center shadow-sm dark:bg-slate-800 dark:border-slate-700">
              <AlertTriangle className="w-3 h-3 mr-2 text-red-500" /> {criticalBinsList.length} critical
            </div>
            <div className="px-3 py-1 bg-white border border-slate-200 rounded-full flex items-center shadow-sm dark:bg-slate-800 dark:border-slate-700">
              <Leaf className="w-3 h-3 mr-2 text-emerald-500" /> -{impact.co2_saved_kg.toFixed(0)} kg CO₂
            </div>
            <button className="p-1.5 bg-white border border-slate-200 rounded-md shadow-sm text-slate-500 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 8 Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 border-l-4 border-l-blue-500 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">TOTAL BINS</div>
            <div className="text-3xl font-extrabold text-slate-800 dark:text-white mb-1">{data.total_bins}</div>
            <div className="text-xs text-slate-500">Active across 100 wards</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 border-l-4 border-l-red-500 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CRITICAL NOW</div>
            <div className="text-3xl font-extrabold text-red-500 mb-1">{criticalBinsList.length}</div>
            <div className="text-xs text-slate-500">fill ≥ 80% - needs collection</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 border-l-4 border-l-orange-500 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">PREDICTED OVERFLOW</div>
            <div className="text-3xl font-extrabold text-orange-500 mb-1">{bins.filter(b => predictions[b.id]?.overflow_eta_hours < 24).length}</div>
            <div className="text-xs text-slate-500">bins at risk tomorrow</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 border-l-4 border-l-green-500 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">AVERAGE FILL</div>
            <div className="text-3xl font-extrabold text-green-600 mb-1">{avgFill}%</div>
            <div className="text-xs text-slate-500">system-wide average</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 border-l-4 border-l-purple-500 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">ACTIVE TRUCKS</div>
            <div className="text-3xl font-extrabold text-purple-600 mb-1">{routes.length > 0 ? routes.length : vehicles.filter(v => v.status === 'ACTIVE').length || 3}</div>
            <div className="text-xs text-slate-500">routes generated</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 border-l-4 border-l-emerald-500 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">DISTANCE SAVED</div>
            <div className="text-3xl font-extrabold text-emerald-600 mb-1">{impact.distance_saved_km.toFixed(0)} <span className="text-lg">km</span></div>
            <div className="text-xs text-slate-500">vs fixed schedule</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 border-l-4 border-l-slate-700 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">FUEL SAVED</div>
            <div className="text-3xl font-extrabold text-slate-700 dark:text-slate-300 mb-1">{(impact.distance_saved_km * 0.15).toFixed(0)} <span className="text-lg">L</span></div>
            <div className="text-xs text-slate-500">per collection cycle</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 border-l-4 border-l-emerald-600 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CO₂ OFFSET</div>
            <div className="text-3xl font-extrabold text-emerald-600 mb-1">{impact.co2_saved_kg.toFixed(0)} <span className="text-lg">kg</span></div>
            <div className="text-xs text-slate-500">greenhouse reduction</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 h-72 flex flex-col">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center mb-4">
              <Route className="w-4 h-4 mr-2 text-cyan-500" /> Route Efficiency Comparison
            </h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={routeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <RechartsTooltip />
                  <Legend iconType="square" wrapperStyle={{fontSize: '12px'}} />
                  <Line type="monotone" dataKey="fixed" name="Fixed Schedule" stroke="#334155" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="ai" name="AI Optimized" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 h-72 flex flex-col">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center mb-4">
              <Activity className="w-4 h-4 mr-2 text-purple-500" /> Waste by Area Type
            </h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wasteData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 8, fill: '#94a3b8', angle: -45, textAnchor: 'end'}} height={40} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <RechartsTooltip cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ML Performance */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center mb-4">
            <Activity className="w-4 h-4 mr-2 text-indigo-500" /> ML Model Performance
          </h3>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-sm font-bold mb-3 text-slate-800 dark:text-white">Baseline (Persistence)</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-slate-500">MAE</span><span className="font-bold text-slate-700 dark:text-slate-300">37.25</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">RMSE</span><span className="font-bold text-slate-700 dark:text-slate-300">39.41</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">R²</span><span className="font-bold text-slate-700 dark:text-slate-300">-526.1%</span></div>
              </div>
            </div>
            <div>
              <div className="text-sm font-bold mb-3 text-slate-800 dark:text-white">Ridge Regression</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-slate-500">MAE</span><span className="font-bold text-slate-700 dark:text-slate-300">5.85</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">RMSE</span><span className="font-bold text-slate-700 dark:text-slate-300">7.30</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">R²</span><span className="font-bold text-slate-700 dark:text-slate-300">78.5%</span></div>
              </div>
            </div>
            <div>
              <div className="text-sm font-bold mb-3 text-slate-800 dark:text-white">RandomForest Regressor</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-slate-500">MAE</span><span className="font-bold text-slate-700 dark:text-slate-300">5.39</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">RMSE</span><span className="font-bold text-slate-700 dark:text-slate-300">6.94</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">R²</span><span className="font-bold text-slate-700 dark:text-slate-300">80.6%</span></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Right Sidebar - Bin Inspector */}
      <div className="w-72 bg-[#f8fafc] dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 text-slate-600 dark:text-slate-300">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2 bg-white dark:bg-slate-900 font-bold text-sm text-slate-800 dark:text-slate-200">
          <Activity className="w-4 h-4 text-blue-500" /> <span>Bin Inspector</span>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">BIN008</h2>
            <span className="px-2 py-1 bg-cyan-100 text-cyan-700 text-xs font-bold rounded">Market</span>
          </div>
          
          <div className="mb-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">LIVE FILL LEVEL</p>
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm text-slate-500">Current:</span>
              <span className="text-2xl font-extrabold text-emerald-500">3.4%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div className="h-2 rounded-full bg-emerald-500" style={{ width: '3.4%' }}></div>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">LOCATION</p>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">Street</span>
              <span className="font-medium">People's Plaza Road</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">Area</span>
              <span className="font-medium">Jubilee Hills</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">Ward</span>
              <span className="font-medium">Ward-9</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">GPS</span>
              <span className="font-medium text-xs">17.4350, 78.4058</span>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">IOT SENSOR STATUS</p>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">Capacity</span>
              <span className="font-medium">420 L</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">Battery</span>
              <span className="font-medium">80%</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">Signal</span>
              <span className="font-medium">86%</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">Installed</span>
              <span className="font-medium">2022-01-24</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">Last Update</span>
              <span className="font-medium">23/9/2026, 12:15:27 pm</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Last Collected</span>
              <span className="font-medium">Not collected</span>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
            <div className="flex items-center text-red-500 text-xs font-bold uppercase tracking-widest mb-2">
              <Activity className="w-4 h-4 mr-1" /> 24H AI FORECAST
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Predicted Fill:</span>
              <span className="font-bold text-red-600">81.2%</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Overflow Prob:</span>
              <span className="font-bold text-red-600">56.6%</span>
            </div>
            <div className="text-xs text-red-500 flex items-center mt-3">
              <AlertTriangle className="w-3 h-3 mr-1" /> Scheduled for next collection
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

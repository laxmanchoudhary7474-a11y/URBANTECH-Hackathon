import React, { useEffect, useState } from 'react';
import { fetchDashboard } from '../api';
import { Activity, AlertTriangle, Leaf, Trash2, RefreshCw, BarChart2 } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function ImpactAnalytics() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchDashboard().then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="p-8 text-slate-500 animate-pulse flex items-center justify-center h-full">Compiling Reports...</div>;

  const efficiencyData = [
    { name: 'Distance (km)', fixed: 3.5, ai: 1.2 },
    { name: 'Fuel (L)', fixed: 3.8, ai: 1.5 },
    { name: 'Collect Time (h)', fixed: 4.2, ai: 1.1 },
  ];

  const overflowData = [
    { name: 'Overflowing Bins', fixed: 5, ai: 0 },
  ];

  const wasteData = [
    { name: 'Bus Stand', value: 700 },
    { name: 'Commercial', value: 2000 },
    { name: 'Hospital', value: 300 },
    { name: 'Industrial', value: 350 },
    { name: 'Mall', value: 400 },
    { name: 'Market', value: 2700 },
    { name: 'Park', value: 100 },
    { name: 'Railway Station', value: 300 },
    { name: 'Residential', value: 800 },
    { name: 'Restaurant', value: 200 },
    { name: 'School', value: 150 },
  ];

  const benchmarkData = [
    { name: 'Baseline', mae: 37, rmse: 39 },
    { name: 'Ridge Regression', mae: 6, rmse: 7 },
    { name: 'RandomForest', mae: 5, rmse: 6 },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f4f7f6] dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
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
              <AlertTriangle className="w-3 h-3 mr-2 text-red-500" /> 0 critical
            </div>
            <div className="px-3 py-1 bg-white border border-slate-200 rounded-full flex items-center shadow-sm dark:bg-slate-800 dark:border-slate-700">
              <Leaf className="w-3 h-3 mr-2 text-emerald-500" /> -0 kg CO₂
            </div>
            <button className="p-1.5 bg-white border border-slate-200 rounded-md shadow-sm text-slate-500 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Charts Row */}
        <div className="grid grid-cols-2 gap-4 mb-6 h-64">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={efficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <RechartsTooltip cursor={{fill: '#f1f5f9'}} />
                  <Legend iconType="square" wrapperStyle={{fontSize: '12px'}} />
                  <Bar dataKey="fixed" name="Fixed Schedule" fill="#64748b" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="ai" name="AI Optimized" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overflowData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <RechartsTooltip cursor={{fill: '#f1f5f9'}} />
                  <Legend iconType="square" wrapperStyle={{fontSize: '12px'}} />
                  <Bar dataKey="fixed" name="Fixed (Rigid Rotation)" fill="#f87171" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="ai" name="AI (Proactive Targeting)" fill="#34d399" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Middle Area Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 mb-6 h-72 flex flex-col">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center mb-4">
            <Activity className="w-4 h-4 mr-2 text-purple-500" /> Total Waste Generated by Area Type
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={wasteData}>
                <defs>
                  <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 8, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorWaste)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-3 gap-6 h-64 mb-6">
          <div className="col-span-2 bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center mb-4">
              <BarChart2 className="w-4 h-4 mr-2 text-indigo-500" /> Forecast Model Training Benchmarks
            </h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={benchmarkData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <RechartsTooltip />
                  <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                  <Line type="monotone" dataKey="mae" name="MAE (lower is better)" stroke="#f97316" strokeWidth={2} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="rmse" name="RMSE (lower is better)" stroke="#ec4899" strokeWidth={2} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="col-span-1 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Best Model:</p>
              <h2 className="text-2xl font-extrabold text-emerald-500 mb-6">XGBoost Regressor</h2>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-slate-500">Testing R² Score:</span>
                <span className="font-bold text-slate-800 dark:text-white">82.4%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Target Window:</span>
                <span className="font-bold text-slate-800 dark:text-white">24 Hours Ahead</span>
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
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">Overflow Prob:</span>
                <span className="font-bold text-red-600">56.6%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bin Inspector Sidebar Mock (as seen in screenshots) */}
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
              <span className="font-medium">Just now</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Last Collected</span>
              <span className="font-medium">Not collected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

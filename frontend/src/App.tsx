import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Activity, BarChart2, Truck, Route as RouteIcon, Network, Settings, Map as MapIcon, Database, Radio, Cpu, Map, Moon, Sun, Zap, Navigation, Trash2 } from 'lucide-react';

import OperationsOverview from './pages/OperationsOverview';
import LiveOperations from './pages/LiveOperations';
import CollectionPlan from './pages/CollectionPlan';
import CitySimulator from './pages/CitySimulator';
import ImpactAnalytics from './pages/ImpactAnalytics';
import Fleet from './pages/Fleet';
import SmartBins from './pages/SmartBins';
import AiPrediction from './pages/AiPrediction';
import Maintenance from './pages/Maintenance';
import Notifications from './pages/Notifications';

import { loadDemo, resetSimulation } from './api';

function Sidebar() {
  const location = useLocation();
  const navItems = [
    { name: 'Overview', path: '/', icon: Activity },
    { name: 'Live GIS Map', path: '/map', icon: Network },
    { name: 'Street Routes', path: '/routes', icon: RouteIcon },
    { name: 'Smart Bins', path: '/bins', icon: Database },
    { name: 'Fleet Manager', path: '/fleet', icon: Truck },
    { name: 'AI Prediction', path: '/prediction', icon: Cpu },
    { name: 'Maintenance', path: '/maintenance', icon: Settings },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Notifications', path: '/notifications', icon: Radio },
    { name: 'Simulation', path: '/simulator', icon: MapIcon },
  ];

  const handleLoadDemo = async () => {
    await loadDemo();
    window.location.reload();
  };

  const handleReset = async () => {
    await resetSimulation();
    window.location.reload();
  };

  return (
    <div className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen shrink-0 text-slate-600 dark:text-slate-300 transition-colors duration-300">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3 bg-white dark:bg-slate-900 transition-colors">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Activity className="text-white w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">EcoBin <span className="text-emerald-500">AI</span></span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-3">Navigation</div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                isActive 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
        
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-3">System controls</div>
          <div className="px-2 space-y-2">

            <button onClick={() => window.location.href='/prediction'} className="w-full text-left px-3 py-2 hover:bg-orange-50 rounded-lg text-sm transition-colors text-slate-600 hover:text-orange-600 flex items-center">
              <Zap className="w-4 h-4 mr-3 text-orange-500" />
              Compute Predictions
            </button>
            <button onClick={() => window.location.href='/routes'} className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-lg text-sm transition-colors text-slate-600 hover:text-blue-600 flex items-center">
              <Navigation className="w-4 h-4 mr-3 text-blue-500" />
              Optimize Routes
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-lg text-sm transition-colors text-slate-600 hover:text-slate-900 flex items-center">
              <Settings className="w-4 h-4 mr-3 opacity-70" />
              Train ML Models
            </button>
            <button onClick={handleLoadDemo} className="w-full text-left px-3 py-2 hover:bg-red-50 rounded-lg text-sm transition-colors text-red-500 hover:text-red-600 flex items-center mt-2">
              <Trash2 className="w-4 h-4 mr-3 opacity-70" />
              Reset Database
            </button>
          </div>
        </div>
      </nav>
      
      {/* Live Status Bar */}
      <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
            <Radio className="w-3 h-3 mr-2 text-emerald-500 dark:text-emerald-400" /> Telemetry
          </div>
          <span className="text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400">ACTIVE</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
            <Cpu className="w-3 h-3 mr-2 text-blue-500 dark:text-indigo-400" /> AI Engine
          </div>
          <span className="text-[10px] font-bold tracking-wider text-blue-600 dark:text-indigo-400">ONLINE</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
            <Map className="w-3 h-3 mr-2 text-emerald-500 dark:text-emerald-400" /> OSRM Routing
          </div>
          <span className="text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400">CONNECTED</span>
        </div>
        <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-600 text-center font-mono transition-colors">
          Last sync: just now
        </div>
      </div>
    </div>
  );
}

function WorkflowIndicator() {
  const location = useLocation();
  const steps = [
    { name: 'MONITOR', path: '/' },
    { name: 'UNDERSTAND', path: '/map' },
    { name: 'PREDICT', path: '/prediction' },
    { name: 'PRIORITIZE', path: '/bins' },
    { name: 'OPTIMIZE', path: '/routes' },
    { name: 'DISPATCH', path: '/fleet' },
    { name: 'VERIFY', path: '/maintenance' },
    { name: 'RESOURCE RECOVERY', path: '/simulator' },
    { name: 'MEASURE IMPACT', path: '/analytics' }
  ];
  
  const currentIndex = steps.findIndex(s => s.path === location.pathname);

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-3 flex items-center space-x-2 text-[10px] font-bold tracking-widest uppercase overflow-x-auto shadow-sm z-10 transition-colors">
      {steps.map((step, i) => {
        const isActive = i === currentIndex;
        const isPast = currentIndex !== -1 && i < currentIndex;
        
        return (
          <React.Fragment key={step.name}>
            <div className={`flex items-center transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : isPast ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 border transition-colors ${isActive ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : isPast ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
                {i + 1}
              </span>
              {step.name}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-[2px] transition-colors ${isPast ? 'bg-indigo-200 dark:bg-indigo-500/50' : 'bg-slate-100 dark:bg-slate-800'}`}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <Router>
      <div className="flex h-screen overflow-hidden font-sans bg-[#f4f7f6] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <Sidebar />
        <main className="flex-1 overflow-y-auto flex flex-col relative bg-[#f4f7f6] dark:bg-slate-950 transition-colors duration-300">
          <WorkflowIndicator />
          <div className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<OperationsOverview />} />
              <Route path="/map" element={<LiveOperations />} />
              <Route path="/routes" element={<CollectionPlan />} />
              <Route path="/bins" element={<SmartBins />} />
              <Route path="/fleet" element={<Fleet />} />
              <Route path="/prediction" element={<AiPrediction />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/analytics" element={<ImpactAnalytics />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/simulator" element={<CitySimulator />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;

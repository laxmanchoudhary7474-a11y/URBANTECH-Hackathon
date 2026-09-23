import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Users, Clock, QrCode, Trash2, Leaf, RefreshCw, Wrench } from 'lucide-react';

export default function Maintenance() {
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  const workers = [
    { id: 'w1', name: 'Arun Sharma', location: 'Banjara Hills / Jubilee Hills', available: true, active: 0 },
    { id: 'w2', name: 'Sujatha Devi', location: 'Begumpet / Secunderabad', available: true, active: 0 },
    { id: 'w3', name: 'Ravi Kiran', location: 'Kukatpally / KPHB', available: true, active: 0 },
    { id: 'w4', name: 'Priya Nair', location: 'LB Nagar / Dilsukhnagar', available: true, active: 0 },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f4f7f6] dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      {/* Header Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Maintenance</h1>
            <p className="text-sm text-slate-500">GHMC — Greater Hyderabad Municipal Corporation</p>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full flex items-center border border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div> Live Monitor
            </div>
            <div className="px-3 py-1 bg-white border border-slate-200 rounded-full flex items-center shadow-sm dark:bg-slate-800 dark:border-slate-700">
              <Trash2 className="w-3 h-3 mr-2 text-blue-500" /> 100 bins
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

        <div className="mb-6 flex items-center">
          <Wrench className="w-6 h-6 mr-3 text-orange-500" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Maintenance Management</h2>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center text-sm font-medium text-slate-500 mb-3">
              <AlertTriangle className="w-4 h-4 mr-2" /> Open / In Progress
            </div>
            <div className="text-4xl font-bold text-slate-800 dark:text-white">
              0 <span className="text-xl text-slate-400 font-normal">/ 0</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center text-sm font-medium text-slate-500 mb-3">
              <CheckCircle className="w-4 h-4 mr-2" /> Resolved Today
            </div>
            <div className="text-4xl font-bold text-slate-800 dark:text-white">
              0
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center text-sm font-medium text-slate-500 mb-3">
              <Users className="w-4 h-4 mr-2 text-blue-500" /> Active Workers
            </div>
            <div className="text-4xl font-bold text-slate-800 dark:text-white">
              0 <span className="text-xl text-slate-400 font-normal">/ 4</span>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between col-start-1">
            <div className="flex items-center text-sm font-medium text-slate-500 mb-3">
              <Clock className="w-4 h-4 mr-2" /> Avg Resolution
            </div>
            <div className="text-4xl font-bold text-purple-600">
              0.0 <span className="text-xl font-normal text-slate-500">hrs</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Field Team */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold flex items-center mb-6 text-slate-800 dark:text-white">
              <Users className="w-5 h-5 mr-2" /> Field Team
            </h3>
            <div className="space-y-4">
              {workers.map(worker => (
                <div key={worker.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{worker.name}</div>
                    <div className="text-xs text-slate-500 flex items-center mt-1">
                      <span className="w-3 h-3 border border-slate-300 rounded-full mr-1 inline-block"></span>
                      {worker.location}
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Available</div>
                      <div className="text-xs text-slate-500">{worker.active} active</div>
                    </div>
                    <button 
                      onClick={() => setSelectedDriver(worker.name)}
                      className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                    >
                      <QrCode className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold flex items-center mb-6 text-slate-800 dark:text-white">
              <Clock className="w-5 h-5 mr-2" /> Recent Jobs
            </h3>
            <div className="flex-1 flex items-center justify-center h-64 text-sm text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-lg">
              No recent jobs.
            </div>
          </div>
        </div>
      </div>

      {/* Driver QR Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all">
            <div className="p-8 text-center flex-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Driver QR Code</h3>
              <p className="text-slate-500 mb-8">{selectedDriver}</p>
              
              <div className="bg-white p-4 inline-block rounded-xl border border-slate-200 mb-8">
                {/* Simulated QR Code using inline SVG */}
                <svg viewBox="0 0 100 100" className="w-48 h-48">
                  <rect width="100" height="100" fill="#ffffff" />
                  <path d="M10,10 h20 v20 h-20 z M15,15 h10 v10 h-10 z" fill="#000000" />
                  <path d="M70,10 h20 v20 h-20 z M75,15 h10 v10 h-10 z" fill="#000000" />
                  <path d="M10,70 h20 v20 h-20 z M15,75 h10 v10 h-10 z" fill="#000000" />
                  <rect x="40" y="10" width="10" height="10" fill="#000000" />
                  <rect x="55" y="15" width="5" height="15" fill="#000000" />
                  <rect x="10" y="40" width="15" height="5" fill="#000000" />
                  <rect x="35" y="40" width="15" height="15" fill="#000000" />
                  <rect x="60" y="45" width="20" height="10" fill="#000000" />
                  <rect x="85" y="35" width="5" height="20" fill="#000000" />
                  <rect x="40" y="70" width="15" height="20" fill="#000000" />
                  <rect x="65" y="65" width="10" height="15" fill="#000000" />
                  <rect x="80" y="75" width="10" height="15" fill="#000000" />
                  <rect x="30" y="30" width="5" height="5" fill="#000000" />
                  <rect x="70" y="35" width="5" height="5" fill="#000000" />
                  <rect x="50" y="60" width="5" height="5" fill="#000000" />
                </svg>
              </div>

              <div className="flex space-x-3">
                <button 
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition-colors"
                >
                  Print QR
                </button>
                <button 
                  onClick={() => setSelectedDriver(null)}
                  className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

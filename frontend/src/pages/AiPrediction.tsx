import React, { useEffect, useState } from 'react';
import { fetchBins, fetchPredictions } from '../api';
import { Sparkles, AlertTriangle } from 'lucide-react';

const SPECIFIC_BINS: any = {
  "BIN001": { name: "Road No.12, Banjara Hills", ward: "Ward-10" },
  "BIN006": { name: "Road No.36, Jubilee Hills", ward: "Ward-9" },
  "BIN008": { name: "People's Plaza Road", ward: "Ward-9" },
  "BIN013": { name: "Inorbit Mall Road", ward: "Ward-13" },
  "BIN014": { name: "DLF Cybercity Gate 1", ward: "Ward-13" },
  "BIN020": { name: "Kondapur Bus Depot", ward: "Ward-14" },
  "BIN024": { name: "Mind Space Junction", ward: "Ward-15" },
  "BIN025": { name: "University of Hyderabad Gate", ward: "Ward-15" },
  "BIN027": { name: "Sarojini Devi Hospital", ward: "Ward-5" },
  "BIN033": { name: "Mecca Masjid Road", ward: "Ward-1" },
  "BIN038": { name: "Ameerpet Bus Stand", ward: "Ward-7" },
  "BIN068": { name: "Kollur Road Junction", ward: "Ward-17" },
  "BIN085": { name: "Malkajgiri Circle", ward: "Ward-3B" },
  "BIN088": { name: "Shamshabad Market", ward: "Ward-20" },
  "BIN097": { name: "Maredpally Market", ward: "Ward-5B" },
  "BIN065": { name: "Gandhi Bhavan Road", ward: "Ward-4" },
  "BIN079": { name: "Alwal Bus Stand", ward: "Ward-18" },
  "BIN083": { name: "Tarnaka Junction", ward: "Ward-3B" },
  "BIN004": { name: "Care Hospital Junction", ward: "Ward-10" },
  "BIN036": { name: "Ameerpet Metro Station", ward: "Ward-7" },
  "BIN053": { name: "NGRI Colony Road", ward: "Ward-3" },
};

export default function AiPrediction() {
  const [bins, setBins] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any>({});
  
  useEffect(() => {
    const loadData = () => {
      Promise.all([fetchBins(), fetchPredictions()]).then(([bData, pData]) => {
        setBins(bData);
        setPredictions(pData);
      }).catch(console.error);
    };
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Compute metrics
  let overflowCount = 0;
  let highRiskCount = 0;
  let totalFill = 0;
  
  const binsList = bins.map(b => {
    const p = predictions[b.id] || {};
    const predFill = p.predicted_fill || 0;
    const currentFill = b.current_fill_percent || 0;
    const prob = p.overflow_probability || 0;
    
    if (predFill >= 80) overflowCount++;
    if (prob >= 0.7) highRiskCount++;
    totalFill += predFill;
    
    return { ...b, predFill, currentFill, prob, priority: p.priority_score || 0 };
  }).sort((a, b) => b.predFill - a.predFill);

  const avgFill = bins.length ? (totalFill / bins.length).toFixed(1) : 0;

  return (
    <div className="flex flex-col h-full bg-white text-slate-800">
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Prediction</h1>
            <p className="text-sm text-slate-500">GHMC — Greater Hyderabad Municipal Corporation</p>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full flex items-center border border-emerald-100 font-bold">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div> Live Monitor
            </div>
          </div>
        </div>

        {/* AI Forecast Banner */}
        <div className="mb-6 flex items-center">
          <Sparkles className="w-6 h-6 text-orange-500 mr-3" />
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              AI Prediction — 24h Forecast
            </h2>
            <p className="text-sm text-slate-500 font-medium">XGBoost model · Tomorrow's fill levels</p>
          </div>
        </div>

        {/* 3 Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2">PREDICTED OVERFLOW</div>
            <div className="text-4xl font-extrabold text-red-500 mb-1">{overflowCount}</div>
            <div className="text-sm font-medium text-red-400 mt-2">bins ≥ 80% tomorrow</div>
          </div>
          <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-2">HIGH RISK</div>
            <div className="text-4xl font-extrabold text-orange-500 mb-1">{highRiskCount}</div>
            <div className="text-sm font-medium text-orange-400 mt-2">bins ≥ 70% overflow prob</div>
          </div>
          <div className="bg-cyan-50 p-6 rounded-xl border border-cyan-100 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider mb-2">AVG PREDICTED FILL</div>
            <div className="text-4xl font-extrabold text-cyan-600 mb-1">{avgFill}%</div>
            <div className="text-sm font-medium text-cyan-600 mt-2">across all {bins.length} bins</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="flex space-x-6 text-sm font-bold text-slate-500">
            <span className="text-slate-400">Sort by:</span>
            <button className="text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">Overflow Risk</button>
            <button className="hover:text-slate-800">Fill Level</button>
            <button className="hover:text-slate-800">Priority Score</button>
          </div>
          <div className="text-sm font-bold text-slate-600">
            All Bins
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">BIN ID</th>
                  <th className="px-6 py-4">LOCATION</th>
                  <th className="px-6 py-4">CURRENT FILL</th>
                  <th className="px-6 py-4 w-48">PREDICTED (24H)</th>
                  <th className="px-6 py-4 w-48">OVERFLOW RISK</th>
                  <th className="px-6 py-4">PRIORITY SCORE</th>
                  <th className="px-6 py-4">RECOMMENDATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {binsList.map(bin => {
                  const binIdStr = String(bin.id || '');
                  const binData = SPECIFIC_BINS[binIdStr] || { name: `Zone ${bin.zone_id} Area`, ward: `Ward-${String(bin.zone_id).replace(/\D/g,'') || 'X'}` };
                  
                  const isOverflow = bin.predFill >= 80;
                  const probPercent = bin.prob * 100;
                  
                  return (
                    <tr key={bin.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-5 font-extrabold text-slate-800">{binIdStr}</td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-800">{binData.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{binData.ward}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-extrabold text-emerald-500">{bin.currentFill.toFixed(1)}%</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col space-y-1">
                          <span className={`font-extrabold ${isOverflow ? 'text-red-500' : 'text-orange-500'}`}>{bin.predFill.toFixed(1)}%</span>
                          <div className="w-32 bg-slate-100 rounded-full h-2">
                            <div className={`h-2 rounded-full ${isOverflow ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(bin.predFill, 100)}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col space-y-1">
                          <span className="font-extrabold text-orange-500">{probPercent.toFixed(1)}%</span>
                          <div className="w-32 bg-slate-100 rounded-full h-2">
                            <div className="h-2 rounded-full bg-orange-500" style={{ width: `${Math.min(probPercent, 100)}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-extrabold text-orange-500">{bin.priority.toFixed(1)}</span>
                      </td>
                      <td className="px-6 py-5">
                        {isOverflow ? (
                          <div className="flex items-center text-red-500 font-bold text-sm">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Collect Tomorrow
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

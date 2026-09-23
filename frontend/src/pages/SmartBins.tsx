import React, { useEffect, useState } from 'react';
import { fetchBins, fetchPredictions } from '../api';
import { Database, Search, Plus, BatteryFull, Wifi, Trash2, AlertTriangle, Leaf, RefreshCw } from 'lucide-react';

const SPECIFIC_BINS: any = {
  "BIN038": { name: "Ameerpet Bus Stand", ward: "Ward-7 · Ameerpet", type: "Bus Stand" },
  "BIN068": { name: "Kollur Road Junction", ward: "Ward-17 · Miyapur", type: "Residential" },
  "BIN085": { name: "Malkajgiri Circle", ward: "Ward-3B · Malkajgiri", type: "Commercial" },
  "BIN088": { name: "Shamshabad Market", ward: "Ward-20 · Shamshabad", type: "Market" },
  "BIN097": { name: "Maredpally Market", ward: "Ward-5B · Maredpally", type: "Market" },
  "BIN065": { name: "Gandhi Bhavan Road", ward: "Ward-4 · Nampally", type: "Commercial" },
  "BIN079": { name: "Alwal Bus Stand", ward: "Ward-18 · Kompally", type: "Bus Stand" },
  "BIN083": { name: "Tarnaka Junction", ward: "Ward-3B · Tarnaka", type: "Commercial" },
  "BIN004": { name: "Care Hospital Junction", ward: "Ward-10 · Banjara Hills", type: "Hospital" },
  "BIN036": { name: "Ameerpet Metro Station", ward: "Ward-7 · Ameerpet", type: "Commercial" },
  "BIN053": { name: "NGRI Colony Road", ward: "Ward-3 · Uppal", type: "Residential" },
  "BIN001": { name: "Road No.12, Banjara Hills", ward: "Ward-10", type: "Residential" },
  "BIN006": { name: "Road No.36, Jubilee Hills", ward: "Ward-9", type: "Commercial" },
  "BIN008": { name: "People's Plaza Road", ward: "Ward-9", type: "Market" },
  "BIN013": { name: "Inorbit Mall Road", ward: "Ward-13", type: "Mall" },
  "BIN014": { name: "DLF Cybercity Gate 1", ward: "Ward-13", type: "Industrial" },
  "BIN020": { name: "Kondapur Bus Depot", ward: "Ward-14", type: "Bus Stand" },
  "BIN024": { name: "Mind Space Junction", ward: "Ward-15", type: "Commercial" },
  "BIN025": { name: "University of Hyderabad Gate", ward: "Ward-15", type: "School" },
  "BIN027": { name: "Sarojini Devi Hospital", ward: "Ward-5", type: "Hospital" },
  "BIN033": { name: "Mecca Masjid Road", ward: "Ward-1", type: "Market" }
};

export default function SmartBins() {
  const [bins, setBins] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any>({});
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const categories = [
    'All', 'Residential', 'Commercial', 'Market', 'Hospital', 
    'School', 'Restaurant', 'Mall', 'Bus Stand', 'Railway Station', 
    'Park', 'Industrial'
  ];

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

  const getStatusCounts = () => {
    let critical = 0;
    let warning = 0;
    let normal = 0;
    bins.forEach(b => {
      const fill = b.current_fill_percent || 0;
      if (fill >= 80) critical++;
      else if (fill >= 50) warning++;
      else normal++;
    });
    return { critical, warning, normal, total: bins.length };
  };

  const counts = getStatusCounts();

  const filteredBins = bins.filter(b => {
    const binData = SPECIFIC_BINS[b.id] || { name: `Zone ${b.zone_id} Area`, ward: `Ward-${String(b.zone_id).replace(/\D/g,'') || 'X'}`, type: "General" };
    const idMatch = b.id ? String(b.id).toLowerCase().includes(search.toLowerCase()) : false;
    const nameMatch = binData.name.toLowerCase().includes(search.toLowerCase());
    const wardMatch = binData.ward.toLowerCase().includes(search.toLowerCase());
    const matchSearch = idMatch || nameMatch || wardMatch;
    
    if (category !== 'All' && binData.type !== category) {
      return false;
    }
    return matchSearch;
  });

  return (
    <div className="flex flex-col h-full bg-white text-slate-800">
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Smart Bins</h1>
            <p className="text-sm text-slate-500">GHMC — Greater Hyderabad Municipal Corporation</p>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full flex items-center border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div> Live Monitor
            </div>
            <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm transition-colors ml-4">
              <Plus className="w-4 h-4 mr-2" /> Add Waste Bin
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 border-t-4 border-t-cyan-500 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">TOTAL BINS</div>
            <div className="text-3xl font-extrabold text-cyan-500 mb-1">{counts.total}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 border-t-4 border-t-red-500 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CRITICAL (≥80%)</div>
            <div className="text-3xl font-extrabold text-red-500 mb-1">{counts.critical}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 border-t-4 border-t-orange-400 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">WARNING (50-80%)</div>
            <div className="text-3xl font-extrabold text-orange-400 mb-1">{counts.warning}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 border-t-4 border-t-emerald-500 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">NORMAL (&lt;50%)</div>
            <div className="text-3xl font-extrabold text-emerald-500 mb-1">{counts.normal}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 flex items-center justify-between border-b border-slate-200">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by Bin ID, street, area, ward..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-shadow"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="text-sm text-slate-500 flex items-center">
              <select 
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none w-48 mr-4"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <span>{filteredBins.length} of {bins.length} bins</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">BIN ID ↕</th>
                  <th className="px-6 py-4">LOCATION</th>
                  <th className="px-6 py-4">AREA TYPE ↕</th>
                  <th className="px-6 py-4">CURRENT FILL ↕</th>
                  <th className="px-6 py-4">PRIORITY ↕</th>
                  <th className="px-6 py-4">BATTERY ↕</th>
                  <th className="px-6 py-4">SIGNAL</th>
                  <th className="px-6 py-4 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBins.map(bin => {
                  const p = (bin.id && predictions[bin.id]) || {};
                  const fill = bin.current_fill_percent || 0;
                  const priority = p.priority_score || 0;
                  
                  const binIdStr = String(bin.id || '');
                  const battery = binIdStr.length > 0 ? 60 + (binIdStr.charCodeAt(binIdStr.length-1) % 40) : 100;
                  const signal = binIdStr.length > 1 ? 70 + (binIdStr.charCodeAt(binIdStr.length-2) % 30) : 100;
                  
                  const binData = SPECIFIC_BINS[binIdStr] || { name: `Zone ${bin.zone_id} Area`, ward: `Ward-${String(bin.zone_id).replace(/\D/g,'') || 'X'}`, type: "General" };

                  return (
                    <tr key={bin.id || Math.random()} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-extrabold text-slate-800">{binIdStr || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{binData.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{binData.ward}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{binData.type}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center mb-1.5">
                          <span className={`font-extrabold ${fill >= 80 ? 'text-red-500' : fill >= 50 ? 'text-orange-500' : 'text-emerald-500'}`}>{fill.toFixed(1)}%</span>
                        </div>
                        <div className="w-12 bg-slate-200 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${fill >= 80 ? 'bg-red-500' : fill >= 50 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(fill, 100)}%` }}></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-extrabold ${priority > 60 ? 'text-orange-500' : 'text-emerald-500'}`}>{priority.toFixed(1)}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex items-center space-x-2">
                          <BatteryFull className="w-4 h-4 text-emerald-500" />
                          <span>{battery}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        <div className="flex items-center space-x-2">
                          <Wifi className="w-4 h-4 text-slate-400" />
                          <span className="text-xs">{signal}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center">
                          <div className="mr-3 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-[10px] font-bold tracking-widest flex items-center">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></div> ACTIVE
                          </div>
                          <button className="px-4 py-1.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-sm font-bold shadow-sm transition-colors">
                            Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredBins.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500 font-medium">No bins found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

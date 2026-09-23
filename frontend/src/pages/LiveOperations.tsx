import React, { useEffect, useState } from 'react';
import { fetchBins, fetchPredictions, triggerSensorUpdate } from '../api';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { RefreshCw, Cpu, Activity, AlertTriangle, ArrowRight, Zap, Info, Map as MapIcon, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import AIInsightCard from '../components/AIInsightCard';

export default function LiveOperations() {
  const [bins, setBins] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any>({});
  const [selectedBin, setSelectedBin] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [b, p] = await Promise.all([fetchBins(), fetchPredictions()]);
      setBins(b);
      setPredictions(p);
      
      if (selectedBin) {
        const updatedBin = b.find((bin: any) => bin.id === selectedBin.id);
        const updatedPred = p[selectedBin.id];
        if (updatedBin && updatedPred) {
          setSelectedBin({ ...updatedBin, pred: updatedPred });
        }
      }
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateSensorUpdate = async () => {
    setLoading(true);
    await triggerSensorUpdate();
    await loadData();
  };

  const handleRunPrediction = async () => {
    await loadData();
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return '#ef4444'; // Red
      case 'HIGH': return '#f97316'; // Orange
      case 'MEDIUM': return '#eab308'; // Yellow
      default: return '#10b981'; // Green
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-brand-red text-white';
      case 'HIGH': return 'bg-brand-orange text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-white';
      default: return 'bg-brand-green text-white';
    }
  };

  const handleBinClick = (bin: any, pred: any) => {
    setSelectedBin({ ...bin, pred });
  };

  const criticalBinsList = bins.filter(b => predictions[b.id]?.risk_level === 'CRITICAL' || predictions[b.id]?.risk_level === 'HIGH')
    .sort((a, b) => predictions[b.id]?.priority_score - predictions[a.id]?.priority_score);

  return (
    <div className="p-8 h-[calc(100vh-2rem)] flex flex-col max-w-[1600px] mx-auto">
      <header className="mb-6 flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Live Operations</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-4">Interactive digital twin and real-time AI predictions</p>
          
          <AIInsightCard 
            title="PREDICTIVE INTELLIGENCE"
            what={`AI is currently prioritizing ${criticalBinsList.length} bins because they are predicted to approach overflow first.`}
            size="sm"
          />
        </div>
        <div className="flex space-x-4 h-10">
          <button 
            onClick={handleGenerateSensorUpdate}
            disabled={loading}
            className="flex items-center px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors shadow-sm h-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : 'text-brand-orange'}`} />
            SIMULATE SENSOR TICK
          </button>
          
          <button 
            onClick={handleRunPrediction}
            disabled={loading}
            className="flex items-center px-4 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/20 rounded-lg text-indigo-700 dark:text-indigo-300 font-bold text-sm transition-colors shadow-sm h-full"
          >
            <Cpu className="w-4 h-4 mr-2" />
            FORCE AI PREDICTION
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-3 gap-6 min-h-0">
        
        {/* LEFT COLUMN: ACTION QUEUE / SELECTED BIN */}
        <div className="col-span-1 flex flex-col space-y-6 overflow-y-auto pr-2">
          
          {selectedBin ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-brand-primary overflow-hidden shadow-lg shadow-brand-primary/10 flex flex-col transition-colors">
              <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center transition-colors">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-brand-primary" />
                  BIN {selectedBin.id} DETAILS
                </h2>
                <button onClick={() => setSelectedBin(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-sm">
                  CLOSE
                </button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-1">Risk Level</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${getRiskBg(selectedBin.pred?.risk_level)}`}>
                      {selectedBin.pred?.risk_level || 'LOW'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-1">Time to Overflow</p>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedBin.pred?.overflow_eta_hours > 100 ? 'Safe' : `${selectedBin.pred?.overflow_eta_hours.toFixed(1)} hrs`}
                    </span>
                  </div>
                </div>

                {/* Trajectory */}
                <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800 transition-colors">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Fill Trajectory</h3>
                  
                  <div className="relative pt-6 pb-2">
                    {/* Bar background */}
                    <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex transition-colors">
                      {/* Current */}
                      <div className="h-full bg-slate-800 dark:bg-slate-400 transition-colors" style={{ width: `${selectedBin.current_fill_percent}%` }}></div>
                      {/* Predicted addition */}
                      <div className="h-full bg-brand-orange/60" style={{ width: `${Math.max(0, selectedBin.pred?.predicted_fill - selectedBin.current_fill_percent)}%` }}></div>
                    </div>
                    
                    {/* Markers */}
                    <div className="absolute top-0 flex justify-between w-full text-xs font-bold">
                      <span className="text-slate-800 dark:text-slate-200 transition-colors" style={{ marginLeft: `${Math.max(0, selectedBin.current_fill_percent - 5)}%` }}>
                        NOW ({selectedBin.current_fill_percent.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="absolute bottom-[-1.5rem] flex justify-between w-full text-xs font-bold">
                      <span className="text-brand-orange" style={{ marginLeft: `${Math.max(0, selectedBin.pred?.predicted_fill - 10)}%` }}>
                        IN 24H ({selectedBin.pred?.predicted_fill.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Reasoning */}
                <div className="mb-8">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                    <Zap className="w-4 h-4 mr-1 text-brand-orange" /> AI Reasoning
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 bg-orange-50 dark:bg-brand-orange/10 border border-orange-100 dark:border-brand-orange/20 p-4 rounded-lg leading-relaxed text-sm transition-colors">
                    "{selectedBin.pred?.risk_explanation}"
                  </p>
                </div>

                <Link to="/plan" className="w-full flex justify-center items-center py-4 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg transition-colors font-bold text-sm shadow-lg shadow-brand-primary/20">
                  ADD TO COLLECTION PLAN <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md flex flex-col h-full transition-colors">
              <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 p-4 transition-colors">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-brand-orange" />
                  HIGH PRIORITY QUEUE
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {criticalBinsList.length > 0 ? (
                  criticalBinsList.map(bin => (
                    <button 
                      key={bin.id}
                      onClick={() => handleBinClick(bin, predictions[bin.id])}
                      className="w-full text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-primary dark:hover:border-brand-primary p-4 rounded-lg shadow-sm transition-all hover:shadow-md group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors">BIN {bin.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${getRiskBg(predictions[bin.id]?.risk_level)}`}>
                          {predictions[bin.id]?.risk_level}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                        <span>Fill: {bin.current_fill_percent.toFixed(0)}%</span>
                        <span className="font-medium text-brand-orange">ETA: {predictions[bin.id]?.overflow_eta_hours.toFixed(1)}h</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <ShieldAlert className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3 transition-colors" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No high priority bins detected.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DIGITAL TWIN MAP */}
        <div className="col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md relative transition-colors">
          <div className="absolute top-4 left-4 z-[1000] bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-lg text-white">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center">
              <MapIcon className="w-3 h-3 mr-1" /> Live Network
            </div>
            <div className="text-white font-bold text-sm">Hyderabad GHMC</div>
          </div>

          <MapContainer center={[17.4350, 78.4058]} zoom={12} style={{ height: '100%', width: '100%', zIndex: 0 }}>
            <TileLayer 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
              attribution="&copy; OpenStreetMap contributors"
            />
            
            {bins.map(bin => {
              const pred = predictions[bin.id];
              const riskLevel = pred?.risk_level || 'LOW';
              const isSelected = selectedBin?.id === bin.id;
              
              return (
                <CircleMarker 
                  key={bin.id} 
                  center={[bin.latitude, bin.longitude]} 
                  radius={isSelected ? 12 : (riskLevel === 'CRITICAL' ? 8 : 6)} 
                  color={isSelected ? '#3b82f6' : '#ffffff'} 
                  fillColor={getRiskColor(riskLevel)} 
                  fillOpacity={0.9}
                  weight={isSelected ? 3 : 2}
                  eventHandlers={{
                    click: () => handleBinClick(bin, pred),
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-1 text-center">
                      <strong className="text-slate-900 block text-sm mb-1">BIN {bin.id}</strong>
                      <span className="text-slate-500 text-xs">Click for details</span>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

      </div>
    </div>
  );
}

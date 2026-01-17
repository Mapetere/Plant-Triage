
import React from 'react';
import { PlantDiagnosis } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis
} from 'recharts';
import { AlertCircle, Activity, Droplets, Sun, Wind, Gauge, Binary, CameraOff, RefreshCw } from 'lucide-react';

interface Props {
  data: PlantDiagnosis;
  onRetry?: () => void;
}

const DiagnosisDisplay: React.FC<Props> = ({ data, onRetry }) => {
  if (!data.isPlant) {
    return (
      <div className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500 text-center min-h-[60vh] flex flex-col items-center justify-center bg-grid">
        <div className="w-24 h-24 bg-rose-50 rounded-[40px] flex items-center justify-center border-4 border-dashed border-rose-200 glow-hex mb-6">
          <CameraOff className="w-12 h-12 text-rose-500" />
        </div>
        <div className="space-y-4 max-w-xs">
          <h2 className="text-3xl font-black text-slate-900 font-display tracking-tight uppercase leading-none">Not a Plant</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            The input specimen does not correlate with known botanical phenotypes. It appears you have provided an image of something other than a plant.
          </p>
        </div>
        <button 
          onClick={onRetry}
          className="mt-8 px-10 py-5 bg-slate-950 text-white rounded-[28px] font-black flex items-center gap-3 shadow-2xl active:scale-95 transition-all hover:bg-slate-800 uppercase tracking-widest"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </button>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score > 80) return 'text-emerald-600 bg-emerald-100 border-emerald-200';
    if (score > 50) return 'text-amber-600 bg-amber-100 border-amber-200';
    return 'text-rose-600 bg-rose-100 border-rose-200';
  };

  const chartMetrics = data.mathMetrics.map(m => ({
    subject: m.label,
    A: (m.value / m.max) * 100,
    fullMark: 100,
    raw: m.value,
    unit: m.unit
  }));

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-36">
      {/* Hero Info */}
      <section className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="max-w-[70%]">
            <h2 className="text-3xl font-bold text-slate-900 leading-tight font-display tracking-tight uppercase">{data.commonName}</h2>
            <p className="text-sm font-medium text-slate-500">{data.scientificName}</p>
          </div>
          <div className={`px-4 py-2 rounded-2xl flex flex-col items-center justify-center border shadow-sm ${getScoreColor(data.healthScore)}`}>
            <span className="text-2xl font-bold">{data.healthScore}%</span>
            <span className="text-[10px] uppercase font-bold tracking-tighter">Health Index</span>
          </div>
        </div>
        
        <div className="bg-slate-950 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-[60px]"></div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Diagnosis Sequence Complete</span>
          </div>
          <p className="text-lg font-medium leading-relaxed font-display">{data.diagnosis}</p>
        </div>
      </section>

      {/* Math Metrics Visualization */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            < Gauge className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 font-display uppercase tracking-tight">Botanical Telemetry</h3>
          </div>
          <div className="px-2 py-0.5 bg-slate-100 rounded-md text-[8px] font-bold text-slate-400 uppercase tracking-widest">Spectral Vectors</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-white rounded-[32px] border border-slate-100 shadow-sm p-4 overflow-hidden relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartMetrics}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 8, fontWeight: 700 }} />
                <Radar
                  name="Metrics"
                  dataKey="A"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-emerald-50 rounded-[32px] p-6 border border-emerald-100 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <Binary className="w-4 h-4 text-emerald-700" />
              <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Inference Narrative</h4>
            </div>
            <p className="text-sm text-emerald-900 leading-relaxed opacity-80 line-clamp-6">
              {data.mathematicalAnalysis}
            </p>
          </div>
        </div>

        {/* Small Data Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {data.mathMetrics.map((m, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter text-center h-4">{m.label}</span>
                    <span className="text-sm font-bold text-slate-900 mt-1">{m.value}{m.unit}</span>
                </div>
            ))}
        </div>
      </section>

      {/* Charts */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-slate-900 font-display uppercase tracking-tight">Prognosis Matrix</h3>
        </div>
        <div className="h-64 bg-slate-950 rounded-[40px] p-6 border border-white/5 shadow-2xl">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.growthProjection}>
              <defs>
                <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#0f172a', color: '#fff', fontSize: '10px' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Area 
                type="monotone" 
                dataKey="health" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorHealth)" 
                strokeWidth={3}
                name="Health %"
              />
              <Area 
                type="monotone" 
                dataKey="size" 
                stroke="#3b82f6" 
                fill="none" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Biomass"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Care Plan */}
      <section className="space-y-4">
        <h3 className="font-bold text-slate-900 px-1 font-display uppercase tracking-tight">Botanical Prescription</h3>
        <div className="space-y-3">
          {data.careInstructions.map((item, idx) => (
            <div key={idx} className="group bg-white border border-slate-100 rounded-[28px] p-5 shadow-sm flex items-start gap-5 hover:border-emerald-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 transition-colors">
                {idx % 3 === 0 ? <Droplets className="text-blue-500" /> : idx % 3 === 1 ? <Sun className="text-amber-500" /> : <Wind className="text-slate-400" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-slate-900 group-hover:text-emerald-950 transition-colors uppercase tracking-tight">{item.action}</h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.frequency}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Symptoms */}
      <section className="bg-slate-50 rounded-[32px] p-8 border border-slate-200/50">
          <h3 className="font-bold text-slate-900 mb-5 font-display uppercase tracking-tight">Molecular Bio-Markers</h3>
          <div className="flex flex-wrap gap-2.5">
            {data.symptoms.map((s, i) => (
              <span key={i} className="px-4 py-2 bg-white rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 shadow-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                {s}
              </span>
            ))}
          </div>
      </section>
    </div>
  );
};

export default DiagnosisDisplay;

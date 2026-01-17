
import React, { useState, useRef, useEffect } from 'react';
import Layout, { BrandIcon } from './components/Layout';
import DiagnosisDisplay from './components/DiagnosisDisplay';
import CameraView from './components/CameraView';
import { AppView, PlantDiagnosis, DiaryEntry, AppTheme } from './types';
import { analyzePlant } from './services/geminiService';
import {
  Camera, Image as ImageIcon, Loader2, Sparkles, Microscope,
  Info, Scan, Link as LinkIcon,
  BookOpen, Settings, Bell, Palette, BarChart3,
  Dna, Layers, ArrowUpRight, TrendingUp, Hexagon, X, Globe
} from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [theme, setTheme] = useState<AppTheme>('DAY');
  const [diary, setDiary] = useState<DiaryEntry[]>([]);
  const [diagnosis, setDiagnosis] = useState<PlantDiagnosis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isRemoteInputOpen, setIsRemoteInputOpen] = useState(false);
  const [remoteUrl, setRemoteUrl] = useState('');
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifInterval, setNotifInterval] = useState('24');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedDiary = localStorage.getItem('plant_diary');
    if (savedDiary) setDiary(JSON.parse(savedDiary));
    const savedTheme = localStorage.getItem('plant_theme');
    if (savedTheme) setTheme(savedTheme as AppTheme);
  }, []);

  const saveToDiary = (img: string, diag: PlantDiagnosis) => {
    if (!diag.isPlant) return;
    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      imageBase64: img,
      healthScore: diag.healthScore,
      insight: diag.mathematicalAnalysis.substring(0, 100) + "..."
    };
    const updated = [...diary, newEntry];
    setDiary(updated);
    localStorage.setItem('plant_diary', JSON.stringify(updated));
  };

  const processImage = async (base64: string) => {
    setIsLoading(true);
    setError(null);
    setIsCameraOpen(false);
    setIsRemoteInputOpen(false);
    setCurrentView(AppView.TRIAGE);

    try {
      const result = await analyzePlant(base64, diary);
      setDiagnosis(result);
      saveToDiary(base64, result);
      setIsLoading(false);
    } catch (err) {
      setError("Analysis failed. Telemetry sync lost.");
      setIsLoading(false);
    }
  };

  const handleRemoteUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remoteUrl.trim()) return;

    setIsLoading(true);
    setIsRemoteInputOpen(false);

    try {
      const response = await fetch(remoteUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        processImage(base64);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      setError("Failed to fetch image from URL. Ensure the URL is public and allows CORS.");
      setIsLoading(false);
    }
  };

  const requestNotifications = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotifEnabled(true);
        new Notification("Plant Triage: Bio-Link Established", {
          body: "The system will now monitor your botanical sync cycles.",
          icon: 'https://cdn-icons-png.flaticon.com/512/892/892926.png'
        });
      }
    }
  };

  const toggleTheme = (t: AppTheme) => {
    setTheme(t);
    localStorage.setItem('plant_theme', t);
  };

  const resetDiagnosis = () => {
    setDiagnosis(null);
    setCurrentView(AppView.TRIAGE);
  };

  const renderContent = () => {
    if (isLoading) return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 space-y-8 text-center bg-grid">
        <div className="relative group">
          <div className="absolute inset-0 bg-emerald-500/20 blur-3xl animate-pulse rounded-full"></div>
          <div className="hexagon w-24 h-28 bg-emerald-600 flex items-center justify-center relative z-10 animate-bounce">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
          <Dna className="absolute -top-4 -right-4 w-8 h-8 text-emerald-400 animate-pulse" />
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-black font-display uppercase tracking-widest text-slate-900">Processing Specimen</h3>
          <p className="text-slate-600 text-sm max-w-[280px] mx-auto font-medium leading-relaxed">
            Running quantum inference models to detect metabolic irregularities and structural anomalies.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></div>
        </div>
      </div>
    );

    switch (currentView) {
      case AppView.TRIAGE:
        return diagnosis ? (
          <DiagnosisDisplay data={diagnosis} onRetry={resetDiagnosis} />
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center min-h-[65vh] bg-grid">
            <div className="group relative" onClick={() => setIsCameraOpen(true)}>
              <div className="absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="hexagon w-32 h-36 bg-white shadow-2xl flex items-center justify-center mb-8 border border-slate-200 transition-transform group-hover:scale-105 group-hover:-rotate-3 cursor-pointer">
                <Microscope className="w-16 h-16 text-emerald-600 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2 mb-10">
              <h2 className="text-3xl font-black text-slate-900 font-display tracking-tight uppercase">Capture Port</h2>
              <p className="text-slate-600 font-medium text-sm">Align specimen within the optical frame.</p>
            </div>
            <div className="flex flex-col w-full gap-4 max-w-xs">
              <button
                onClick={() => setIsCameraOpen(true)}
                className="px-8 py-5 bg-slate-950 text-white rounded-[28px] font-bold shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all hover:bg-slate-800"
              >
                <Camera className="w-6 h-6 text-emerald-400" />
                Launch Lens
              </button>
              <div className="flex gap-4">
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-4 bg-white border border-slate-200 rounded-[22px] text-xs font-black text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 uppercase tracking-tighter shadow-sm">
                  <ImageIcon className="w-4 h-4" /> Library
                </button>
                <button onClick={() => setIsRemoteInputOpen(true)} className="flex-1 py-4 bg-white border border-slate-200 rounded-[22px] text-xs font-black text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 uppercase tracking-tighter shadow-sm">
                  <LinkIcon className="w-4 h-4" /> Remote
                </button>
              </div>
            </div>

            {isRemoteInputOpen && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-white rounded-[40px] p-8 w-full max-w-md shadow-2xl border border-slate-100 space-y-6 relative">
                  <button onClick={() => setIsRemoteInputOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900">
                    <X className="w-6 h-6" />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 font-display uppercase tracking-tight">Sync Remote Asset</h3>
                  </div>
                  <form onSubmit={handleRemoteUrlSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Image Endpoint URL</label>
                      <input
                        type="url"
                        required
                        placeholder="https://example.com/specimen.jpg"
                        value={remoteUrl}
                        onChange={(e) => setRemoteUrl(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      />
                    </div>
                    <button type="submit" className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black flex items-center justify-center gap-3 uppercase tracking-tighter shadow-xl hover:bg-slate-800 transition-all active:scale-95">
                      Fetch Specimen
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

      case AppView.ANALYTICS:
        return (
          <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-500 pb-32">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-emerald-50 rounded-[24px] flex items-center justify-center border border-emerald-100 shadow-inner">
                <BarChart3 className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-3xl font-black text-slate-900 font-display tracking-tighter uppercase">Bio-Analytics</h2>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Spectral Matrix 12-A</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                  <Hexagon className="w-20 h-20 text-emerald-600" />
                </div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-black mb-2">Neural Nodes Processed</p>
                <div className="flex items-end gap-3">
                  <p className="text-5xl font-black text-slate-900 tracking-tighter">84,912</p>
                  <span className="text-emerald-500 font-black text-sm mb-1.5 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-lg"><TrendingUp className="w-4 h-4" /> +12%</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Cure Efficacy</p>
                  <p className="text-2xl font-black text-emerald-600">96.4%</p>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Species Logic</p>
                  <p className="text-2xl font-black text-slate-900">2.4k+</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-950 rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5 group">
              <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] group-hover:bg-emerald-500/30 transition-colors"></div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-[18px] flex items-center justify-center border border-emerald-500/30 group-hover:rotate-12 transition-transform">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-2xl font-black font-display tracking-tight uppercase">Predictor</h3>
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em]">Quantum Modeler v4</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-10 font-medium">
                Vision transformers model chloroplast degradation at the cellular level, providing 99.2% accuracy.
              </p>
              <button className="w-full py-5 bg-emerald-500 text-slate-950 font-black rounded-[24px] hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-tighter">
                <Layers className="w-5 h-5" />
                Initialize Sequence
              </button>
            </div>
          </div>
        );

      case AppView.DIARY:
        return (
          <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-36">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-50 rounded-[22px] flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 font-display tracking-tighter uppercase">Bio-Log</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Chronological Delta Data</p>
                </div>
              </div>
              <div className="bg-slate-950 text-white px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest shadow-lg">
                {diary.length} UNITS
              </div>
            </div>
            {diary.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-[48px] p-16 text-center shadow-sm">
                <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-[200px] mx-auto">No telemetry data. Start a triage sequence to begin tracking change.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-emerald-600 rounded-[44px] p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-200/50 group">
                  <TrendingUp className="absolute -right-6 -bottom-6 w-44 h-44 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black mb-2 font-display uppercase tracking-tighter">Delta Positive</h3>
                    <p className="text-emerald-100 text-xs font-medium leading-relaxed max-w-[220px]">Metabolic efficiency has spiked by <span className="text-white font-black underline underline-offset-4">+14.2%</span> in the current temporal window.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {diary.slice().reverse().map((entry) => (
                    <div key={entry.id} className="bg-white border border-slate-200 rounded-[36px] p-4 flex gap-5 shadow-sm hover:shadow-md transition-all group cursor-default">
                      <div className="relative w-28 h-28 shrink-0 overflow-hidden rounded-[26px]">
                        <img src={`data:image/jpeg;base64,${entry.imageBase64}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/5"></div>
                      </div>
                      <div className="flex-1 py-1">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">{entry.date}</p>
                          <div className={`text-xs font-black px-3 py-1 rounded-xl shadow-sm ${entry.healthScore > 80 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                            {entry.healthScore}%
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 font-medium leading-relaxed">"{entry.insight}"</p>
                        <button className="mt-3 text-[10px] font-black text-slate-500 hover:text-emerald-600 flex items-center gap-1 uppercase tracking-widest transition-colors">
                          Full Telemetry <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case AppView.SETTINGS:
        return (
          <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-500 pb-36">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-slate-900 rounded-[24px] flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <Settings className="w-7 h-7 text-emerald-400 animate-spin-slow" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 font-display tracking-tighter uppercase">Config</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Environment Parameters</p>
              </div>
            </div>
            <section className="bg-white rounded-[44px] p-10 space-y-8 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-500/20"></div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Bell className="w-6 h-6 text-blue-600" />
                  <h3 className="font-black text-slate-900 font-display text-xl uppercase tracking-tighter">Bio-Sync Alerts</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Consistent spectral data is critical for accurate longitudinal modeling. We suggest a 24-hour cycle.
                </p>
              </div>
              <div className="flex gap-3">
                {['12', '24', '48', '72'].map(h => (
                  <button
                    key={h}
                    onClick={() => setNotifInterval(h)}
                    className={`flex-1 py-4 rounded-[20px] font-black text-xs transition-all ${notifInterval === h ? 'bg-slate-950 text-white shadow-xl scale-110 z-10' : 'bg-slate-50 text-slate-500 hover:bg-emerald-50 border border-transparent hover:text-emerald-700'}`}
                  >
                    {h}H
                  </button>
                ))}
              </div>
              <button
                onClick={requestNotifications}
                className={`w-full py-5 rounded-[24px] font-black flex items-center justify-center gap-3 transition-all uppercase tracking-widest ${notifEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-950 text-white shadow-xl active:scale-95'}`}
              >
                {notifEnabled ? <><Info className="w-4 h-4" /> Sync Active</> : <><Bell className="w-4 h-4" /> Enable Pulse</>}
              </button>
            </section>
          </div>
        );

      default:
        return (
          <div className="p-8 space-y-10 animate-in fade-in duration-700 pb-36 bg-grid">
            <section className="space-y-5 mt-4">
              <div className="flex items-center gap-3">
                <div className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100">Autonomous Node 3.8.2</div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.6)]"></div>
              </div>
              <h2 className="text-6xl font-black text-slate-900 leading-[0.85] font-display tracking-tighter">Plant<br /><span className="text-gradient uppercase">Triage</span> Lab</h2>
              <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-[300px]">Precision diagnostic matrix for high-fidelity botanical surveillance.</p>
            </section>
            <section className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-[48px] blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>
              <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-[40px] p-10 shadow-xl relative overflow-hidden group-hover:-translate-y-1 transition-all duration-500 card-hover">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                  <BrandIcon className="w-48 h-48" />
                </div>
                <div className="relative z-10 space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Hexagon className="w-5 h-5 text-emerald-500" />
                      <h3 className="text-xl font-black text-slate-900 font-display uppercase tracking-tight">Lens Ready</h3>
                    </div>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">Initiate real-time botanical triangulation sequence on your target specimen.</p>
                  </div>
                  <button
                    onClick={() => setIsCameraOpen(true)}
                    className="w-full py-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-[24px] font-black text-xl shadow-xl flex items-center justify-center gap-4 hover:shadow-2xl hover:shadow-slate-900/20 active:scale-[0.98] transition-all duration-300"
                  >
                    <Scan className="w-7 h-7 text-emerald-400" />
                    Start Scan
                  </button>
                </div>
              </div>
            </section>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setCurrentView(AppView.DIARY)} className="bg-white/80 backdrop-blur-sm p-8 rounded-[32px] border border-slate-200/80 shadow-sm flex flex-col items-center gap-4 hover:border-emerald-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
                <div className="w-14 h-14 rounded-[18px] bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 group-hover:scale-110 transition-all duration-300">
                  <BookOpen className="w-7 h-7 text-emerald-600" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">History Log</span>
              </button>
              <button onClick={() => setCurrentView(AppView.ANALYTICS)} className="bg-white/80 backdrop-blur-sm p-8 rounded-[32px] border border-slate-200/80 shadow-sm flex flex-col items-center gap-4 hover:border-slate-300 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
                <div className="w-14 h-14 rounded-[18px] bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 group-hover:scale-110 transition-all duration-300">
                  <BarChart3 className="w-7 h-7 text-slate-600" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">Analytics</span>
              </button>
            </div>
            <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[36px] p-10 relative overflow-hidden group border border-white/5 shadow-xl">
              <div className="absolute inset-0 bg-grid opacity-5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
              <div className="relative z-10 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Hexagon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="font-black text-white font-display text-lg uppercase tracking-tight">Pro Tip</h4>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  Continuous monitoring increases diagnostic fidelity by <span className="text-emerald-400 font-black">14.2%</span>. We recommend a full spectral scan every 24 cycles.
                </p>
              </div>
            </section>
          </div>
        );
    }
  };

  const getThemeClass = () => {
    switch (theme) {
      case 'NIGHT': return 'theme-night';
      case 'GIRLY': return 'theme-girly';
      case 'BOYISH': return 'theme-boyish';
      default: return 'theme-day';
    }
  };

  return (
    <div className={`${getThemeClass()} transition-colors duration-700`}>
      <Layout currentView={currentView} onViewChange={setCurrentView}>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = (reader.result as string).split(',')[1];
              processImage(base64);
            };
            reader.readAsDataURL(file);
          }
        }} className="hidden" />
        {isCameraOpen && <CameraView onCapture={processImage} onClose={() => setIsCameraOpen(false)} />}
        <div className="min-h-screen">
          {renderContent()}
        </div>
      </Layout>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
        .theme-night { background-color: #020617; color: white; }
        .theme-night header { background-color: #020617; border-color: #1e293b; color: white; }
        .theme-night header h1 { color: white !important; }
        .theme-night .text-slate-900 { color: #f8fafc !important; }
        .theme-night .bg-white { background-color: #0f172a; border-color: #1e293b; }
        .theme-night nav { background-color: #020617; border-color: #1e293b; }
      `}</style>
    </div>
  );
};

export default App;


import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, RefreshCw, Zap, AlertCircle, CameraOff } from 'lucide-react';

interface Props {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

const CameraView: React.FC<Props> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const setupCamera = async () => {
    setCameraError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      let message = "An unexpected error occurred while accessing the camera.";
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = "Camera access denied. Please check your browser settings and enable camera permissions for Plant Triage.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = "No camera hardware was detected on this device.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = "The camera is already in use by another application or tab.";
      } else if (err.name === 'OverconstrainedError') {
        message = "The camera does not meet the required specifications for scanning.";
      }
      
      setCameraError(message);
    }
  };

  useEffect(() => {
    setupCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isReady) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Use actual video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // High quality capture
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
      onCapture(base64);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col font-sans">
      <div className="relative flex-1 overflow-hidden bg-slate-900">
        {!cameraError ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              onLoadedMetadata={() => setIsReady(true)}
              className="w-full h-full object-cover"
            />
            
            {/* Tech Overlays - Only show if ready */}
            {isReady && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center animate-in fade-in duration-500">
                <div className="w-64 h-64 border-2 border-emerald-400/30 rounded-[40px] relative">
                  <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-emerald-500 rounded-tl-3xl"></div>
                  <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-emerald-500 rounded-tr-3xl"></div>
                  <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-emerald-500 rounded-bl-3xl"></div>
                  <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-emerald-500 rounded-br-3xl"></div>
                </div>
                {/* Scanning line animation */}
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-[scan_3s_ease-in-out_infinite]"></div>
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-emerald-500/10"></div>
              </div>
            )}

            {/* HUD */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
              <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3 shadow-2xl">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Sensor: {isReady ? 'Active' : 'Initializing'}</span>
              </div>
              <button 
                onClick={onClose}
                className="p-3 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 text-white hover:bg-white/10 transition-colors shadow-2xl"
                aria-label="Close camera"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                  <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Warming Sensors...</p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Error State UI */
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="max-w-xs space-y-6">
              <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.1)]">
                <CameraOff className="w-10 h-10 text-rose-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white font-display">Optical Fault</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {cameraError}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={setupCamera}
                  className="w-full py-4 bg-white text-slate-900 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  Re-initialize
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 transition-colors"
                >
                  Return to Lab
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="bg-slate-950 p-10 pb-12 flex items-center justify-center gap-16 relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/5"></div>
        
        <div className="w-12 h-12"></div> {/* Placeholder for symmetry */}

        <button 
          onClick={takePhoto}
          disabled={!isReady || !!cameraError}
          className={`relative w-24 h-24 rounded-full border-4 flex items-center justify-center group transition-all duration-300 ${
            isReady && !cameraError 
              ? 'border-white active:scale-90' 
              : 'border-slate-800 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className={`w-20 h-20 rounded-full transition-all duration-300 ${
            isReady && !cameraError 
              ? 'bg-white group-hover:bg-emerald-500' 
              : 'bg-slate-800'
          }`}></div>
          {isReady && !cameraError && (
            <div className="absolute -inset-4 border border-emerald-500/20 rounded-full animate-ping pointer-events-none"></div>
          )}
        </button>

        <button 
          onClick={setupCamera}
          disabled={!!cameraError}
          className={`p-4 rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-all ${
            cameraError ? 'opacity-20' : 'active:rotate-180'
          }`}
          aria-label="Switch camera"
        >
          <RefreshCw className="w-6 h-6" />
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      
      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(-100px) scaleX(0.8); opacity: 0; }
          20% { opacity: 0.6; }
          50% { transform: translateY(100px) scaleX(1); opacity: 0.8; }
          80% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

export default CameraView;

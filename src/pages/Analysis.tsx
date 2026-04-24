import React, { useState, useEffect, useRef } from 'react';
import { Upload, Play, CheckCircle, Loader2, Video as VideoIcon, ShieldCheck } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { api } from '../lib/api';
import { analyzeFootage } from '../services/geminiService';

export default function Analysis() {
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [remotePath, setRemotePath] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [result, setResult] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getCameras().then(setCameras);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFileType(file.type);
      setResult(null);
      setStatus('idle');
      setRemotePath(''); 
    }
  };

  const handleStartAnalysis = async () => {
    let finalUrl = remotePath;
    
    if (!remotePath) {
      const file = fileInputRef.current?.files?.[0];
      if (!file) {
        alert('Please upload field footage or enter a remote path first');
        return;
      }
      
      setStatus('processing');
      try {
        const uploadRes = await api.uploadMedia(file);
        finalUrl = uploadRes.url;
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Failed to transmit footage to station server.");
        setStatus('idle');
        return;
      }
    }

    setStatus('processing');
    try {
      // 1. Run AI analysis in the frontend
      const analysis = await analyzeFootage(previewUrl || finalUrl, fileType || 'image/jpeg', !!previewUrl);
      
      // 2. Prepare data for database
      const detectionData = {
        timestamp: new Date().toISOString(),
        camera_id: selectedCamera || 'MANUAL-ANALYSIS',
        detection_type: analysis.type,
        species: analysis.species,
        confidence: analysis.confidence,
        description: analysis.description,
        image_url: finalUrl.toLowerCase().endsWith('.mp4') ? null : finalUrl,
        video_url: finalUrl.toLowerCase().endsWith('.mp4') ? finalUrl : null
      };

      // 3. Save to database via legacy detection recording endpoint
      await api.recordDetection(detectionData);

      setResult({
        ...analysis,
        image_url: finalUrl.toLowerCase().endsWith('.mp4') ? null : finalUrl,
        video_url: finalUrl.toLowerCase().endsWith('.mp4') ? finalUrl : null
      });
      setStatus('completed');
    } catch (err: any) {
      console.error("Analysis failed:", err);
      const errorMsg = err.message || "Neural link communication error.";
      alert(`AI ANALYSIS FAILED: ${errorMsg}`);
      setStatus('idle');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*,video/*"
          />
          <Card 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video bg-black flex flex-col items-center justify-center border-2 border-dashed border-gray-800 hover:border-emerald-500/50 transition-colors group cursor-pointer overflow-hidden p-0"
          >
            {status === 'idle' && !previewUrl && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="text-gray-500 group-hover:text-emerald-500" size={32} />
                </div>
                <p className="text-gray-400 font-bold">Transmit field footage</p>
                <p className="text-xs text-gray-600 mt-1">Upload for YOLO-enhanced biodiversity scan</p>
              </div>
            )}
            {status === 'idle' && previewUrl && (
              <div className="relative w-full h-full">
                {fileType?.startsWith('video') ? (
                  <video src={previewUrl} className="w-full h-full object-cover rounded-lg" controls />
                ) : (
                  <img src={previewUrl} className="w-full h-full object-cover rounded-lg" alt="Preview" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                  <p className="text-white font-bold text-sm bg-black/60 px-4 py-2 rounded-full">FOOTAGE READY</p>
                </div>
              </div>
            )}
            {status === 'processing' && (
              <div className="text-center p-12">
                <Loader2 className="text-emerald-500 animate-spin mx-auto mb-4" size={48} />
                <p className="text-lg font-bold text-white uppercase tracking-widest">YOLO AI Active</p>
                <p className="text-sm text-gray-500 italic">"Neural biodiversity handshake in progress..."</p>
              </div>
            )}
            {status === 'completed' && result && (
              <div className="relative w-full h-full">
                {(result.video_url || result.image_url?.endsWith('.mp4') || result.image_url?.endsWith('.webm') || fileType?.startsWith('video')) ? (
                  <video src={result.video_url || result.image_url || previewUrl} className="w-full h-full object-cover rounded-lg opacity-40" controls />
                ) : (
                  <img src={result.image_url || previewUrl} className="w-full h-full object-cover rounded-lg opacity-40" alt="Result" />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
                  <div className="bg-emerald-500 text-black px-8 py-3 rounded-full font-black text-base flex items-center gap-3 shadow-[0_0_60px_rgba(16,185,129,0.6)] animate-in zoom-in duration-500">
                    <ShieldCheck size={24} />
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[10px] uppercase tracking-widest opacity-80">Subject Identified</span>
                      <span className="uppercase">{result.species || result.type} DETECTED</span>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-black/80 backdrop-blur-md rounded-xl border border-emerald-500/30 max-w-sm w-full">
                    <div className="flex justify-between items-start mb-2">
                       <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest italic">Neural Scan Result</p>
                       {result.species && (
                         <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded border border-emerald-500/30 font-bold uppercase">
                           Species Verified
                         </span>
                       )}
                    </div>
                    <p className="text-sm text-white font-medium text-left">{result.description}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                      <div className="text-left">
                        <p className="text-[9px] text-gray-500 uppercase font-black">Classification</p>
                        <p className="text-xs text-white font-bold">{result.type} {result.species ? `(${result.species})` : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-gray-500 uppercase font-black">AI Confidence</p>
                        <p className="text-xs text-emerald-500 font-bold">{Math.round(result.confidence * 100)}%</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setStatus('idle');
                      setPreviewUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="mt-6 text-[10px] font-black tracking-[0.2em] text-white bg-gray-900 border border-gray-800 px-6 py-2 rounded hover:bg-black transition-all uppercase"
                  >
                    Reset Field Scan
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-4">Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">FIELD LOCATION</label>
                <select 
                  className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                >
                  <option value="">Select Station...</option>
                  {cameras.map(c => (
                    <option key={c.id} value={c.id}>{c.location} ({c.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">REMOTE PATH / URL</label>
                <input 
                  type="text" 
                  placeholder="https://example.com/wildlife.jpg"
                  className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 text-white"
                  value={remotePath}
                  onChange={(e) => {
                    setRemotePath(e.target.value);
                    if (e.target.value) {
                      setPreviewUrl(e.target.value);
                      setResult(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }
                  }}
                />
                <p className="text-[10px] text-gray-600 mt-1 italic">Enter a direct link to images for neural scan</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">LIVE STREAM (OPTIONAL)</label>
                <div className="flex items-center justify-between p-3 bg-gray-900 rounded border border-gray-800">
                  <div className="flex items-center gap-2">
                    <VideoIcon size={16} className="text-gray-500" />
                    <span className="text-xs font-medium text-gray-400">Stream Status</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                </div>
              </div>

              <button 
                onClick={handleStartAnalysis}
                disabled={status === 'processing'}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-emerald-900/20"
              >
                {status === 'processing' ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} />}
                {status === 'processing' ? 'PROCESSING...' : 'START ANALYSIS'}
              </button>
            </div>
          </Card>

          <Card className="bg-emerald-950/20 border-emerald-900/30">
            <h4 className="text-xs font-black text-emerald-500 mb-2 uppercase tracking-tight">AI Capability Notice</h4>
            <p className="text-xs text-emerald-100/70 leading-relaxed">
              Detection model 2.4-Wild is currently active. Accuracy optimized for large mammals and high-vis human activity.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

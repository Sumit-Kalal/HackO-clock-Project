import { useState, useEffect } from 'react';
import { MapPin, Info, Wifi, WifiOff, Maximize2, ShieldAlert } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function MapView() {
  const navigate = useNavigate();
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<any>(null);
  const [recentDetections, setRecentDetections] = useState<any[]>([]);

  useEffect(() => {
    api.getCameras().then(setCameras);
    api.getDetections().then(data => {
      // Filter for detections in the last 30 minutes
      const thirtyMinsAgo = Date.now() - 30 * 60 * 1000;
      setRecentDetections(data.filter((d: any) => new Date(d.timestamp).getTime() > thirtyMinsAgo));
    });
  }, []);

  // Mocked Map Points for the visualizer
  const mapPoints = [
    { x: '25%', y: '30%', id: 'CAM-01' },
    { x: '70%', y: '20%', id: 'CAM-02' },
    { x: '45%', y: '75%', id: 'CAM-03' },
    { x: '80%', y: '65%', id: 'CAM-07' },
  ];

  return (
    <div className="p-8 h-[calc(100vh-64px)] overflow-hidden flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex-1 relative bg-[#020617] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
        {/* Mock Topographic Grid */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 1000 1000">
          <path d="M0 200 Q 250 150 500 250 T 1000 200" fill="none" stroke="#10b981" strokeWidth="2" />
          <path d="M0 500 Q 300 450 600 550 T 1000 500" fill="none" stroke="#10b981" strokeWidth="1" />
          <path d="M200 0 Q 250 300 150 600 T 200 1000" fill="none" stroke="#1e293b" strokeWidth="1" />
        </svg>

        {/* Dynamic Markers */}
        {mapPoints.map((point) => {
          const cam = cameras.find(c => c.id === point.id);
          const isActive = cam?.status === 'Active';
          return (
            <button
              key={point.id}
              onClick={() => setSelectedCamera(cam)}
              className="absolute group z-20"
              style={{ left: point.x, top: point.y }}
            >
              <div className={cn(
                "relative flex items-center justify-center transition-all duration-300 transform hover:scale-125",
                selectedCamera?.id === point.id ? "z-30" : "z-20"
              )}>
                {/* Ping Animation */}
                {isActive && <div className="absolute w-8 h-8 rounded-full bg-emerald-500 animate-ping opacity-25" />}
                
                {/* Detection Pulse */}
                {recentDetections.some(d => d.camera_id === point.id) && (
                  <div className="absolute w-12 h-12 rounded-full border-2 border-red-500 animate-[ping_2s_infinite] opacity-50" />
                )}

                <div className={cn(
                  "p-2 rounded-full border-2 shadow-lg transition-colors",
                  isActive ? "bg-[#020617] border-emerald-500 text-emerald-500" : "bg-gray-900 border-gray-700 text-gray-500"
                )}>
                  <MapPin size={24} />
                </div>
                {/* Label */}
                <div className="absolute top-full mt-2 bg-gray-900/90 text-[10px] font-black text-white px-2 py-1 rounded border border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {point.id}
                </div>
              </div>
            </button>
          );
        })}

        {/* Info Overlay */}
        <div className="absolute top-6 left-6 space-y-2 pointer-events-none">
          <div className="bg-gray-950/80 backdrop-blur-md border border-gray-800 p-4 rounded-xl shadow-2xl">
            <h3 className="text-white font-black uppercase tracking-tight text-sm mb-2">GEOSPATIAL MONITORING</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-gray-400">ACTIVE TRAPS: {cameras.filter(c => c.status === 'Active').length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-[10px] font-bold text-gray-400">OFFLINE STATIONS: {cameras.filter(c => c.status !== 'Active').length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Camera Drawer */}
        {selectedCamera ? (
          <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:w-80 animate-in slide-in-from-right-10 duration-300">
            <Card className="shadow-2xl border-emerald-500/50 bg-[#0F172A]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-emerald-500 uppercase">{selectedCamera.id}</span>
                    <Badge variant={selectedCamera.status === 'Active' ? 'success' : 'danger'}>{selectedCamera.status}</Badge>
                  </div>
                  <h4 className="text-lg font-bold text-white">{selectedCamera.location}</h4>
                </div>
                <button onClick={() => setSelectedCamera(null)} className="text-gray-500 hover:text-white transition-colors">
                  <Maximize2 size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
                    <p className="text-[8px] font-bold text-gray-500 uppercase">Battery Health</p>
                    <p className="text-sm font-black text-white">{selectedCamera.health}%</p>
                  </div>
                  <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
                    <p className="text-[8px] font-bold text-gray-500 uppercase">Last Contact</p>
                    <p className="text-sm font-black text-white">{selectedCamera.last_detection}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-gray-400 pt-2 border-t border-gray-800">
                   <div className="flex items-center gap-2">
                     <Wifi size={14} className="text-emerald-500" />
                     Up: 1.2Mbps
                   </div>
                   <button 
                     onClick={() => navigate('/analysis', { state: { cameraId: selectedCamera.id }})}
                     className="text-emerald-500 hover:text-emerald-400 hover:underline transition-colors uppercase tracking-widest font-black"
                   >
                     ACCESS FEED
                   </button>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="absolute bottom-6 right-6 max-w-xs text-right animate-in fade-in duration-1000">
            <div className="bg-gray-950/40 p-4 rounded-xl border border-gray-800/50">
              <p className="text-xs font-bold text-gray-500 italic">Select a marker to initiate relay link with field station</p>
            </div>
          </div>
        )}

        <div className="absolute right-6 top-6 flex flex-col gap-2">
           <button className="p-2 bg-gray-900 border border-gray-800 rounded hover:text-emerald-500 text-gray-400"><Info size={20}/></button>
           <button className="p-2 bg-gray-900 border border-gray-800 rounded hover:text-emerald-500 text-gray-400"><Maximize2 size={20}/></button>
        </div>
      </div>
    </div>
  );
}

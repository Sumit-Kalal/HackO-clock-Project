import React, { useState, useEffect } from 'react';
import { Camera, Plus, Edit2, Power, BatteryCharging, Search, MoreVertical, Settings2, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';

export default function CameraManagement() {
  const [cameras, setCameras] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newLocation, setNewLocation] = useState('');

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = () => {
    api.getCameras().then(setCameras);
  };

  const handleAddCamera = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation) return;
    await api.addCamera({ location: newLocation, status: 'Active' });
    setIsAdding(false);
    setNewLocation('');
    fetchCameras();
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    await api.updateCameraStatus(id, newStatus);
    fetchCameras();
  };

  const handleDiagnostics = (cam: any) => {
    alert(`DIAGNOSTICS REPORT for ${cam.id}:\n- Connectivity: OK\n- Power: ${cam.health}%\n- Storage: 82% Free\n- Sensor Alignment: Optimized`);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Settings2 size={28} className="text-emerald-500" />
            Field Asset Manager
          </h2>
          <p className="text-gray-500 text-sm mt-1">Direct control over remote trap imaging hardware</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white pl-4 pr-6 py-2.5 rounded-lg font-black text-sm flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-900/40"
        >
          <Plus size={18} />
          DEPLOY NEW STATION
        </button>
      </div>

      {isAdding && (
        <Card className="bg-emerald-950/10 border-emerald-500/50 animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleAddCamera} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Location Identifier</label>
              <input 
                type="text" 
                placeholder="e.g., Hidden Trail Sector B"
                className="w-full bg-gray-900 border border-emerald-900/50 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-bold text-sm">INITIATE DEPLOYMENT</button>
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="px-6 py-2.5 text-gray-400 font-bold text-sm hover:text-white"
            >
              CANCEL
            </button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cameras.map((cam) => (
          <Card key={cam.id} className="group relative overflow-hidden transition-all duration-300 hover:border-emerald-500/50 hover:shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 group-hover:text-emerald-500 transition-colors">
                <Camera size={24} />
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:text-white"><Edit2 size={16}/></button>
                <button className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={16}/></button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                   <Badge variant={cam.status === 'Active' ? 'success' : 'danger'}>{cam.status}</Badge>
                   <span className="text-[10px] font-black font-mono text-gray-500 uppercase">{cam.id}</span>
                </div>
                <h4 className="text-xl font-bold text-white tracking-tight">{cam.location}</h4>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                   <p className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1">
                     <BatteryCharging size={10} className={cn(cam.health > 20 ? "text-emerald-500" : "text-red-500")} />
                     System Health
                   </p>
                   <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-white">{cam.health}</span>
                      <span className="text-xs font-bold text-gray-600">%</span>
                   </div>
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-500 uppercase">Last Sync</p>
                   <p className="text-sm font-bold text-white mt-2 truncate">{cam.last_detection}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                 <button 
                   onClick={() => handleToggleStatus(cam.id, cam.status)}
                   className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
                 >
                   <Power size={14} className={cn(cam.status === 'Active' ? "text-emerald-500" : "text-gray-600")} /> 
                   {cam.status === 'Active' ? 'DEACTIVATE' : 'ACTIVATE'}
                 </button>
                 <button 
                   onClick={() => handleDiagnostics(cam)}
                   className="text-xs font-black text-emerald-500 hover:text-emerald-400 hover:underline transition-colors"
                 >
                   DIAGNOSTICS
                 </button>
              </div>
            </div>

            {/* Status Bar */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 h-1",
              cam.status === 'Active' ? "bg-emerald-600" : "bg-red-600"
            )} />
          </Card>
        ))}
      </div>
    </div>
  );
}

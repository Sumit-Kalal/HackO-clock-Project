import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Play, Calendar, MapPin, Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function MediaGallery() {
  const [detections, setDetections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDetections().then((data) => {
      setDetections(data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="p-8 flex items-center justify-center h-[calc(100vh-64px)]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
    </div>
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 overflow-y-auto h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Media Archive</h2>
          <p className="text-sm text-gray-500 mt-1">Persistent storage of all field captures and AI signatures</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="success" className="px-3 py-1">{detections.length} Total Captures</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {detections.map((d) => (
          <Card key={d.id} className="p-0 overflow-hidden group border-gray-800 hover:border-emerald-500/50 transition-all">
            <div className="relative aspect-video">
              {d.image_url ? (
                <img src={d.image_url} alt="Capture" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
              ) : d.video_url ? (
                <video src={d.video_url} className="w-full h-full object-cover" muted />
              ) : (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                   <Play size={40} className="text-gray-700" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              
              {d.video_url && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/80 flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform shadow-2xl">
                    <Play fill="currentColor" size={20} />
                  </div>
                </div>
              )}

              <div className="absolute top-3 left-3 flex gap-2">
                <Badge variant={d.detection_type === 'Human' ? 'danger' : 'success'} className="shadow-lg uppercase">
                  {d.species || d.detection_type}
                </Badge>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-emerald-500/70">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {format(new Date(d.timestamp), 'MMM dd, HH:mm')}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {d.camera_id}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                <div className="text-[10px] text-gray-500 font-black uppercase">Confidence: {Math.round(d.confidence * 100)}%</div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.open(d.image_url, '_blank')}
                    className="text-gray-400 hover:text-emerald-500 transition-colors p-1"
                    title="View Original"
                  >
                    <Eye size={16} />
                  </button>
                  {d.video_url && (
                    <button 
                      onClick={() => window.open(d.video_url, '_blank')}
                      className="text-gray-400 hover:text-emerald-500 transition-colors p-1"
                      title="Play Video"
                    >
                      <Play size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {detections.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-800 rounded-2xl">
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No Persistent Records Found</p>
        </div>
      )}
    </div>
  );
}

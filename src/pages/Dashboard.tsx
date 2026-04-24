import { useState, useEffect } from 'react';
import { Activity, Users, Camera, Dog, Clock, Image as ImageIcon, Play } from 'lucide-react';
import { StatCard, Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { api } from '../lib/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [detections, setDetections] = useState<any[]>([]);
  const [cameras, setCameras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [d, c, status] = await Promise.all([
          api.getDetections(), 
          api.getCameras(),
          api.getDashboardStatus().catch(() => ({ status: 'Syncing...' }))
        ]);
        if (mounted) {
          setDetections(d || []);
          setCameras(c || []);
          console.log("System Status Check:", status);
        }
      } catch (err: any) {
        console.error("Dashboard data fetch failed:", err);
        if (mounted) {
          setError(typeof err === 'string' ? err : (err.error || "Satellite link unstable. Please retry connection."));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []);

  const chartData = [
    { hour: '00:00', detections: 12 },
    { hour: '04:00', detections: 8 },
    { hour: '08:00', detections: 25 },
    { hour: '12:00', detections: 45 },
    { hour: '16:00', detections: 30 },
    { hour: '20:00', detections: 18 },
  ];

  const stats = [
    { title: 'Total Detections', value: detections.length, icon: Activity, trend: '+12% from yesterday' },
    { title: 'Human Activity', value: detections.filter(d => d.detection_type === 'Human').length, icon: Users, trend: '2 alerts pending', colorClass: 'text-red-500' },
    { title: 'Animal Sightings', value: detections.filter(d => d.detection_type === 'Animal').length, icon: Dog, trend: 'High activity at CAM-07', colorClass: 'text-emerald-500' },
    { title: 'Active Cameras', value: cameras.filter(c => c.status === 'Active').length, icon: Camera, trend: '1 offline in South Valley', colorClass: 'text-blue-500' },
  ];

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center h-[calc(100vh-64px)]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4" />
      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Establishing Secure Field Uplink...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 flex flex-col items-center justify-center h-[calc(100vh-64px)] text-center">
      <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-full mb-4">
        <Activity size={48} className="text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-white uppercase tracking-tight">Signal Loss</h3>
      <p className="text-gray-500 mt-2 max-w-sm">{error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-6 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all"
      >
        RE-INITIATE SYNC
      </button>
    </div>
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Intelligence Dashboard</h2>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">System Link: Active & Synchronized</p>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
           <span className="px-2 py-1 bg-gray-900 border border-gray-800 rounded">Sector-7 Field Control</span>
           <span className="px-2 py-1 bg-gray-900 border border-gray-800 rounded">Verified Authorization</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Activity size={20} className="text-emerald-500" />
              Activity Overview
            </h3>
            <Badge variant="info">Live Feed Analysis</Badge>
          </div>
          <div className="h-[300px] w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorDetections" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="hour" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="detections" stroke="#10b981" fillOpacity={1} fill="url(#colorDetections)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Clock size={20} className="text-emerald-500" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {detections.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-gray-800 rounded-lg">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">No Recent Sightings</p>
              </div>
            ) : detections.slice(0, 5).map((d) => (
              <div key={d.id} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-900/50 hover:bg-gray-800 transition-colors border border-gray-800">
                {d.image_url ? (
                  <img 
                    src={d.image_url} 
                    alt="Detection" 
                    className="w-12 h-12 rounded object-cover border border-gray-800" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?w=100&h=100&fit=crop';
                    }}
                  />
                ) : d.video_url ? (
                   <div className="w-12 h-12 rounded bg-emerald-950 flex items-center justify-center border border-emerald-900">
                    <Play size={16} className="text-emerald-500" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded bg-gray-800 flex items-center justify-center border border-gray-700">
                    <ImageIcon size={20} className="text-gray-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{d.species || d.detection_type} detected</p>
                  <p className="text-xs text-gray-500">{d.camera_id} • {d.timestamp ? format(new Date(d.timestamp), 'HH:mm') : 'Unknown'}</p>
                </div>
                <Badge variant={d.detection_type === 'Human' ? 'danger' : 'success'}>
                  {Math.round(d.confidence * 100)}%
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">System-Wide Detection Stream</h3>
          <button 
            onClick={() => navigate('/logs')}
            className="text-xs font-bold text-emerald-500 hover:text-emerald-400 hover:underline cursor-pointer uppercase tracking-widest transition-colors"
          >
            View Detailed Logs
          </button>
        </div>
        <Table headers={['Time', 'Location', 'Type', 'Confidence', 'Status']}>
          {detections.map((d) => (
            <tr key={d.id} className="hover:bg-gray-800/30 transition-colors">
              <td className="px-6 py-4 text-sm font-mono text-gray-400">{d.timestamp ? format(new Date(d.timestamp), 'HH:mm:ss') : 'N/A'}</td>
              <td className="px-6 py-4 font-bold">{cameras.find(c => c.id === d.camera_id)?.location || d.camera_id}</td>
              <td className="px-6 py-4">
                <Badge variant={d.detection_type === 'Human' ? 'danger' : 'success'}>
                  {d.species ? `${d.species} (${d.detection_type})` : d.detection_type}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm">{Math.round(d.confidence * 100)}%</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs text-gray-500">Processed</span>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

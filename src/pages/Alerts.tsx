import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, ShieldCheck, CheckCircle, Clock, MapPin } from 'lucide-react';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = () => {
    api.getAlerts().then(res => {
      setAlerts(res);
      setLoading(false);
    });
  };

  const handleAcknowledge = async (id: number) => {
    await api.acknowledgeAlert(id);
    fetchAlerts();
  };

  if (loading) return <div className="p-8 text-center uppercase tracking-widest font-bold text-gray-600">Scanning satellite uplink...</div>;

  const activeAlerts = alerts.filter(a => !a.acknowledged);
  const resolvedAlerts = alerts.filter(a => a.acknowledged);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Bell size={28} className="text-emerald-500" />
            Security Response Center
          </h2>
          <p className="text-gray-500 text-sm mt-1">Found {activeAlerts.length} high-priority field incidents</p>
        </div>
        <div className="flex items-center gap-3">
           <Badge variant="danger" className="animate-pulse">FIELD RED STATUS</Badge>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-2">Active Incidents</h3>
        {activeAlerts.length === 0 ? (
          <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-xl p-12 text-center">
            <ShieldCheck className="mx-auto text-emerald-500 mb-4" size={48} />
            <h4 className="text-white font-bold text-lg">No Active Threat Alerts</h4>
            <p className="text-emerald-500/60 text-sm max-w-md mx-auto mt-2">All field activities are currently verified or within normal parameters.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeAlerts.map((alert) => (
              <Card 
                key={alert.id} 
                className={cn(
                  "relative overflow-hidden group border-l-4 transition-all duration-300",
                  alert.severity === 'Critical' ? "border-l-red-600 bg-red-950/10" : "border-l-yellow-600 bg-yellow-950/10"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className={cn(
                      "p-3 rounded-lg bg-gray-900 border",
                      alert.severity === 'Critical' ? "border-red-900 text-red-500" : "border-yellow-900 text-yellow-500"
                    )}>
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black uppercase tracking-widest text-gray-500">Incident #{alert.id}</span>
                        <Badge variant={alert.severity === 'Critical' ? 'danger' : 'warning'}>{alert.severity}</Badge>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">{alert.type}</h4>
                      <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                        <span className="flex items-center gap-1"><Clock size={14} /> {format(new Date(alert.timestamp), 'HH:mm:ss')}</span>
                        <span className="flex items-center gap-1 font-mono text-emerald-500"><MapPin size={14} /> {alert.camera_id}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAcknowledge(alert.id)}
                    className="bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white px-6 py-2.5 rounded-lg font-bold text-sm tracking-tight transition-all active:scale-95 group-hover:border-emerald-500/50"
                  >
                    ACKNOWLEDGE
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {resolvedAlerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-2 mt-8">Logged History</h3>
          <div className="grid gap-2">
            {resolvedAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg border border-gray-800 opacity-60">
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span className="text-sm font-bold text-gray-300">{alert.type}</span>
                  <span className="text-[10px] font-mono text-gray-600 bg-gray-900 px-1.5 py-0.5 rounded uppercase tracking-tighter">{alert.camera_id}</span>
                </div>
                <div className="text-[10px] font-bold text-gray-600 uppercase tabular-nums">Resolved {format(new Date(alert.timestamp), 'yyyy-MM-dd HH:mm')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

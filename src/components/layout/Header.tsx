import { useState, useEffect } from 'react';
import { Search, Bell, User, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { api } from '../../lib/api';

export function Header({ title }: { title: string }) {
  const { user } = useAuth();
  const [hasHighAlert, setHasHighAlert] = useState(false);

  useEffect(() => {
    if (!user) return;
    const checkAlerts = () => {
      api.getAlerts().then(alerts => {
        const high = alerts.some((a: any) => a.severity === 'High' && !a.acknowledged);
        setHasHighAlert(high);
      }).catch(console.error);
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [user]);
  
  return (
    <header className="h-16 border-b border-gray-800 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-white uppercase tracking-wider">{title}</h1>
        {hasHighAlert && (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-950/40 border border-red-500/50 rounded-full animate-pulse">
            <ShieldAlert size={14} className="text-red-500" />
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">High Priority Alert Active</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search sightings..."
            className="bg-gray-900/80 border border-gray-800 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-emerald-500 transition-all w-64 text-white"
          />
        </div>
        
        <button className="relative text-gray-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0F172A]" />
        </button>
        
        <div className="flex items-center space-x-3 pl-2 border-l border-gray-800">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white leading-none capitalize">{user?.email.split('@')[0] || 'Field Ranger'}</p>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tight">{user?.role || 'Observatory'}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <User size={16} />
          </div>
        </div>
      </div>
    </header>
  );
}

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Video, ListFilter, Bell, Map as MapIcon, Settings, Shield, LogOut, Image, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/AuthContext';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/analysis', label: 'Upload & Analysis', icon: Video },
  { path: '/map', label: 'Live Field Feed', icon: MapIcon },
  { path: '/archive', label: 'Media Archive', icon: Image },
  { path: '/reports', label: 'Intelligence Reports', icon: FileText },
  { path: '/logs', label: 'Detection Logs', icon: ListFilter },
  { path: '/alerts', label: 'Priority Alerts', icon: Bell },
  { path: '/cameras', label: 'System Settings', icon: Settings },
];

export function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside id="sidebar" className="w-64 bg-[#0F172A] border-r border-gray-800 h-screen sticky top-0 flex flex-col p-4">
      <div className="flex items-center justify-between px-2 mb-8">
        <div className="flex items-center space-x-2">
          <Shield className="text-emerald-500" size={32} />
          <span className="text-xl font-bold tracking-tight text-white">EcoGuard</span>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium",
              isActive 
                ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50" 
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            )}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="p-3 bg-gray-900/50 rounded-xl border border-gray-800">
          <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">Status</p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-gray-300">Field Online</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-950/10 transition-all border border-transparent hover:border-red-900/30"
        >
          <LogOut size={20} />
          <span>Secure Sign-off</span>
        </button>
      </div>
    </aside>
  );
}

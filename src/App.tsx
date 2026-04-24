/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Header } from './components/layout/Header.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Analysis from './pages/Analysis.tsx';
import Logs from './pages/Logs.tsx';
import Alerts from './pages/Alerts.tsx';
import MapView from './pages/Map.tsx';
import Cameras from './pages/Cameras.tsx';
import MediaGallery from './pages/MediaGallery.tsx';
import Reports from './pages/Reports.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import { AuthProvider, useAuth } from './lib/AuthContext.tsx';
import { useLocation } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="h-screen w-full bg-[#020617] flex items-center justify-center">
      <div className="text-emerald-500 font-black animate-pulse uppercase tracking-[0.3em]">Syncing Encrypted Link...</div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  
  const titles: Record<string, string> = {
    '/': 'Ranger Command Dashboard',
    '/analysis': 'AI Video Analysis Lab',
    '/archive': 'Ranger Media Archive',
    '/reports': 'Biodiversity Intelligence',
    '/logs': 'Field Detection Logs',
    '/alerts': 'High Priority Alerts',
    '/map': 'Geospatial Camera View',
    '/cameras': 'Hardware Management',
  };

  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#020617] text-gray-300 font-sans selection:bg-emerald-500 selection:text-black">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header title={titles[location.pathname] || 'EcoGuard'} />
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
            <Route path="/archive" element={<ProtectedRoute><MediaGallery /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
            <Route path="/cameras" element={<ProtectedRoute><Cameras /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}


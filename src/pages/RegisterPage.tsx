import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle, Loader2, UserPlus } from 'lucide-react';
import { Card } from '../components/ui/Card';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Ranger');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(email, password, role);
      navigate('/');
    } catch (err: any) {
      setError(err.error || 'Registration failed. System rejected entry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-950/30 rounded-2xl border border-emerald-900/50 flex items-center justify-center mb-6">
            <UserPlus className="text-emerald-500" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Recruit Enlistment</h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">Create your field Operative account</p>
        </div>

        <Card className="bg-[#0F172A] border-gray-800 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-950/20 border border-red-900/50 text-red-500 p-3 rounded-lg flex items-center gap-3 text-sm animate-in flex-col">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} />
                  <span>Entry Denied</span>
                </div>
                <p className="text-[10px] font-bold uppercase opacity-60 leading-tight">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Official Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type="email" 
                  required
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all text-white"
                  placeholder="operatve@ecoguard.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Access Key</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type="password" 
                  required
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all text-white"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Field Designation</label>
              <select 
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all text-white appearance-none cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Ranger">Field Ranger</option>
                <option value="Scientist">Conservation Scientist</option>
                <option value="Officer">Security Officer</option>
              </select>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/20 uppercase tracking-widest text-sm"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Initialize Profile'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-800 pt-6">
            <p className="text-gray-500 text-xs">
              Already have clearance? <Link to="/login" className="text-emerald-500 font-bold hover:underline ml-1">Portal Login</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { FileSpreadsheet, Download, TrendingUp, Search, Filter } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Reports() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    api.getBiodiversityReport().then(data => {
      setReportData(data);
      setLoading(false);
    });
  }, []);

  const handleGenerateDossier = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const csvContent = "Subject,Classification,Total Captures,Avg Confidence\n" + 
        (reportData?.stats || []).map((s: any) => `${s.species || 'N/A'},${s.detection_type},${s.count},${Math.round(s.avg_confidence * 100)}%`).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Biodiversity_Report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      setIsGenerating(false);
    }, 1500);
  };

  if (loading) return <div className="p-8 flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" /></div>;

  const stats = reportData?.stats || [];
  const filteredStats = stats.filter((s: any) => 
    (s.species || 'N/A').toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.detection_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const speciesData = stats
    .filter((s: any) => s.detection_type === 'Animal' && s.species)
    .map((s: any) => ({ name: s.species, value: s.count }));

  const timelineData = [...(reportData?.timeline || [])].reverse();

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 overflow-y-auto h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Biodiversity Intelligence Report</h2>
          <p className="text-sm text-gray-500 mt-1">Aggregated field intelligence and species distribution analytics</p>
        </div>
        <button 
          onClick={handleGenerateDossier}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 disabled:cursor-not-allowed text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-emerald-900/20"
        >
          {isGenerating ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <Download size={18} />
          )}
          {isGenerating ? 'COMPILING DOSSIER...' : 'GENERATE FULL DOSSIER'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-500" />
              Sighting Velocity (14 Days)
            </h3>
          </div>
          <div className="h-[300px] min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData}>
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(16, 185, 129, 0.1)'}}
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="min-h-[400px]">
          <h3 className="font-bold text-lg mb-6">Species Distribution</h3>
          <div className="h-[300px] min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={speciesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {speciesData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {speciesData.map((s: any, i: number) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-400 font-medium">{s.name}</span>
                </div>
                <span className="text-white font-bold">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">Detailed Species Ledger</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Filter species..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors w-[250px]" 
              />
            </div>
            <button className="p-2 border border-gray-800 rounded-lg text-gray-500 hover:text-white transition-all">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500 tracking-[0.2em]">Subject</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500 tracking-[0.2em]">Classification</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500 tracking-[0.2em]">Total Captures</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500 tracking-[0.2em]">AV. AI Confidence</th>
              </tr>
            </thead>
            <tbody>
              {filteredStats.map((stat: any, i: number) => (
                <tr key={i} className="border-b border-gray-900 hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-white uppercase tracking-tight">{stat.species || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <Badge variant={stat.detection_type === 'Human' ? 'danger' : 'success'}>
                      {stat.detection_type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-mono text-emerald-500">{stat.count}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{Math.round(stat.avg_confidence * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

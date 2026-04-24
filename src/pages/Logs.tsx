import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Search, Download, Filter, FileSpreadsheet } from 'lucide-react';
import { api } from '../lib/api';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { format } from 'date-fns';

export default function Logs() {
  const [detections, setDetections] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    api.getDetections().then(setDetections);
  }, []);

  const filtered = detections.filter(d => {
    const matchesSearch = d.camera_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || d.detection_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const exportToCSV = () => {
    const headers = ['ID', 'Timestamp', 'CameraID', 'Type', 'Species', 'Confidence'];
    const rows = filtered.map(d => [d.id, d.timestamp, d.camera_id, d.detection_type, d.species || '', d.confidence]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecoguard-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 px-6 bg-[#0F172A] border-gray-800">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search Camera ID..."
              className="bg-gray-900 border border-gray-800 rounded pl-10 pr-4 py-2 text-sm w-full focus:border-emerald-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-900 px-3 py-2 rounded border border-gray-800">
            <Filter size={14} className="text-gray-500" />
            <select 
              className="bg-transparent text-sm focus:outline-none text-gray-300 font-bold appearance-none cursor-pointer"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Animal">Animals</option>
              <option value="Human">Humans</option>
            </select>
          </div>
        </div>

        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded font-bold text-sm transition-colors"
        >
          <FileSpreadsheet size={16} />
          EXPORT TO CSV
        </button>
      </Card>

      <Table headers={['Preview', 'ID', 'Date & Time', 'Camera', 'Target Type', 'Species', 'Confidence', 'Action']}>
        {filtered.map((d) => (
          <tr key={d.id} className="hover:bg-gray-800/30 transition-colors group">
            <td className="px-6 py-4">
              <div className="w-12 h-12 rounded overflow-hidden bg-gray-900 border border-gray-800 group-hover:border-emerald-500/50 transition-colors">
                <img src={d.image_url} alt="Preview" className="w-full h-full object-cover" />
              </div>
            </td>
            <td className="px-6 py-4 font-mono text-xs text-gray-500">#{d.id}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-bold text-gray-200">{format(new Date(d.timestamp), 'MMM dd, yyyy')}</div>
              <div className="text-[10px] uppercase font-bold text-gray-500">{format(new Date(d.timestamp), 'HH:mm:ss')}</div>
            </td>
            <td className="px-6 py-4">
              <div className="text-sm font-bold text-emerald-400 font-mono">{d.camera_id}</div>
            </td>
            <td className="px-6 py-4">
              <Badge variant={d.detection_type === 'Human' ? 'danger' : 'success'}>
                {d.detection_type}
              </Badge>
            </td>
            <td className="px-6 py-4">
              <div className="text-sm font-bold text-white uppercase tracking-tighter">{d.species || '—'}</div>
            </td>
            <td className="px-6 py-4">
              <div className="w-24 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000", d.confidence > 0.9 ? "bg-emerald-500" : "bg-yellow-500")}
                  style={{ width: `${d.confidence * 100}%` }}
                />
              </div>
              <div className="text-[10px] mt-1 font-bold text-gray-500">{Math.round(d.confidence * 100)}% Match</div>
            </td>
            <td className="px-6 py-4">
              <button 
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = d.image_url;
                  a.download = `detection-${d.id}.jpg`;
                  a.click();
                }}
                className="text-gray-500 hover:text-emerald-500 transition-colors p-2 rounded-lg hover:bg-gray-800"
                title="Download Evidence"
              >
                <Download size={16} />
              </button>
            </td>
          </tr>
        ))}
      </Table>
      
      {filtered.length === 0 && (
        <div className="text-center py-20 bg-[#111827] rounded-lg border border-gray-800 border-dashed">
          <p className="text-gray-500 font-bold uppercase tracking-widest">No matching logs found in field database</p>
        </div>
      )}
    </div>
  );
}

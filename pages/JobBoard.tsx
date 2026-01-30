
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Job } from '../types';
import { Search, MapPin, Clock, ArrowRight, Loader2 } from 'lucide-react';

const JobBoard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await api.getJobs();
        if (Array.isArray(data) && data.length > 0) {
          setJobs(data);
        } else {
          throw new Error('No jobs returned');
        }
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
        // Données de secours si le backend n'est pas encore prêt
        setJobs([
          { id: '1', title: 'Développeur React/AWS', companyId: 'c1', companyName: 'Agadir Tech', location: 'Agadir', description: 'Recherche expert AWS...', requirements: ['React', 'AWS'], type: 'Full-time', createdAt: '2024-03-20' },
          { id: '2', title: 'Marketing Digital', companyId: 'c2', companyName: 'Souss Hotels', location: 'Taghazout', description: 'Gestion réseaux sociaux...', requirements: ['SEO', 'Ads'], type: 'Contract', createdAt: '2024-03-21' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filtered = jobs.filter(j => {
    const q = query.toLowerCase();
    return (j.title?.toLowerCase().includes(q) || 
            j.companyName?.toLowerCase().includes(q) || 
            j.location?.toLowerCase().includes(q));
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Opportunités en Souss-Massa</h1>
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Poste, entreprise..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20">
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
          <p className="text-gray-500">Récupération des offres...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filtered.map(job => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded-full">{job.type}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12}/> Il y a 2 jours</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition">{job.title}</h3>
                <p className="text-gray-500 font-medium mb-4">{job.companyName}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                   <span className="flex items-center gap-1"><MapPin size={16}/> {job.location}</span>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-2 text-indigo-600 font-bold">
                Voir l'offre <ArrowRight size={18} className="group-hover:translate-x-1 transition"/>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobBoard;

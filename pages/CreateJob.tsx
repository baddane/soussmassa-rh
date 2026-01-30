
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Job } from '../types';
import { api } from '../services/api';
import { Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';

interface Props {
  user: User;
}

const CreateJob: React.FC<Props> = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jobData, setJobData] = useState({
    title: '',
    location: 'Agadir',
    type: 'Full-time' as Job['type'],
    description: '',
    requirements: ['']
  });

  const handleAddRequirement = () => {
    setJobData({ ...jobData, requirements: [...jobData.requirements, ''] });
  };

  const handleRemoveRequirement = (index: number) => {
    const newReqs = jobData.requirements.filter((_, i) => i !== index);
    setJobData({ ...jobData, requirements: newReqs });
  };

  const handleUpdateRequirement = (index: number, val: string) => {
    const newReqs = [...jobData.requirements];
    newReqs[index] = val;
    setJobData({ ...jobData, requirements: newReqs });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!jobData.title || !jobData.description) {
      setError('Le titre et la description sont requis');
      setLoading(false);
      return;
    }
    if (jobData.requirements.some(req => !req.trim())) {
      setError('Toutes les compétences doivent être remplies');
      setLoading(false);
      return;
    }
    if (jobData.title.length < 5) {
      setError('Le titre doit contenir au moins 5 caractères');
      setLoading(false);
      return;
    }
    if (jobData.description.length < 20) {
      setError('La description doit contenir au moins 20 caractères');
      setLoading(false);
      return;
    }

    try {
      await api.createJob(jobData, user.token!);
      navigate('/company');
    } catch (err: any) {
      const errorMsg = err?.message || 'Erreur lors de la création';
      console.error(errorMsg);
      setTimeout(() => navigate('/company'), 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Publier une offre</h1>
        <p className="text-gray-500">Recrutez les meilleurs talents de la région Souss-Massa.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Titre du poste</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="Ex: Développeur React Senior"
                value={jobData.title}
                onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Lieu</label>
              <select 
                className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white"
                value={jobData.location}
                onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
              >
                <option>Agadir</option>
                <option>Taghazout</option>
                <option>Inezgane</option>
                <option>Tiznit</option>
                <option>Taroudant</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Type de contrat</label>
              <select 
                className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white"
                value={jobData.type}
                onChange={(e) => setJobData({ ...jobData, type: e.target.value as Job['type'] })}
              >
                <option value="Full-time">Temps plein</option>
                <option value="Part-time">Temps partiel</option>
                <option value="Contract">Freelance/CDD</option>
                <option value="Internship">Stage</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description du poste</label>
            <textarea 
              required
              rows={6}
              className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
              placeholder="Décrivez les missions, l'entreprise et les attentes..."
              value={jobData.description}
              onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
            ></textarea>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-bold text-gray-700">Compétences clés</label>
              <button 
                type="button" 
                onClick={handleAddRequirement}
                className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"
              >
                <Plus size={14} /> Ajouter
              </button>
            </div>
            <div className="space-y-3">
              {jobData.requirements.map((req, idx) => (
                <div key={idx} className="flex gap-2">
                  <input 
                    type="text" 
                    required
                    className="flex-grow px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    placeholder="Ex: React.js"
                    value={req}
                    onChange={(e) => handleUpdateRequirement(idx, e.target.value)}
                  />
                  {jobData.requirements.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveRequirement(idx)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => navigate('/company')}
              className="flex-1 py-4 border-2 border-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-100"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Publier l\'offre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;

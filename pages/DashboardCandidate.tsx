import React, { useState, useEffect } from 'react';
import { Application, User, Job } from '../types';
import { api } from '../services/api';
import {
  Briefcase, FileText, MapPin, ExternalLink, AlertCircle, RefreshCw,
  TrendingUp, Clock, CheckCircle2, Eye, Star, Building2, Calendar,
  Upload, Search, Bell, Target, Award, Zap
} from 'lucide-react';

interface Props {
  user: User;
}

const DashboardCandidate: React.FC<Props> = ({ user }) => {
  const [applications, setApplications] = useState<(Application & { job?: Job })[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les offres recentes pour suggestions
      try {
        const jobs = await api.getJobs();
        setRecentJobs(jobs.slice(0, 4));
      } catch {
        setRecentJobs([]);
      }

      // Charger les candidatures si token disponible
      if (user?.token) {
        try {
          const apps = await api.getCandidateApplications(user.id, user.token);
          const enrichedApps = await Promise.all(
            apps.map(async (app) => {
              try {
                const job = await api.getJob(app.jobId);
                return { ...app, job };
              } catch {
                return app;
              }
            })
          );
          setApplications(enrichedApps);
        } catch {
          setApplications([]);
        }
      }
    } catch (err: any) {
      console.error('Dashboard error:', err);
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    reviewed: applications.filter(a => a.status === 'reviewed').length,
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Bonjour, {user.name}!</h1>
              <p className="text-indigo-100">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition"
            >
              <RefreshCw size={16} />
              Actualiser
            </button>
            <a
              href="/#/jobs"
              className="flex items-center gap-2 px-6 py-2 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition"
            >
              <Search size={16} />
              Trouver un emploi
            </a>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto font-bold">×</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <Briefcase size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-500">Candidatures</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
              <div className="text-xs text-gray-500">En attente</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Eye size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.reviewed}</div>
              <div className="text-xs text-gray-500">En cours</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.accepted}</div>
              <div className="text-xs text-gray-500">Acceptees</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidatures */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Briefcase size={18} className="text-indigo-600" />
                Mes candidatures
              </h2>
              {applications.length > 0 && (
                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-medium">
                  {applications.length} total
                </span>
              )}
            </div>

            {applications.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {applications.map(app => (
                  <div key={app.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{app.job?.title || 'Poste'}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Building2 size={14} />
                            {app.job?.companyName || 'Entreprise'}
                          </span>
                          {app.job?.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {app.job.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          app.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                          app.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {app.status === 'pending' ? 'En attente' :
                           app.status === 'accepted' ? 'Accepte' :
                           app.status === 'reviewed' ? 'En cours' : 'Rejete'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('fr-FR') : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase size={28} className="text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Aucune candidature</h3>
                <p className="text-gray-500 text-sm mb-4">Commencez a postuler aux offres qui vous interessent!</p>
                <a
                  href="/#/jobs"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                >
                  <Search size={18} />
                  Voir les offres
                </a>
              </div>
            )}
          </div>

          {/* Offres suggerees */}
          {recentJobs.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Zap size={18} className="text-amber-500" />
                  Offres recommandees pour vous
                </h2>
              </div>
              <div className="divide-y divide-gray-50">
                {recentJobs.map(job => (
                  <a
                    key={job.id}
                    href={`/#/jobs/${job.id}`}
                    className="block p-4 hover:bg-indigo-50 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 hover:text-indigo-600">{job.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Building2 size={14} />
                            {job.companyName}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {job.location}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                          {job.type}
                        </span>
                        <ExternalLink size={16} className="text-gray-400" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <a
                  href="/#/jobs"
                  className="text-indigo-600 font-semibold text-sm hover:underline flex items-center justify-center gap-1"
                >
                  Voir toutes les offres
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profil Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <FileText size={18} className="text-indigo-600" />
              Mon Profil
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-lg font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="flex items-center gap-2 text-amber-700 font-medium text-sm">
                  <Upload size={16} />
                  Ajoutez votre CV
                </div>
                <p className="text-xs text-amber-600 mt-1">
                  Un CV augmente vos chances d'etre contacte
                </p>
              </div>
            </div>
          </div>

          {/* Conseils */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Target size={18} className="text-indigo-600" />
              Conseils
            </h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Completez votre profil a 100%</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Uploadez un CV au format PDF</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Postulez a plusieurs offres</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Verifiez regulierement vos candidatures</span>
              </li>
            </ul>
          </div>

          {/* Stats Region */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-emerald-500" />
              Region Souss-Massa
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Offres disponibles</span>
                <span className="font-bold text-indigo-600">{recentJobs.length}+</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Entreprises actives</span>
                <span className="font-bold text-indigo-600">50+</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Secteurs</span>
                <span className="font-bold text-indigo-600">Tech, Tourisme, Agro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCandidate;

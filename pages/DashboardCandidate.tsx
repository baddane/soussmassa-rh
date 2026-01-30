import React, { useState, useEffect } from 'react';
import { Application, User, Job } from '../types';
import { api } from '../services/api';
import { Briefcase, FileText, CheckCircle2, MapPin, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  user: User;
}

const DashboardCandidate: React.FC<Props> = ({ user }) => {
  const [applications, setApplications] = useState<(Application & { job?: Job })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user || !user.id || !user.token) {
        throw new Error('Session utilisateur invalide. Veuillez vous reconnecter.');
      }

      // Appel API reel
      const apps = await api.getCandidateApplications(user.id, user.token);

      // Enrichir avec les details des jobs
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
    } catch (err: any) {
      console.error('Fetch applications error:', err);

      // Si l'API echoue, afficher l'erreur mais ne pas bloquer
      if (err.message.includes('Session')) {
        setError(err.message);
      } else {
        setError('Impossible de charger vos candidatures. Verifiez votre connexion.');
      }
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user.id, user.token]);

  const latestCvUrl = applications.length > 0 && applications[0].cvUrl
    ? api.getCVUrl(applications[0].cvUrl)
    : null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Chargement de vos candidatures...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Bienvenue, {user.name}</h1>
          <p className="text-gray-500">Suivez l'etat de vos candidatures dans la region Souss-Massa.</p>
        </div>
        <button
          onClick={fetchApplications}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          <div className="flex-1">
            <p className="font-semibold">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold">x</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase size={22} className="text-indigo-600" />
            Mes candidatures ({applications.length})
          </h2>

          {applications.length > 0 ? (
            applications.map(app => {
              const appliedDate = app.appliedAt
                ? new Date(app.appliedAt).toLocaleDateString('fr-FR')
                : 'Date inconnue';

              return (
                <div key={app.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {app.job?.title || 'Poste'}
                      </h3>
                      <div className="flex flex-col md:flex-row gap-4 text-sm text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Briefcase size={14} />
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
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xs text-gray-400 mb-1">Status</div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          app.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                          app.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' :
                          app.status === 'reviewed' ? 'bg-blue-50 text-blue-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {app.status === 'pending' ? 'En attente' :
                           app.status === 'accepted' ? 'Accepte' :
                           app.status === 'reviewed' ? 'En cours' : 'Rejete'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400 mb-1">Postule le</div>
                        <div className="text-sm font-medium text-gray-700">{appliedDate}</div>
                      </div>
                      {app.aiMatchScore && (
                        <div className="text-right">
                          <div className="text-xs text-gray-400 mb-1">Score IA</div>
                          <div className={`text-sm font-bold ${app.aiMatchScore >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {app.aiMatchScore}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
              <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Vous n'avez pas encore postule a des offres.</p>
              <p className="text-gray-400 text-sm mt-2">Consultez le tableau des offres d'emploi pour trouver une position.</p>
              <a href="/#/jobs" className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
                Voir les offres
              </a>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText size={22} className="text-indigo-600" />
            Mon Profil
          </h2>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-bold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Mon dernier CV</span>
                </div>
                {latestCvUrl ? (
                  <a
                    href={latestCvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1"
                  >
                    <ExternalLink size={12} />
                    Ouvrir
                  </a>
                ) : (
                  <span className="text-gray-400 text-xs italic">Aucun CV</span>
                )}
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <div className="flex-1">
                  <span className="text-xs text-emerald-800 font-medium">Candidatures soumises</span>
                  <div className="text-lg font-bold text-emerald-700">{applications.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCandidate;

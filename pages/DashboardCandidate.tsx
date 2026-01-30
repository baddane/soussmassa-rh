
import React, { useState, useEffect } from 'react';
import { Application, User, Job } from '../types';
import { api } from '../services/api';
import { Briefcase, FileText, CheckCircle2, MapPin, ExternalLink, AlertCircle } from 'lucide-react';

interface Props {
  user: User;
}

const DashboardCandidate: React.FC<Props> = ({ user }) => {
  const [applications, setApplications] = useState<(Application & { job?: Job })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        if (!user || !user.id || !user.name || !user.email) {
          throw new Error('Données utilisateur invalides');
        }

        const mockApplications: (Application & { job?: Job })[] = [
          {
            id: 'a1',
            jobId: '1',
            candidateId: user.id,
            candidateName: user.name,
            candidateEmail: user.email,
            cvUrl: 'my-cv.pdf',
            status: 'pending',
            appliedAt: new Date().toISOString(),
            job: {
              id: '1',
              title: 'Développeur Fullstack React/Python',
              companyId: 'c1',
              companyName: 'Agadir Tech Solutions',
              location: 'Agadir, Marina',
              description: 'Nous recherchons un développeur fullstack avec expérience en React et Python',
              requirements: ['React', 'Python', 'AWS'],
              type: 'Full-time',
              createdAt: new Date().toISOString()
            }
          }
        ];
        setApplications(mockApplications);
        setError(null);
      } catch (err: any) {
        const errorMessage = err?.message || 'Erreur lors du chargement des candidatures';
        setError(errorMessage);
        console.error('Fetch applications error:', err);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [user.id, user.name, user.email]);

  // Get the most recent CV URL for profile display
  const latestCvUrl = applications.length > 0 && applications[0].cvUrl 
    ? api.getCVUrl(applications[0].cvUrl) 
    : null;

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

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          <div>
            <p className="font-semibold">Erreur de chargement</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Bienvenue, {user.name}</h1>
        <p className="text-gray-500">Suivez l'état de vos candidatures dans la région Souss-Massa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase size={22} className="text-indigo-600" />
            Mes candidatures ({applications.length})
          </h2>

          {applications.length > 0 ? (
            applications.map(app => {
              // Validate application data
              const isValid = app.id && app.job?.title && app.status;
              const appliedDate = app.appliedAt 
                ? new Date(app.appliedAt).toLocaleDateString('fr-FR') 
                : 'Date inconnue';
              
              return (
                <div key={app.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {app.job?.title || 'Titre non disponible'}
                      </h3>
                      <div className="flex flex-col md:flex-row gap-4 text-sm text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Briefcase size={14} />
                          {app.job?.companyName || 'Entreprise inconnue'}
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
                          'bg-red-50 text-red-600'
                        }`}>
                          {app.status === 'pending' ? 'En attente' : 
                           app.status === 'accepted' ? 'Accepté' : 'Rejeté'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400 mb-1">Postulé le</div>
                        <div className="text-sm font-medium text-gray-700">{appliedDate}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
              <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Vous n'avez pas encore postulé à des offres.</p>
              <p className="text-gray-400 text-sm mt-2">Consultez le tableau des offres d'emploi pour trouver une position correspondant à votre profil.</p>
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
                {user.name.charAt(0)}
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
                {latestCvUrl && latestCvUrl.trim() ? (
                  <a 
                    href={latestCvUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1 transition hover:text-indigo-700"
                    title="Télécharger le CV"
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
                <div>
                  <span className="text-xs text-emerald-800 font-medium">Profil complété</span>
                  <div className="w-full bg-emerald-200 rounded-full h-1.5 mt-1">
                    <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-xs text-emerald-700 font-medium mt-1">85%</span>
                </div>
              </div>
            </div>

            <button 
              className="w-full mt-6 py-3 border-2 border-indigo-600 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition disabled:opacity-50"
              disabled
              title="Fonctionnalité à venir"
            >
              Modifier mon profil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCandidate;

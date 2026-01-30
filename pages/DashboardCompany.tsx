import React, { useState, useEffect } from 'react';
import { Job, Application, User } from '../types';
import { api } from '../services/api';
import { geminiService } from '../services/gemini';
import { Users, Brain, Loader2, CheckCircle, XCircle, FileText, ExternalLink, AlertCircle, RefreshCw, Plus } from 'lucide-react';

interface Props {
  user: User;
}

interface AnalysisResult {
  score: number;
  feedback: string;
  pros: string[];
  cons: string[];
}

const DashboardCompany: React.FC<Props> = ({ user }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user || !user.id || !user.token) {
        throw new Error('Session utilisateur invalide. Veuillez vous reconnecter.');
      }

      // Recuperer les offres de l'entreprise
      const companyJobs = await api.getCompanyJobs(user.id, user.token);
      setJobs(companyJobs);

      // Recuperer les candidatures pour chaque offre
      const allApplications: Application[] = [];
      for (const job of companyJobs) {
        try {
          const jobApps = await api.getApplications(job.id, user.token);
          allApplications.push(...jobApps);
        } catch (err) {
          console.warn(`Could not fetch applications for job ${job.id}:`, err);
        }
      }
      setApplications(allApplications);

      if (companyJobs.length > 0) {
        setSelectedJob(companyJobs[0]);
      }
    } catch (err: any) {
      console.error('Dashboard initialization error:', err);
      if (err.message.includes('Session')) {
        setError(err.message);
      } else {
        setError('Impossible de charger les donnees. Verifiez votre connexion.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id, user.token]);

  const handleAnalyze = async (app: Application) => {
    try {
      if (!app || !app.id || !app.candidateName || !app.jobId) {
        throw new Error('Donnees de candidature invalides');
      }

      setSelectedApp(app);
      setAnalyzing(true);
      setAnalysis(null);
      setError(null);

      const job = jobs.find(j => j.id === app.jobId);
      if (!job) {
        throw new Error('Offre non trouvee');
      }

      const candidateData = {
        name: app.candidateName,
        email: app.candidateEmail,
        skills: ["React", "Node.js", "TypeScript"],
        experience: "Experience professionnelle"
      };

      const result = await geminiService.analyzeMatch(job, candidateData);

      if (!result || typeof result !== 'object') {
        throw new Error('Format de reponse invalide');
      }

      const typedResult: AnalysisResult = {
        score: result.score || 0,
        feedback: result.feedback || '',
        pros: Array.isArray(result.pros) ? result.pros : [],
        cons: Array.isArray(result.cons) ? result.cons : []
      };

      setAnalysis(typedResult);
    } catch (err: any) {
      if (err.message === 'API_KEY_REQUIRED') {
        setError('Cle API Gemini non configuree. Ajoutez API_KEY dans les variables d\'environnement Amplify.');
      } else {
        setError(err?.message || 'Erreur lors de l\'analyse');
      }
      setAnalysis(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const filteredApplications = selectedJob
    ? applications.filter(app => app.jobId === selectedJob.id)
    : applications;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
          <p className="text-gray-500">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 font-medium text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold text-xl">x</button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Espace Recruteur</h1>
          <p className="text-gray-500">Bienvenue, {user.name}. Gerez vos offres et candidatures.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
          <a
            href="/#/create-job"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold"
          >
            <Plus size={16} />
            Nouvelle offre
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold">{jobs.length}</div>
              <div className="text-xs text-gray-400">Offres publiees</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold">{applications.length}</div>
              <div className="text-xs text-gray-400">Candidatures recues</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Brain size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold">{applications.filter(a => a.status === 'pending').length}</div>
              <div className="text-xs text-gray-400">En attente</div>
            </div>
          </div>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Aucune offre publiee</h2>
          <p className="text-gray-500 mb-4">Commencez par creer votre premiere offre d'emploi.</p>
          <a
            href="/#/create-job"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            <Plus size={18} />
            Creer une offre
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Selector & Applications */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job selector */}
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              {jobs.map(job => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition ${
                    selectedJob?.id === job.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {job.title}
                </button>
              ))}
            </div>

            {/* Applications table */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">
                  Candidatures pour: {selectedJob?.title || 'Toutes les offres'}
                </h2>
              </div>

              {filteredApplications.length > 0 ? (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase">
                    <tr>
                      <th className="px-6 py-4">Candidat</th>
                      <th className="px-6 py-4">CV</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Analyse IA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredApplications.map(app => (
                      <tr key={app.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{app.candidateName}</div>
                          <div className="text-xs text-gray-400">{app.candidateEmail}</div>
                        </td>
                        <td className="px-6 py-4">
                          {app.cvUrl ? (
                            <a
                              href={api.getCVUrl(app.cvUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-indigo-600 hover:underline text-sm font-medium"
                            >
                              <ExternalLink size={14} /> PDF
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                            app.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' :
                            app.status === 'rejected' ? 'bg-red-50 text-red-600' :
                            app.status === 'reviewed' ? 'bg-blue-50 text-blue-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {app.status === 'accepted' ? 'Acceptee' :
                             app.status === 'rejected' ? 'Rejetee' :
                             app.status === 'reviewed' ? 'En cours' : 'En attente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleAnalyze(app)}
                            disabled={analyzing}
                            className={`p-2 rounded-lg transition ${
                              analyzing && selectedApp?.id === app.id
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                            }`}
                            title="Analyser avec Gemini"
                          >
                            <Brain size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center">
                  <Users size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">Aucune candidature pour cette offre.</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Analysis Panel */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Brain size={20} className="text-indigo-600" /> Analyse Smart Match
            </h2>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[400px]">
              {analyzing ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
                  <p className="text-gray-500 text-sm text-center">Gemini analyse le profil...</p>
                </div>
              ) : analysis ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900">{selectedApp?.candidateName}</h3>
                    <div className={`text-2xl font-black ${analysis.score >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {analysis.score}%
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 italic mb-6">"{analysis.feedback}"</p>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-bold text-emerald-600 uppercase mb-2">Points Forts</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {analysis.pros.length > 0 ? (
                          analysis.pros.map((p, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <CheckCircle size={14} className="text-emerald-400" /> {p}
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-400 text-xs">Aucun</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-red-400 uppercase mb-2">Lacunes</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {analysis.cons.length > 0 ? (
                          analysis.cons.map((c, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <XCircle size={14} className="text-red-300" /> {c}
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-400 text-xs">Aucune</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                  <Brain size={48} className="mb-4 opacity-20" />
                  <p className="text-sm">Cliquez sur l'icone cerveau d'un candidat pour voir l'analyse IA.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCompany;

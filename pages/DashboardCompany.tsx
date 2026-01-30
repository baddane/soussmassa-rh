
import React, { useState, useEffect } from 'react';
import { Job, Application, User } from '../types';
import { api } from '../services/api';
import { geminiService } from '../services/gemini';
import { Users, Brain, Loader2, CheckCircle, XCircle, FileText, ExternalLink, Settings, AlertTriangle, AlertCircle } from 'lucide-react';

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
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [isAiReady, setIsAiReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Validate user data
        if (!user || !user.id || !user.name) {
          throw new Error('Données utilisateur invalides');
        }

        // Check AI availability
        const win = window as any;
        if (win.aistudio) {
          try {
            const hasKey = await win.aistudio.hasSelectedApiKey();
            setIsAiReady(hasKey);
          } catch (err) {
            console.warn('Could not check AI availability:', err);
            setIsAiReady(false);
          }
        }

        // Mock data for demo
        const mockJobs: Job[] = [
          {
            id: '1',
            title: 'Développeur Fullstack',
            companyId: user.id,
            companyName: user.name,
            location: 'Agadir',
            description: 'Nous recherchons un expert React et Python pour rejoindre notre équipe',
            requirements: ['React', 'Python', 'AWS', 'TypeScript'],
            type: 'Full-time',
            createdAt: new Date().toISOString()
          }
        ];
        
        const mockApplications: Application[] = [
          {
            id: 'a1',
            jobId: '1',
            candidateId: 'cand1',
            candidateName: 'Mohammed Alami',
            candidateEmail: 'm.alami@email.com',
            cvUrl: 'cv-alami.pdf',
            status: 'pending',
            appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        setJobs(mockJobs);
        setApplications(mockApplications);
        setError(null);
      } catch (err: any) {
        const errorMessage = err?.message || 'Erreur lors du chargement du tableau de bord';
        setError(errorMessage);
        console.error('Dashboard initialization error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    initializeDashboard();
  }, [user.id, user.name]);

  const handleConfigureAi = async () => {
    try {
      const win = window as any;
      if (!win.aistudio) {
        throw new Error('Google AI Studio n\'est pas disponible. Installez l\'extension Google AI Studio pour utiliser cette fonctionnalité.');
      }
      
      await win.aistudio.openSelectKey();
      const hasKey = await win.aistudio.hasSelectedApiKey();
      
      if (hasKey) {
        setIsAiReady(true);
        setError(null);
      } else {
        throw new Error('Aucune clé API configurée');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Erreur lors de la configuration de l\'IA';
      setError(errorMessage);
      console.error('AI configuration error:', err);
    }
  };

  const handleAnalyze = async (app: Application) => {
    try {
      // Validate application data
      if (!app || !app.id || !app.candidateName || !app.jobId) {
        throw new Error('Données de candidature invalides');
      }

      // Ensure AI is configured
      if (!isAiReady) {
        await handleConfigureAi();
        if (!isAiReady) {
          throw new Error('L\'IA n\'est pas configurée. Veuillez configurer votre clé API.');
        }
      }

      setSelectedApp(app);
      setAnalyzing(true);
      setAnalysis(null);
      setError(null);

      const job = jobs.find(j => j.id === app.jobId);
      if (!job) {
        throw new Error('Emploi non trouvé');
      }

      // Prepare candidate data
      const mockCandidateData = {
        name: app.candidateName,
        email: app.candidateEmail,
        skills: ["React", "Node.js", "AWS basics", "TypeScript"],
        experience: "3 ans chez une startup à Casablanca"
      };

      // Analyze candidate match
      const result = await geminiService.analyzeMatch(job, mockCandidateData);
      
      // Validate result structure
      if (!result || typeof result !== 'object') {
        throw new Error('Format de réponse invalide');
      }

      // Type-cast result as AnalysisResult
      const typedResult: AnalysisResult = {
        score: result.score || 0,
        feedback: result.feedback || '',
        pros: Array.isArray(result.pros) ? result.pros : [],
        cons: Array.isArray(result.cons) ? result.cons : []
      };

      setAnalysis(typedResult);
    } catch (err: any) {
      const errorMessage = err?.message || 'Erreur lors de l\'analyse';
      
      if (err.message === 'API_KEY_REQUIRED') {
        setError('Veuillez configurer votre clé API Gemini');
        setIsAiReady(false);
      } else {
        setError(errorMessage);
      }
      
      console.error('Analysis error:', err);
      setAnalysis(null);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0"/>
          <div className="flex-1">
            <p className="text-red-800 font-medium text-sm">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 font-bold text-xl"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={48}/>
          <p className="text-gray-500 text-center">Chargement du tableau de bord...</p>
        </div>
      ) : !user || !user.id || !user.name ? (
        <div className="flex flex-col items-center justify-center py-32">
          <AlertCircle size={48} className="text-red-600 mb-4 opacity-50"/>
          <p className="text-gray-600 text-center">Données utilisateur invalides</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16">
          <Users size={48} className="mx-auto mb-4 text-gray-300"/>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Aucune candidature</h2>
          <p className="text-gray-500">Les candidatures s'afficheront ici dès qu'elles seront reçues.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Espace Recruteur</h1>
              <p className="text-gray-500">Bienvenue, {user.name}. Gérez vos talents.</p>
            </div>
            <div className="flex items-center gap-4">
              {!isAiReady && (
                <button 
                  onClick={handleConfigureAi}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm font-bold hover:bg-amber-100 transition"
                >
                  <AlertTriangle size={16} /> Configurer l'IA
                </button>
              )}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Users/></div>
                <div>
                  <div className="text-2xl font-bold">{applications.length}</div>
                  <div className="text-xs text-gray-400">Candidatures</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Users size={20}/> Candidatures récentes</h2>
              </div>
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase">
                    <tr>
                      <th className="px-6 py-4">Candidat</th>
                      <th className="px-6 py-4">CV</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">IA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {applications.map(app => {
                      // Validate application data
                      if (!app || !app.id || !app.candidateName) {
                        return null;
                      }
                      
                      return (
                        <tr key={app.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{app.candidateName}</div>
                            <div className="text-xs text-gray-400">{app.candidateEmail || 'Email non fourni'}</div>
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
                              <span className="text-gray-400 text-sm">CV non fourni</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                              app.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' :
                              app.status === 'rejected' ? 'bg-red-50 text-red-600' :
                              'bg-amber-50 text-amber-600'
                            }`}>
                              {app.status === 'accepted' ? 'Acceptée' :
                               app.status === 'rejected' ? 'Rejetée' :
                               'En attente'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleAnalyze(app)}
                              disabled={analyzing}
                              className={`p-2 rounded-lg transition ${
                                analyzing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                                !isAiReady ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 
                                'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                              }`}
                              title={!isAiReady ? "Activer l'IA pour analyser" : analyzing ? "Analyse en cours..." : "Analyser avec l'IA"}
                            >
                              <Brain size={18}/>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Brain size={20} className="text-indigo-600"/> Analyse Smart Match</h2>
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[400px]">
                {analyzing ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-indigo-600 mb-4" size={32}/>
                    <p className="text-gray-500 text-sm text-center">Gemini analyse le profil...</p>
                  </div>
                ) : analysis ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-gray-900">{selectedApp?.candidateName}</h3>
                      <div className={`text-2xl font-black ${analysis.score > 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {analysis.score}%
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 italic mb-6">"{analysis.feedback}"</p>
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs font-bold text-emerald-600 uppercase mb-2">Points Forts</div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {analysis.pros && analysis.pros.length > 0 ? (
                            analysis.pros.map((p: string, i: number) => <li key={i} className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-400"/> {p}</li>)
                          ) : (
                            <li className="text-gray-400 text-xs">Aucun point fort identifié</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-red-400 uppercase mb-2">Lacunes</div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {analysis.cons && analysis.cons.length > 0 ? (
                            analysis.cons.map((c: string, i: number) => <li key={i} className="flex items-center gap-2"><XCircle size={14} className="text-red-300"/> {c}</li>)
                          ) : (
                            <li className="text-gray-400 text-xs">Aucune lacune identifiée</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : !isAiReady ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Settings size={48} className="mb-4 text-amber-400 opacity-50"/>
                    <p className="text-sm text-gray-600 mb-4">L'IA doit être configurée pour analyser les candidatures.</p>
                    <button 
                      onClick={handleConfigureAi}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                    >
                      Activer l'IA
                    </button>
                    <p className="mt-4 text-[10px] text-gray-400">
                      Un compte GCP avec facturation activée est requis.<br/>
                      <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline">Documentation facturation</a>
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                    <FileText size={48} className="mb-4 opacity-20"/>
                    <p className="text-sm">Cliquez sur l'icône cerveau d'un candidat pour voir l'analyse IA.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardCompany;

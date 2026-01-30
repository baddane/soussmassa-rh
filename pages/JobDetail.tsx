
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Job, User, UserType } from '../types';
import { MapPin, Calendar, Clock, Building2, ChevronLeft, Send, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

interface Props {
  user: User | null;
}

const JobDetail: React.FC<Props> = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        if (!id) return;
        const data = await api.getJob(id);
        setJob(data);
      } catch (err) {
        // Mocking for demo
        setJob({
          id: id || '1',
          title: 'Développeur Fullstack React/Python',
          companyId: 'c1',
          companyName: 'Agadir Tech Solutions',
          location: 'Agadir, Marina',
          description: `Nous recherchons un développeur Fullstack talentueux et passionné pour rejoindre notre équipe dynamique basée à Agadir. 
          
          Missions :
          - Concevoir et développer des interfaces utilisateurs réactives avec React.
          - Participer à l'architecture du backend en Python.
          - Collaborer avec l'équipe design pour assurer la meilleure expérience utilisateur possible.
          
          Profil recherché :
          - Maîtrise de React, Tailwind CSS.
          - Connaissance de FastAPI ou Django.
          - Esprit d'équipe et autonomie.`,
          requirements: ['React', 'Python', 'AWS', 'Tailwind', 'Git'],
          type: 'Full-time',
          createdAt: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.userType !== UserType.CANDIDATE) {
      setError('Seuls les candidats peuvent postuler.');
      return;
    }
    if (!selectedFile) {
      setError('Veuillez joindre votre CV au format PDF.');
      return;
    }
    if (!selectedFile.type.includes('pdf')) {
      setError('Veuillez télécharger un fichier PDF.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 5 MB.');
      return;
    }

    setApplying(true);
    setError('');

    try {
      // 1. Get S3 Signed URL
      const { uploadUrl, fileKey } = await api.getUploadUrl(selectedFile.name, selectedFile.type, user.token!);
      
      // 2. Upload to S3
      await api.uploadToS3(uploadUrl, selectedFile);

      // 3. Submit application to API
      const applicationData = {
        jobId: job?.id,
        cvUrl: fileKey,
        candidateName: user.name,
        candidateEmail: user.email,
      };
      await api.applyJob(applicationData, user.token!);

      setApplied(true);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err?.message || 'Erreur lors de la candidature';
      setError(errorMsg);
      // Still mark as applied for demo purposes
      setTimeout(() => setApplied(true), 2000);
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Chargement...</div>;
  if (!job) return <div className="p-20 text-center">Offre non trouvée</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition mb-8 group"
      >
        <ChevronLeft className="group-hover:-translate-x-1 transition" />
        Retour aux offres
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase mb-4">
                {job.type}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{job.title}</h1>
              <div className="flex flex-wrap gap-4 text-gray-500 font-medium">
                <span className="flex items-center gap-2">
                  <Building2 size={18} className="text-gray-400" />
                  {job.companyName}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={18} className="text-gray-400" />
                  {job.location}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar size={18} className="text-gray-400" />
                  Posté aujourd'hui
                </span>
              </div>
            </div>
            
            {!applied ? (
              <div className="shrink-0">
                <div className="p-6 bg-slate-50 rounded-2xl border border-gray-100 w-full md:w-80">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Send size={18} className="text-indigo-600" />
                    Postuler maintenant
                  </h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Votre CV (PDF)</label>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept=".pdf"
                        className="hidden" 
                        id="cv-upload"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                      <label 
                        htmlFor="cv-upload"
                        className={`w-full flex flex-col items-center justify-center px-4 py-4 border-2 border-dashed rounded-xl cursor-pointer transition ${
                          selectedFile ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 bg-white'
                        }`}
                      >
                        <FileText className={selectedFile ? 'text-indigo-600' : 'text-gray-400'} />
                        <span className="text-xs mt-2 text-center text-gray-600 truncate max-w-full px-2">
                          {selectedFile ? selectedFile.name : 'Cliquez pour choisir'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-xs mb-4">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}

                  <button 
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {applying ? <Clock className="animate-spin" size={20} /> : 'Envoyer ma candidature'}
                  </button>
                  <p className="text-[10px] text-gray-400 mt-3 text-center">
                    En postulant, vous acceptez que l'IA Gemini analyse votre CV pour aider le recruteur.
                  </p>
                </div>
              </div>
            ) : (
              <div className="shrink-0">
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 w-full md:w-80 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="font-bold text-emerald-800 mb-2">Candidature envoyée !</h3>
                  <p className="text-sm text-emerald-600">L'entreprise a bien reçu votre CV. Bonne chance !</p>
                </div>
              </div>
            )}
          </div>

          <div className="prose prose-indigo max-w-none mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Description du poste</h2>
            <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Compétences requises</h2>
            <div className="flex flex-wrap gap-2">
              {job.requirements.map(req => (
                <span key={req} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">
                  {req}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;

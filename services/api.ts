
import { Job, Application, User, CandidateProfile } from '../types';

/**
 * CONFIGURATION AWS ISSUE DU SCRIPT DE DÉPLOIEMENT
 */
const API_BASE_URL = process.env.VITE_API_BASE_URL || '';
const AWS_REGION = process.env.VITE_AWS_REGION || 'eu-west-3';
const S3_BUCKET = process.env.VITE_AWS_S3_BUCKET || '';

const getHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
});

export const api = {
  // Helper pour générer l'URL de visualisation d'un CV avec autorisation
  getCVUrl: (fileKey: string) => {
    if (!fileKey || fileKey === '#') {
      console.warn('Empty fileKey provided to getCVUrl');
      return '';
    }
    if (fileKey.startsWith('http')) return fileKey;
    
    // Si le bucket n'est pas configuré, on ne peut pas générer l'URL
    if (!S3_BUCKET) {
      console.warn("S3_BUCKET non configuré dans .env.local");
      return '';
    }

    // Sanitize fileKey to prevent injection
    const sanitizedKey = fileKey.replace(/[^a-zA-Z0-9._-]/g, '');
    const baseUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${sanitizedKey}`;
    
    // Dans cet environnement, l'accès aux ressources S3 nécessite souvent l'API_KEY en paramètre
    const apiKey = process.env.API_KEY;
    if (apiKey && apiKey !== 'votre_cle_gemini_ici') {
      return `${baseUrl}?key=${encodeURIComponent(apiKey)}`;
    }

    return baseUrl;
  },

  // Auth (Proxy vers Cognito via Lambdas)
  login: async (credentials: any): Promise<User> => {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error('Échec de la connexion');
    return res.json();
  },

  register: async (data: any, type: 'candidate' | 'company'): Promise<User> => {
    const endpoint = type === 'candidate' ? '/register-candidate' : '/register-company';
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Échec de l\'inscription');
    return res.json();
  },

  // Jobs
  getJobs: async (): Promise<Job[]> => {
    const res = await fetch(`${API_BASE_URL}/jobs`);
    if (!res.ok) throw new Error('Impossible de récupérer les offres');
    return res.json();
  },

  getJob: async (id: string): Promise<Job> => {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}`);
    if (!res.ok) throw new Error('Offre introuvable');
    return res.json();
  },

  createJob: async (jobData: Partial<Job>, token: string): Promise<Job> => {
    const res = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(jobData),
    });
    if (!res.ok) throw new Error('Erreur lors de la création de l\'offre');
    return res.json();
  },

  // Applications
  applyJob: async (applicationData: any, token: string): Promise<Application> => {
    const res = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(applicationData),
    });
    if (!res.ok) throw new Error('Erreur lors du dépôt de candidature');
    return res.json();
  },

  getApplications: async (jobId: string, token: string): Promise<Application[]> => {
    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/applications`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Erreur lors de la récupération des candidatures');
    return res.json();
  },

  // S3 Upload Logic via URL signée
  getUploadUrl: async (filename: string, contentType: string, token: string): Promise<{ uploadUrl: string, fileKey: string }> => {
    const res = await fetch(`${API_BASE_URL}/cv`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ filename, contentType }),
    });
    if (!res.ok) throw new Error('Impossible d\'obtenir l\'URL d\'upload');
    return res.json();
  },

  uploadToS3: async (url: string, file: File): Promise<void> => {
    // Validate file
    if (!file) throw new Error('Aucun fichier fourni');
    if (!file.type.includes('pdf')) throw new Error('Seuls les fichiers PDF sont acceptés');
    if (file.size > 5 * 1024 * 1024) throw new Error('Le fichier ne doit pas dépasser 5 MB');
    
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!res.ok) throw new Error('Échec du transfert vers S3');
  }
};

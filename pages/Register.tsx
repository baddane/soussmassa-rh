
import React from 'react';
import { Building2, UserCircle2 } from 'lucide-react';
import { User, UserType } from '../types';

const Register: React.FC = () => {
  const [selectedType, setSelectedType] = React.useState<'candidate' | 'company' | null>(null);
  const [formData, setFormData] = React.useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleRegister = async (type: 'candidate' | 'company') => {
    // Validation
    if (!formData.email || !formData.password || !formData.name) {
      setError('Tous les champs sont requis');
      return;
    }
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Simulate registration
      setTimeout(() => {
        const mockUser: User = {
          id: Math.random().toString(),
          email: formData.email,
          name: formData.name,
          userType: type === 'candidate' ? UserType.CANDIDATE : UserType.COMPANY,
          token: 'mock-token-' + Date.now()
        };
        // Store in localStorage for demo
        localStorage.setItem('souss_rh_auth', JSON.stringify(mockUser));
        window.location.href = type === 'candidate' ? '/#/candidate' : '/#/company';
      }, 800);
    } catch (err) {
      setError('Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  if (selectedType) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200 border border-gray-100 w-full max-w-md">
          <button
            onClick={() => { setSelectedType(null); setError(''); }}
            className="mb-6 text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
          >
            ← Retour
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            S'inscrire comme {selectedType === 'candidate' ? 'candidat' : 'entreprise'}
          </h1>
          <p className="text-gray-500 mb-8">Créez votre compte en quelques étapes.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nom complet</label>
              <input
                type="text"
                className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Votre nom"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mot de passe</label>
              <input
                type="password"
                className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Minimum 8 caractères"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <button
              onClick={() => handleRegister(selectedType)}
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Inscription en cours...' : 'S\'inscrire'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Rejoignez l'aventure SoussMassa RH</h1>
          <p className="text-xl text-gray-500">Choisissez votre profil pour commencer</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button
            onClick={() => setSelectedType('candidate')}
            className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-50 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition duration-300">
              <UserCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Je suis un candidat</h2>
            <p className="text-gray-500 leading-relaxed">
              Je cherche un emploi dans la région Souss-Massa et je souhaite uploader mon CV.
            </p>
            <div className="mt-8 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl group-hover:bg-indigo-700 transition">
              C'est parti
            </div>
          </button>

          <button
            onClick={() => setSelectedType('company')}
            className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-50 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition duration-300">
              <Building2 size={48} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Je suis une entreprise</h2>
            <p className="text-gray-500 leading-relaxed">
              Je souhaite recruter les meilleurs talents locaux et publier des offres d'emploi.
            </p>
            <div className="mt-8 px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl group-hover:bg-emerald-700 transition">
              C'est parti
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;


import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Zap, Building2, UserCircle2, ArrowRight } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold mb-8 animate-bounce">
            <Zap size={14}/> Matching Intelligent Gemini IA activé
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 tracking-tight leading-tight">
            Le futur du recrutement en <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">Souss-Massa</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12">
            Connectez-vous directement aux meilleures entreprises d'Agadir, Taghazout et de toute la région grâce à notre plateforme propulsée par l'IA.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/jobs" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white text-lg font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition flex items-center justify-center gap-2">
              Explorer les offres <Search size={20}/>
            </Link>
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-100 text-gray-600 text-lg font-bold rounded-2xl hover:bg-gray-50 transition">
              Je recrute
            </Link>
          </div>
        </div>

        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
      </section>

      {/* Role Selection */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition">
              <UserCircle2 size={32}/>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Candidats</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">Uploadez votre CV en toute sécurité sur AWS, et laissez notre IA vous proposer des postes qui correspondent réellement à votre profil.</p>
            <Link to="/login" className="text-indigo-600 font-bold flex items-center gap-2">Déposer mon CV <ArrowRight size={18}/></Link>
          </div>

          <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition">
              <Building2 size={32}/>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Entreprises</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">Publiez vos offres et profitez du Smart Match de Gemini pour trier automatiquement les candidatures les plus pertinentes.</p>
            <Link to="/login" className="text-emerald-600 font-bold flex items-center gap-2">Publier une offre <ArrowRight size={18}/></Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

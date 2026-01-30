
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { User, UserType } from './types';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import JobBoard from './pages/JobBoard';
import JobDetail from './pages/JobDetail';
import DashboardCandidate from './pages/DashboardCandidate';
import DashboardCompany from './pages/DashboardCompany';
import CreateJob from './pages/CreateJob';
import { LogOut, Menu, X, PlusCircle, Briefcase } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('souss_rh_auth');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate user object
        if (parsed.id && parsed.email && parsed.userType) {
          setUser(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to restore user session:', err);
      localStorage.removeItem('souss_rh_auth');
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('souss_rh_auth', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('souss_rh_auth');
    } catch (err) {
      console.error('Failed to clear session:', err);
    }
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">SM</div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">SoussMassa RH</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/jobs" className="text-gray-600 hover:text-indigo-600 font-medium">Offres</Link>
              {user ? (
                <>
                  <Link to={user.userType === UserType.CANDIDATE ? "/candidate" : "/company"} className="text-gray-600 hover:text-indigo-600 font-medium">Dashboard</Link>
                  {user.userType === UserType.COMPANY && (
                    <Link to="/jobs/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 transition">
                      <PlusCircle size={18} /> Publier
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 transition"><LogOut size={20} /></button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-gray-600 font-medium px-4 py-2">Connexion</Link>
                  <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition">S'inscrire</Link>
                </div>
              )}
            </div>

            <button className="md:hidden text-gray-500" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<JobBoard />} />
            <Route path="/jobs/:id" element={<JobDetail user={user} />} />
            <Route path="/candidate" element={user?.userType === UserType.CANDIDATE ? <DashboardCandidate user={user} /> : <Navigate to="/login" />} />
            <Route path="/company" element={user?.userType === UserType.COMPANY ? <DashboardCompany user={user} /> : <Navigate to="/login" />} />
            <Route path="/jobs/new" element={user?.userType === UserType.COMPANY ? <CreateJob user={user} /> : <Navigate to="/login" />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-100 py-10 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-400 text-sm">© 2024 SoussMassa RH - Infrastructure AWS & Intelligence Artificielle.</p>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;

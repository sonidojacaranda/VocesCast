import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ManagerView } from './components/ManagerView';
import { ClientView } from './components/ClientView';
import { TalentView } from './components/TalentView';
import { User, UserRole, CastingProject, TalentProfile } from './types';
import { MOCK_PROJECTS, MOCK_TALENTS } from './data/mockData';
import { Mic2, UserCheck, KeyRound } from 'lucide-react';

const App: React.FC = () => {
  // --- Global State Simulation ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  
  // Data State
  const [projects, setProjects] = useState<CastingProject[]>(MOCK_PROJECTS);
  const [talents, setTalents] = useState<TalentProfile[]>(MOCK_TALENTS);

  // Stats derivation
  const stats = {
    totalTalents: talents.length,
    activeCastings: projects.filter(p => p.status === 'open').length,
    completedCastings: projects.filter(p => p.status === 'completed').length,
    totalClients: 15,
    revenue: 45200
  };

  // --- Handlers ---

  const handleLogin = (role: UserRole) => {
    let mockUser: User = {
      id: 'u1',
      name: 'Admin User',
      email: 'admin@vocescast.com',
      role: role
    };

    if (role === UserRole.TALENT) {
      // Login as the first mock talent
      mockUser = talents[0];
      setCurrentView('profile');
    } else if (role === UserRole.CLIENT) {
      mockUser.name = "Agencia 360";
      setCurrentView('my-castings');
    } else {
      setCurrentView('dashboard');
    }
    
    setCurrentUser(mockUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  const handleCreateProject = (project: CastingProject) => {
    setProjects(prev => [project, ...prev]);
  };

  const handleUpdateTalent = (updated: TalentProfile) => {
    setTalents(prev => prev.map(t => t.id === updated.id ? updated : t));
    // If user is editing themselves, update currentUser state too
    if (currentUser?.id === updated.id) {
        setCurrentUser(updated);
    }
  };

  // --- Render ---

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center space-y-8">
           <div className="flex flex-col items-center">
             <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
               <Mic2 className="w-8 h-8 text-white" />
             </div>
             <h1 className="text-3xl font-bold text-slate-900">VocesCast AI</h1>
             <p className="text-slate-500 mt-2">Plataforma Inteligente de Casting de Voz</p>
           </div>

           <div className="space-y-3">
             <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Ingresar como:</p>
             
             <button 
                onClick={() => handleLogin(UserRole.MANAGER)}
                className="w-full p-4 rounded-xl border border-slate-200 hover:border-primary hover:bg-slate-50 flex items-center gap-4 transition-all group"
             >
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-slate-800">Manager / Admin</span>
                  <span className="text-xs text-slate-500">Gestión total de la plataforma</span>
                </div>
             </button>

             <button 
                onClick={() => handleLogin(UserRole.CLIENT)}
                className="w-full p-4 rounded-xl border border-slate-200 hover:border-primary hover:bg-slate-50 flex items-center gap-4 transition-all group"
             >
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-slate-800">Cliente / Agencia</span>
                  <span className="text-xs text-slate-500">Crear castings con IA</span>
                </div>
             </button>

             <button 
                onClick={() => handleLogin(UserRole.TALENT)}
                className="w-full p-4 rounded-xl border border-slate-200 hover:border-primary hover:bg-slate-50 flex items-center gap-4 transition-all group"
             >
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Mic2 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-slate-800">Locutor / Talento</span>
                  <span className="text-xs text-slate-500">Gestionar perfil y demos</span>
                </div>
             </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        role={currentUser.role} 
        currentView={currentView} 
        onChangeView={setCurrentView}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
          {currentUser.role === UserRole.MANAGER && (
            <ManagerView 
              stats={stats} 
              talents={talents} 
              projects={projects}
              onUpdateTalent={handleUpdateTalent}
              onCreateProject={handleCreateProject}
              currentView={currentView}
            />
          )}

          {currentUser.role === UserRole.CLIENT && (
            <ClientView 
              projects={projects} 
              talents={talents} 
              onCreateProject={handleCreateProject}
              view={currentView}
            />
          )}

          {currentUser.role === UserRole.TALENT && (
            <TalentView 
              talent={currentUser as TalentProfile}
              allProjects={projects}
              onUpdate={handleUpdateTalent}
              view={currentView}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
import React from 'react';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  Mic2, 
  Briefcase, 
  Settings, 
  LogOut,
  PlusCircle,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  currentView: string;
  onChangeView: (view: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, currentView, onChangeView, onLogout }) => {
  const getMenuItems = () => {
    switch (role) {
      case UserRole.MANAGER:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'talents', label: 'Locutores', icon: Users },
          { id: 'castings', label: 'Castings', icon: Briefcase },
          { id: 'clients', label: 'Clientes', icon: BarChart3 },
        ];
      case UserRole.CLIENT:
        return [
          { id: 'my-castings', label: 'Mis Proyectos', icon: Briefcase },
          { id: 'create-casting', label: 'Nuevo Casting (IA)', icon: PlusCircle },
          { id: 'favorites', label: 'Favoritos', icon: Users },
        ];
      case UserRole.TALENT:
        return [
          { id: 'profile', label: 'Mi Perfil', icon: Users },
          { id: 'opportunities', label: 'Castings Abiertos', icon: Mic2 },
          { id: 'demos', label: 'Mis Demos', icon: Briefcase },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-50">
      <div className="p-6 border-b border-slate-800 flex items-center gap-2">
        <Mic2 className="w-8 h-8 text-primary" />
        <span className="text-xl font-bold text-white">VocesCast</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <div className="text-xs uppercase tracking-wider text-slate-400 mb-4 px-2 font-semibold">
          {role === UserRole.MANAGER ? 'Administración' : role === UserRole.CLIENT ? 'Agencia' : 'Talento'}
        </div>
        
        {getMenuItems().map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === item.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                : 'hover:bg-slate-800 text-white hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};
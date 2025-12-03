import React, { useState } from 'react';
import { Stats, TalentProfile, CastingProject, UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Briefcase, DollarSign, CheckCircle, Clock, Edit, Search, PlusCircle, User, ArrowLeft, Star } from 'lucide-react';
import { TalentView } from './TalentView';
import { ClientView } from './ClientView'; // Reusing for "Create Casting" logic

interface ManagerViewProps {
  stats: Stats;
  talents: TalentProfile[];
  projects: CastingProject[];
  onUpdateTalent: (talent: TalentProfile) => void;
  onCreateProject: (project: CastingProject) => void;
  currentView: string;
}

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
    </div>
    <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
  </div>
);

export const ManagerView: React.FC<ManagerViewProps> = ({ 
  stats, 
  talents, 
  projects, 
  onUpdateTalent, 
  onCreateProject,
  currentView 
}) => {
  // Local state for navigation within Manager View if not controlled externally fully
  // But App.tsx passes 'currentView', so we use that to render content.
  
  // Specific states for internal management features
  const [editingTalentId, setEditingTalentId] = useState<string | null>(null);
  const [isCreatingCasting, setIsCreatingCasting] = useState(false);

  const chartData = [
    { name: 'Ene', castings: 4, revenue: 2400 },
    { name: 'Feb', castings: 7, revenue: 4500 },
    { name: 'Mar', castings: 5, revenue: 3200 },
    { name: 'Abr', castings: 12, revenue: 6000 },
    { name: 'May', castings: 15, revenue: 8500 },
    { name: 'Jun', castings: 20, revenue: 11000 },
  ];

  // --- Render Functions ---

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Panel de Control</h1>
        <p className="text-slate-500">Resumen general de actividad de la plataforma.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Locutores" value={stats.totalTalents} icon={Users} color="bg-blue-500 text-blue-600" />
        <StatCard title="Castings Activos" value={stats.activeCastings} icon={Clock} color="bg-amber-500 text-amber-600" />
        <StatCard title="Completados" value={stats.completedCastings} icon={CheckCircle} color="bg-emerald-500 text-emerald-600" />
        <StatCard title="Ingresos (Est.)" value={`$${stats.revenue.toLocaleString()}`} icon={DollarSign} color="bg-indigo-500 text-indigo-600" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 text-slate-800">Crecimiento de Castings</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="castings" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 text-slate-800">Ingresos Mensuales</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTalentsTable = () => {
    if (editingTalentId) {
        const talent = talents.find(t => t.id === editingTalentId);
        if (!talent) return <div>Error: Talent not found</div>;
        return (
            <div className="space-y-4">
                <button onClick={() => setEditingTalentId(null)} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Volver al listado
                </button>
                {/* We reuse TalentView but enable editing */}
                <TalentView 
                    talent={talent} 
                    onUpdate={(updated) => {
                        onUpdateTalent(updated);
                        setEditingTalentId(null);
                    }} 
                    view="profile" 
                />
            </div>
        )
    }

    return (
      <div className="space-y-6 animate-fade-in">
         <header className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Gestión de Locutores</h1>
                <p className="text-slate-500">Administra, edita y revisa a todos los talentos.</p>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="Buscar locutor..." className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
            </div>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="p-4 font-semibold text-slate-700">Nombre</th>
                        <th className="p-4 font-semibold text-slate-700">Género / Edad</th>
                        <th className="p-4 font-semibold text-slate-700">Marcas Habituales</th>
                        <th className="p-4 font-semibold text-slate-700">Rating</th>
                        <th className="p-4 font-semibold text-slate-700 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {talents.map(talent => (
                        <tr key={talent.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 flex items-center gap-3">
                                <img src={talent.avatarUrl} className="w-8 h-8 rounded-full object-cover" />
                                <span className="font-medium text-slate-900">{talent.name}</span>
                            </td>
                            <td className="p-4 text-slate-600">{talent.gender}, {talent.ageRange}</td>
                            <td className="p-4 text-slate-600 text-sm max-w-xs truncate">{talent.regularBrands.join(', ')}</td>
                            <td className="p-4">
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded text-sm font-bold">
                                    <Star className="w-3 h-3 fill-current" /> {talent.rating}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <button 
                                    onClick={() => setEditingTalentId(talent.id)}
                                    className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors" title="Editar"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    );
  };

  const renderCastingsTable = () => {
    if (isCreatingCasting) {
        return (
            <div className="space-y-4">
                <button onClick={() => setIsCreatingCasting(false)} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Cancelar creación
                </button>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                    <p className="text-sm text-slate-600">
                        <span className="font-bold">Modo Admin:</span> Estás creando un casting en nombre de un cliente. 
                    </p>
                </div>
                <ClientView 
                    projects={[]} 
                    talents={talents} 
                    onCreateProject={(p) => {
                        onCreateProject(p);
                        setIsCreatingCasting(false);
                    }} 
                    view="create-casting" 
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Gestión de Castings</h1>
                    <p className="text-slate-500">Supervisa todos los proyectos de la plataforma.</p>
                </div>
                <button 
                    onClick={() => setIsCreatingCasting(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                    <PlusCircle className="w-5 h-5" /> Nuevo Casting
                </button>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold text-slate-700">Proyecto</th>
                            <th className="p-4 font-semibold text-slate-700">Cliente</th>
                            <th className="p-4 font-semibold text-slate-700">Fecha</th>
                            <th className="p-4 font-semibold text-slate-700">Roles</th>
                            <th className="p-4 font-semibold text-slate-700">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {projects.map(project => (
                            <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-medium text-slate-900">{project.title}</td>
                                <td className="p-4 text-slate-600">{project.clientName}</td>
                                <td className="p-4 text-slate-500 text-sm">{new Date(project.createdAt).toLocaleDateString()}</td>
                                <td className="p-4 text-slate-600">{project.roles.length}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium capitalize 
                                    ${project.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                        project.status === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                                    {project.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };

  const renderClients = () => (
      <div className="space-y-6 animate-fade-in">
        <header>
            <h1 className="text-3xl font-bold text-slate-900">Cartera de Clientes</h1>
            <p className="text-slate-500">Agencias y productoras registradas.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Agencia 360', 'NatGeo Local', 'Innovate SA', 'MediaPro', 'Ogilvy Mad'].map((client, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800">{client}</h4>
                        <p className="text-xs text-slate-500">ID: c-{100+i}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
  );

  // Main routing logic for Manager View
  if (currentView === 'talents') return renderTalentsTable();
  if (currentView === 'castings') return renderCastingsTable();
  if (currentView === 'clients') return renderClients();
  
  return renderDashboard();
};
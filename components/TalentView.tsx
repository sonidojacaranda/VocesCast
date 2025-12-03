import React, { useState } from 'react';
import { TalentProfile, CastingProject } from '../types';
import { Save, Upload, Mic, Star, Briefcase, CheckCircle, BellRing } from 'lucide-react';

interface TalentViewProps {
  talent: TalentProfile;
  allProjects?: CastingProject[]; // Passed for "Open Castings" view
  onUpdate: (updated: TalentProfile) => void;
  view: string;
  isReadOnly?: boolean; // For manager viewing
}

// Reuse gender normalization for consistent matching
const normalizeGender = (g: string) => {
  if (!g) return 'any';
  const lower = g.toLowerCase();
  if (lower.includes('fem') || lower.includes('mujer') || lower.includes('woman') || lower.includes('chica')) return 'female';
  if (lower.includes('masc') || lower.includes('hombre') || lower.includes('man') || lower.includes('chico')) return 'male';
  return 'any';
};

export const TalentView: React.FC<TalentViewProps> = ({ talent, allProjects = [], onUpdate, view, isReadOnly = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(talent);

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof TalentProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInput = (field: 'regularBrands' | 'pastBrands' | 'dubbingActors', value: string) => {
    const arr = value.split(',').map(s => s.trim());
    handleInputChange(field, arr);
  };

  // Ensure we are viewing "Profile" if view is profile or if opened by manager (who passes view='profile' usually)
  const isProfileView = view === 'profile' || view === 'talents'; 

  if (view === 'opportunities') {
    const openProjects = allProjects.filter(p => p.status === 'open');
    const myGender = normalizeGender(formData.gender);

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Castings Abiertos</h1>
        <p className="text-slate-500">Oportunidades que encajan con tu perfil.</p>
        
        <div className="grid gap-6">
          {openProjects.map(project => (
            <div key={project.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                   <h3 className="text-xl font-bold text-slate-800">{project.title}</h3>
                   <span className="text-sm text-slate-500">{project.clientName} • {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                  Audicionar
                </button>
              </div>
              
              <div className="space-y-3">
                {project.roles.map(role => {
                    const roleGender = normalizeGender(role.gender);
                    const isMatch = roleGender === 'any' || roleGender === myGender;
                    const isSelected = role.selectedTalentId === talent.id;

                    return (
                        <div key={role.id} className={`p-4 rounded-lg border transition-all ${isSelected ? 'bg-green-50 border-green-300 ring-2 ring-green-400' : isMatch ? 'bg-slate-50 border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                            <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                <Mic className={`w-4 h-4 ${isSelected ? 'text-green-600' : isMatch ? 'text-slate-500' : 'text-slate-300'}`} />
                                {role.name}
                            </h4>
                            <div className="flex items-center gap-2">
                                {isSelected && (
                                    <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm animate-pulse">
                                        <BellRing className="w-3 h-3" /> ¡SELECCIONADO!
                                    </span>
                                )}
                                {isMatch && !isSelected && (
                                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Match
                                    </span>
                                )}
                            </div>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{role.description}</p>
                            <div className="flex gap-2 mt-2 text-xs">
                                <span className="bg-white px-2 py-1 rounded border border-slate-200 text-slate-500">{role.gender}</span>
                                <span className="bg-white px-2 py-1 rounded border border-slate-200 text-slate-500">{role.ageRange}</span>
                                <span className="bg-white px-2 py-1 rounded border border-slate-200 text-slate-500 font-medium text-purple-600">{role.voiceType}</span>
                            </div>
                        </div>
                    );
                })}
              </div>
            </div>
          ))}
          {openProjects.length === 0 && (
             <div className="text-center py-12 text-slate-500">
               No hay castings abiertos en este momento.
             </div>
          )}
        </div>
      </div>
    );
  }

  if (view === 'demos') {
    return (
       <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-slate-900">Mis Demos</h1>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Galería de Audio</h3>
                <button className="text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                    <Upload className="w-4 h-4" /> Subir Nueva Demo
                </button>
             </div>
             <div className="space-y-4">
                 {formData.demos.map((demo, idx) => (
                     <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                                <Mic className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">{demo.title}</h4>
                                <div className="flex gap-2 mt-1">
                                    {demo.tags.map(tag => (
                                        <span key={tag} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500 uppercase tracking-wide">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                         </div>
                         <audio controls className="h-8">
                            <source src={demo.url} />
                         </audio>
                     </div>
                 ))}
             </div>
        </div>
       </div>
    );
  }

  // Profile View
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900">{isReadOnly ? 'Detalles del Locutor' : 'Mi Perfil Profesional'}</h1>
          {!isReadOnly && (
              !isEditing ? (
                <button onClick={() => setIsEditing(true)} className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 shadow-lg shadow-primary/20">
                    Editar Perfil
                </button>
            ) : (
                <div className="flex gap-2">
                    <button onClick={() => setIsEditing(false)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-300">
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-600/20">
                        <Save className="w-4 h-4" /> Guardar
                    </button>
                </div>
            )
          )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center gap-4">
                      <img src={formData.avatarUrl} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-slate-50 shadow-lg" />
                      <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-3 py-1 rounded-full">
                          <Star className="w-4 h-4 fill-current" />
                          <span>{formData.rating}</span>
                      </div>
                  </div>
                  
                  <div className="flex-1 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Artístico</label>
                              <input 
                                  disabled={!isEditing}
                                  type="text" 
                                  value={formData.name} 
                                  onChange={e => handleInputChange('name', e.target.value)}
                                  className="w-full p-2 border rounded-md disabled:bg-slate-50 disabled:text-slate-600 font-medium"
                              />
                          </div>
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Rango de Edad</label>
                              <input 
                                  disabled={!isEditing}
                                  type="text" 
                                  value={formData.ageRange} 
                                  onChange={e => handleInputChange('ageRange', e.target.value)}
                                  className="w-full p-2 border rounded-md disabled:bg-slate-50 disabled:text-slate-600"
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción / Bio</label>
                          <textarea 
                              disabled={!isEditing}
                              rows={3}
                              value={formData.description} 
                              onChange={e => handleInputChange('description', e.target.value)}
                              className="w-full p-2 border rounded-md disabled:bg-slate-50 disabled:text-slate-600"
                          />
                      </div>

                      <div className="bg-slate-50 p-6 rounded-xl space-y-6 border border-slate-200">
                           <h3 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                              <Briefcase className="w-5 h-5 text-primary" />
                              Historial y Asociaciones
                           </h3>
                           
                           <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1">
                                Marcas Habituales (Voz Oficial)
                              </label>
                              <p className="text-xs text-slate-500 mb-2">Marcas para las que eres la voz recurrente.</p>
                              <input 
                                  disabled={!isEditing}
                                  type="text" 
                                  value={formData.regularBrands.join(', ')} 
                                  onChange={e => handleArrayInput('regularBrands', e.target.value)}
                                  placeholder="Ej: Coca-Cola, Ford..."
                                  className="w-full p-2 border border-blue-200 bg-blue-50/50 rounded-md disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-600"
                              />
                          </div>

                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1">
                                Historial de Marcas (Trabajos Puntuales)
                              </label>
                              <p className="text-xs text-slate-500 mb-2">Marcas con las que has trabajado alguna vez.</p>
                              <input 
                                  disabled={!isEditing}
                                  type="text" 
                                  value={formData.pastBrands?.join(', ') || ''} 
                                  onChange={e => handleArrayInput('pastBrands', e.target.value)}
                                  placeholder="Ej: Tienda Local, Promo Verano..."
                                  className="w-full p-2 border rounded-md disabled:bg-slate-100 disabled:text-slate-600"
                              />
                          </div>

                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1">Actor de Doblaje de:</label>
                              <p className="text-xs text-slate-500 mb-2">Actores famosos a los que sueles doblar.</p>
                              <input 
                                  disabled={!isEditing}
                                  type="text" 
                                  value={formData.dubbingActors.join(', ')} 
                                  onChange={e => handleArrayInput('dubbingActors', e.target.value)}
                                  placeholder="Ej: Brad Pitt, Scarlett Johansson..."
                                  className="w-full p-2 border rounded-md disabled:bg-slate-100 disabled:text-slate-600"
                              />
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
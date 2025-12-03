import React, { useState } from 'react';
import { CastingProject, CastingRole, TalentProfile } from '../types';
import { analyzeCastingRequirements } from '../services/geminiService';
import { Wand2, Mic, Check, Play, Search, AlertCircle, Loader2, ArrowLeft, Users, MousePointerClick, Tag, Type } from 'lucide-react';

interface ClientViewProps {
  projects: CastingProject[];
  talents: TalentProfile[];
  onCreateProject: (project: CastingProject) => void;
  view: string;
}

// Normalize gender for strict matching
const normalizeGender = (g: string) => {
  if (!g) return 'any';
  const lower = g.toLowerCase();
  // Check for Female variants
  if (lower.includes('fem') || lower.includes('mujer') || lower.includes('woman') || lower.includes('chica') || lower.includes('niña')) return 'female';
  // Check for Male variants
  if (lower.includes('masc') || lower.includes('hombre') || lower.includes('man') || lower.includes('chico') || lower.includes('niño')) return 'male';
  return 'any';
};

// Strict Age Matching Logic
const getCompatibleAgeRanges = (inputAge: string): string[] => {
  const lower = inputAge.toLowerCase();
  
  // Database values: "Niño (5-10)", "Adolescente (12-18)", "20-30", "30-40", "40-50", "50-60", "60+"
  
  if (lower.includes('niñ') || lower.includes('child') || lower.includes('kid') || lower.includes('5-10')) {
    return ["Niño (5-10)"];
  }
  if (lower.includes('adol') || lower.includes('teen') || lower.includes('oven') || lower.includes('12-18') || lower.includes('15')) {
    return ["Adolescente (12-18)"];
  }
  if (lower.includes('20') || lower.includes('veinte') || lower.includes('twenty')) {
    return ["20-30"];
  }
  if (lower.includes('30') || lower.includes('treinta') || lower.includes('thirty')) {
    return ["30-40"];
  }
  if (lower.includes('40') || lower.includes('cuarenta') || lower.includes('forty')) {
    return ["40-50"];
  }
  if (lower.includes('50') || lower.includes('cincuenta') || lower.includes('fifty')) {
    return ["50-60"];
  }
  if (lower.includes('60') || lower.includes('sesenta') || lower.includes('sixty') || lower.includes('senior') || lower.includes('anciano') || lower.includes('abuel')) {
    return ["60+"];
  }
  
  // Fallback for vague terms
  if (lower.includes('adult') || lower.includes('adulto')) {
    return ["20-30", "30-40", "40-50", "50-60"];
  }

  return []; // Empty implies ANY if not caught, or we can force strictness.
};

export const ClientView: React.FC<ClientViewProps> = ({ projects, talents, onCreateProject, view }) => {
  // State for AI Wizard
  const [prompt, setPrompt] = useState('');
  const [brandName, setBrandName] = useState('');
  const [campaignName, setCampaignName] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedRoles, setGeneratedRoles] = useState<Omit<CastingRole, 'id'>[]>([]);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [step, setStep] = useState<'input' | 'review' | 'success'>('input');
  
  // Track selected talents for the new project being created
  // Key: role index, Value: talentId
  const [selectedCandidates, setSelectedCandidates] = useState<Record<number, string>>({});

  // State for Project Details
  const [selectedProject, setSelectedProject] = useState<CastingProject | null>(null);
  
  // Handlers
  const handleAnalyze = async () => {
    if (!prompt.trim()) return;
    setIsAnalyzing(true);
    try {
      // We pass the brand and campaign context to the AI as well
      const fullPrompt = `Marca: ${brandName}. Campaña: ${campaignName}. Descripción: ${prompt}`;
      const result = await analyzeCastingRequirements(fullPrompt);
      
      setGeneratedRoles(result.roles);
      // If user typed a campaign name, prefer it over AI suggestion
      setGeneratedTitle(campaignName.trim() ? campaignName : result.title);
      setStep('review');
      setSelectedCandidates({}); // Reset selections
    } catch (error) {
      alert("Error al analizar con IA. Intenta de nuevo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectCandidate = (roleIndex: number, talentId: string) => {
    setSelectedCandidates(prev => ({
      ...prev,
      [roleIndex]: talentId
    }));
  };

  const handleConfirmProject = () => {
    const newProject: CastingProject = {
      id: Date.now().toString(),
      title: generatedTitle,
      clientId: 'current-client',
      clientName: 'Mi Agencia',
      brand: brandName,
      status: 'open',
      createdAt: new Date().toISOString(),
      description: prompt,
      roles: generatedRoles.map((r, i) => ({ 
        ...r, 
        id: `new-r-${i}`,
        selectedTalentId: selectedCandidates[i] || undefined 
      }))
    };
    onCreateProject(newProject);
    setStep('success');
  };

  // Find matching talents for a role with STRICT logic
  const findMatches = (role: Omit<CastingRole, 'id'>) => {
    const roleGender = normalizeGender(role.gender);
    const compatibleAgeRanges = getCompatibleAgeRanges(role.ageRange);
    
    // Filter talents
    const matches = talents.filter(t => {
      const talentGender = normalizeGender(t.gender);
      
      // 1. Strict Gender Match
      if (roleGender !== 'any' && roleGender !== talentGender) {
        return false;
      }
      
      // 2. Strict Age Match
      // If we identified specific compatible ranges from the role requirement,
      // the talent MUST match one of them.
      if (compatibleAgeRanges.length > 0) {
        if (!compatibleAgeRanges.includes(t.ageRange)) {
            return false;
        }
      }
      
      return true;
    });

    // Sort by Voice Type Relevance (Simple keyword matching boost)
    matches.sort((a, b) => {
        const roleType = role.voiceType.toLowerCase();
        const aScore = roleType.split(' ').some(w => a.description.toLowerCase().includes(w)) ? 1 : 0;
        const bScore = roleType.split(' ').some(w => b.description.toLowerCase().includes(w)) ? 1 : 0;
        return bScore - aScore;
    });

    return matches.slice(0, 10); 
  };

  if (view === 'my-castings') {
    // Detailed Project View
    if (selectedProject) {
        return (
            <div className="space-y-6 animate-fade-in">
                <button onClick={() => setSelectedProject(null)} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Volver a mis proyectos
                </button>
                
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-slate-900">{selectedProject.title}</h1>
                                {selectedProject.brand && (
                                    <span className="bg-indigo-100 text-indigo-700 px-3 py-0.5 rounded-full text-sm font-semibold">
                                        {selectedProject.brand}
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-600 max-w-2xl">{selectedProject.description}</p>
                        </div>
                        <span className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-lg uppercase tracking-wide">
                            {selectedProject.status}
                        </span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" /> Roles y Candidatos
                    </h2>
                    
                    <div className="grid gap-6">
                        {selectedProject.roles.map(role => {
                            const selectedTalent = role.selectedTalentId ? talents.find(t => t.id === role.selectedTalentId) : null;

                            return (
                                <div key={role.id} className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <div className="mb-4">
                                        <h3 className="font-bold text-lg text-slate-900">{role.name}</h3>
                                        <p className="text-slate-600 text-sm">{role.description}</p>
                                        <div className="flex gap-2 mt-2 text-xs">
                                            <span className="bg-white px-2 py-1 rounded border border-slate-200">{role.gender}</span>
                                            <span className="bg-white px-2 py-1 rounded border border-slate-200">{role.ageRange}</span>
                                            <span className="bg-white px-2 py-1 rounded border border-slate-200 text-purple-700 border-purple-100">{role.voiceType}</span>
                                        </div>
                                    </div>

                                    {/* Show Selected Candidate if exists */}
                                    {selectedTalent ? (
                                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
                                            <p className="text-xs font-bold text-green-700 uppercase mb-2 flex items-center gap-1">
                                                <Check className="w-3 h-3" /> Locutor Seleccionado
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <img src={selectedTalent.avatarUrl} className="w-12 h-12 rounded-full object-cover" />
                                                <div>
                                                    <p className="font-bold text-slate-900">{selectedTalent.name}</p>
                                                    <p className="text-xs text-slate-500">{selectedTalent.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic mb-2">Sin selección aún.</p>
                                    )}

                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-slate-400 uppercase">Otros Candidatos Sugeridos</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {findMatches(role).map(talent => (
                                                <div key={talent.id} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-3 hover:border-primary transition-colors group">
                                                    <img src={talent.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="font-bold text-sm text-slate-800 truncate">{talent.name}</p>
                                                        <div className="flex items-center gap-1">
                                                            <p className="text-xs text-slate-500 truncate mr-2">{talent.ageRange}</p>
                                                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 rounded font-bold">{talent.rating} ★</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // List View
    return (
      <div className="space-y-6">
        <header className="flex justify-between items-center">
             <h1 className="text-3xl font-bold text-slate-900">Mis Proyectos</h1>
             <button onClick={() => onCreateProject({} as any)} className="md:hidden bg-primary text-white p-2 rounded-full">
                 <Wand2 className="w-5 h-5" />
             </button>
        </header>
        
        <div className="grid gap-6">
          {projects.map(p => (
            <div 
                key={p.id} 
                onClick={() => setSelectedProject(p)}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-primary transition-colors">{p.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                    {p.brand && (
                        <>
                            <span>•</span>
                            <span className="font-medium text-slate-700">{p.brand}</span>
                        </>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full uppercase tracking-wide ${
                    p.status === 'open' ? 'bg-green-100 text-green-700' : 
                    p.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {p.status}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Roles:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.roles.map(r => (
                    <span key={r.id} className="bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <Mic className="w-3 h-3 text-slate-400" /> {r.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-slate-500 mb-4">No tienes proyectos creados.</p>
                  <button onClick={() => onCreateProject({} as any)} className="text-primary font-bold hover:underline">Crear mi primer casting</button>
              </div>
          )}
        </div>
      </div>
    );
  }

  // Create Casting / AI Wizard View
  if (view === 'create-casting') {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wand2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Asistente de Casting IA</h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            Completa los detalles de tu campaña. Nuestra IA detectará automáticamente 
            los roles, géneros y estilos de voz necesarios.
          </p>
        </div>

        {step === 'input' && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-primary" /> Marca
                    </label>
                    <input 
                        type="text"
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-slate-900"
                        placeholder="Ej: Coca-Cola, Zara..."
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <Type className="w-4 h-4 text-primary" /> Nombre de la Campaña
                    </label>
                    <input 
                        type="text"
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-slate-900"
                        placeholder="Ej: Verano 2025, Lanzamiento App..."
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                     <Mic className="w-4 h-4 text-primary" /> Descripción del Proyecto / Guion
                </label>
                <textarea
                className="w-full h-48 p-4 text-lg border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-white text-slate-900 placeholder:text-slate-400"
                placeholder="Describe la escena: Una conversación entre una madre (40s, voz cálida) y su hija adolescente (enérgica). Al final entra una voz en off masculina corporativa..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                />
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !prompt || !campaignName}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
              >
                {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                {isAnalyzing ? 'Analizando...' : 'Generar Casting'}
              </button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="animate-fade-in space-y-6">
             <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <h4 className="font-bold text-indigo-900">Proyecto: {generatedTitle}</h4>
                {brandName && <p className="text-sm font-medium text-indigo-700 mt-1">Marca: {brandName}</p>}
                <p className="text-sm text-indigo-600 mt-2">Revisa los roles detectados y selecciona locutores (opcional).</p>
              </div>
            </div>

            <div className="grid gap-6">
              {generatedRoles.map((role, idx) => {
                  const roleMatches = findMatches(role);
                  return (
                    <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{role.name}</h3>
                        <p className="text-slate-600 mb-4">{role.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-700">Edad: {role.ageRange}</span>
                            <span className="px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-700">Género: {role.gender}</span>
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100">Voz: {role.voiceType}</span>
                        </div>
                        </div>
                        
                        {/* Suggested Talents Preview with Audio and Selection */}
                        <div className="w-full md:w-5/12 bg-slate-50 p-4 rounded-lg border border-slate-100 max-h-[400px] overflow-y-auto">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                            <Users className="w-3 h-3" /> Sugerencias ({roleMatches.length})
                        </h4>
                        <div className="space-y-3">
                            {roleMatches.map(talent => {
                                const isSelected = selectedCandidates[idx] === talent.id;
                                return (
                                <div key={talent.id} className={`bg-white p-3 rounded-lg border transition-all ${isSelected ? 'border-green-500 ring-1 ring-green-500 shadow-md' : 'border-slate-200 shadow-sm'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <img src={talent.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                                        <div className="overflow-hidden flex-1">
                                            <p className="text-sm font-bold truncate text-slate-800">{talent.name}</p>
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs text-slate-500 truncate">{talent.ageRange}</p>
                                                {isSelected && <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded font-bold">SELECCIONADO</span>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Audio Player */}
                                    {talent.demos.length > 0 && (
                                        <div className="mb-2">
                                            <audio controls className="w-full h-8" src={talent.demos[0].url}>
                                                Tu navegador no soporta audio.
                                            </audio>
                                        </div>
                                    )}

                                    {/* Selection Button */}
                                    <button 
                                        onClick={() => handleSelectCandidate(idx, talent.id)}
                                        className={`w-full py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1 transition-colors ${
                                            isSelected 
                                            ? 'bg-green-600 text-white hover:bg-green-700' 
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {isSelected ? <><Check className="w-3 h-3" /> Seleccionado</> : 'Seleccionar'}
                                    </button>
                                </div>
                            )})}
                            
                            {roleMatches.length === 0 && (
                                <div className="text-center py-4">
                                    <p className="text-xs text-slate-400 italic">No se encontraron voces compatibles con este rango de edad/género.</p>
                                </div>
                            )}
                        </div>
                        </div>
                    </div>
                    </div>
                  );
              })}
            </div>

            <div className="flex justify-between pt-4">
               <button onClick={() => setStep('input')} className="text-slate-500 font-medium hover:text-slate-800">
                 ← Volver y editar
               </button>
               <button onClick={handleConfirmProject} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-2">
                 <Check className="w-5 h-5" />
                 Publicar Casting
               </button>
            </div>
          </div>
        )}

        {step === 'success' && (
           <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100 animate-fade-in">
             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <Check className="w-10 h-10 text-green-600" />
             </div>
             <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Casting Creado con Éxito!</h2>
             <p className="text-slate-500 mb-8">El proyecto <strong>{generatedTitle}</strong> ha sido publicado.</p>
             <div className="flex justify-center gap-4">
                 <button onClick={() => { setStep('input'); setPrompt(''); setCampaignName(''); setBrandName(''); }} className="text-primary font-bold hover:underline">
                   Crear otro proyecto
                 </button>
             </div>
           </div>
        )}
      </div>
    );
  }

  return <div>Seleccione una opción</div>;
};
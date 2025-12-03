export enum UserRole {
  MANAGER = 'MANAGER',
  CLIENT = 'CLIENT',
  TALENT = 'TALENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface TalentProfile extends User {
  demos: { title: string; url: string; tags: string[] }[];
  languages: string[];
  gender: string;
  ageRange: string;
  regularBrands: string[]; // Marcas de las que es voz habitual (Voice of the brand)
  pastBrands: string[]; // Historial de marcas (Trabajos puntuales)
  dubbingActors: string[]; // Actores a los que dobla habitualmente
  description: string;
  rating: number;
}

export interface CastingRole {
  id: string;
  name: string;
  description: string;
  gender: string;
  ageRange: string;
  voiceType: string; // e.g., "Raspy", "Energetic", "Corporate"
  suggestedTalentIds?: string[];
  selectedTalentId?: string; // ID of the talent selected by the client
}

export interface CastingProject {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  brand?: string; // Brand associated with the project
  status: 'draft' | 'open' | 'review' | 'completed';
  createdAt: string;
  description: string;
  roles: CastingRole[];
}

export interface Stats {
  totalTalents: number;
  activeCastings: number;
  completedCastings: number;
  totalClients: number;
  revenue: number;
}
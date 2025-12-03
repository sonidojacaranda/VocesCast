import { TalentProfile, CastingProject, UserRole } from "../types";

// Helper arrays for generation
const maleNames = ["Juan", "Pedro", "Carlos", "Miguel", "David", "José", "Antonio", "Manuel", "Javier", "Francisco", "Luis", "Alberto", "Diego", "Jorge", "Pablo"];
const femaleNames = ["María", "Laura", "Ana", "Carmen", "Isabel", "Marta", "Elena", "Lucía", "Sofía", "Julia", "Paula", "Raquel", "Patricia", "Rosa", "Teresa"];
const lastNames = ["García", "Rodríguez", "González", "Fernández", "López", "Martínez", "Sánchez", "Pérez", "Gómez", "Martin", "Jiménez", "Ruiz", "Hernández", "Díaz", "Moreno"];
const brands = ["Coca-Cola", "Ford", "Movistar", "Iberia", "Bimbo", "MediaMarkt", "Zara", "Spotify", "Fanta", "Vinted", "Wallapop", "Banco Santander", "Mapfre", "Allianz", "Nestlé", "Amazon", "Google", "Samsung", "Apple", "Nike"];
const ageRanges = ["Niño (5-10)", "Adolescente (12-18)", "20-30", "30-40", "40-50", "50-60", "60+"];
const voiceTypes = ["Corporativa", "Cálida", "Enérgica", "Rasgada", "Institucional", "Dulce", "Sensual", "Autoritaria", "Amigable", "Narrativa"];

// Audio samples (Using reliable short generic samples for mock)
const demoSamples = [
  "https://actions.google.com/sounds/v1/speech/corporate_lorem_ipsum.ogg",
  "https://www2.cs.uic.edu/~i101/SoundFiles/StarWars3.wav", 
  "https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand3.wav",
  "https://www2.cs.uic.edu/~i101/SoundFiles/PinkPanther30.wav"
];

const generateTalents = (count: number): TalentProfile[] => {
  const talents: TalentProfile[] = [];
  
  for (let i = 0; i < count; i++) {
    const isMale = Math.random() > 0.5;
    const firstName = isMale ? maleNames[Math.floor(Math.random() * maleNames.length)] : femaleNames[Math.floor(Math.random() * femaleNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const gender = isMale ? "Masculino" : "Femenino";
    const ageRange = ageRanges[Math.floor(Math.random() * ageRanges.length)];
    
    // Logic to make "Niño" voices actually look like kids/teens if possible (mock data limit)
    const avatarGender = isMale ? 'men' : 'women';
    const avatarId = i % 99;
    const avatarUrl = `https://randomuser.me/api/portraits/${avatarGender}/${avatarId}.jpg`;

    talents.push({
      id: `t${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@vo.com`,
      role: UserRole.TALENT,
      avatarUrl: avatarUrl,
      gender: gender,
      ageRange: ageRange,
      languages: ['Español (Neutro)', 'Español (España)'],
      regularBrands: [brands[Math.floor(Math.random() * brands.length)]],
      pastBrands: [brands[Math.floor(Math.random() * brands.length)], brands[Math.floor(Math.random() * brands.length)]],
      dubbingActors: [],
      description: `Locutor profesional con rango de edad ${ageRange}. Voz ${voiceTypes[Math.floor(Math.random() * voiceTypes.length)]}.`,
      demos: [{ 
        title: 'Demo Comercial', 
        url: demoSamples[Math.floor(Math.random() * demoSamples.length)], 
        tags: ['Comercial', 'TV'] 
      }],
      rating: Number((4 + Math.random()).toFixed(1))
    });
  }
  return talents;
};

export const MOCK_TALENTS: TalentProfile[] = generateTalents(100);

export const MOCK_PROJECTS: CastingProject[] = [
  {
    id: 'p1',
    title: 'Campaña Verano 2025',
    clientId: 'c1',
    clientName: 'Agencia Creativa 360',
    status: 'open',
    createdAt: '2024-10-15',
    description: 'Anuncio de cerveza para TV y Redes.',
    roles: [
      { id: 'r1', name: 'Protagonista', description: 'Chico joven en la playa', gender: 'Masculino', ageRange: '20-30', voiceType: 'Fresco, alegre' },
      { id: 'r2', name: 'Narrador', description: 'Voz de marca final', gender: 'Masculino', ageRange: '30-40', voiceType: 'Profundo, seductor' }
    ]
  },
  {
    id: 'p2',
    title: 'Documental Naturaleza',
    clientId: 'c2',
    clientName: 'NatGeo Local',
    status: 'completed',
    createdAt: '2024-09-01',
    description: 'Documental sobre la fauna ibérica.',
    roles: [
      { id: 'r3', name: 'Narrador Principal', description: 'Estilo clásico documental', gender: 'Cualquiera', ageRange: '40-50', voiceType: 'Sereno, educativo' }
    ]
  },
  {
    id: 'p3',
    title: 'Spot Corporativo Tech',
    clientId: 'c3',
    clientName: 'Innovate SA',
    status: 'open',
    createdAt: '2024-11-20',
    description: 'Video interno para convención de ventas.',
    roles: [
      { id: 'r4', name: 'Voz Institucional', description: 'Voz que inspire confianza y futuro', gender: 'Femenino', ageRange: '30-40', voiceType: 'Cálida, Tecnológica' }
    ]
  }
];
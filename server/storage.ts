import { type User, type InsertUser, type VoicePersona } from "@shared/schema";
import { randomUUID } from "crypto";

// Voice Persona seed data - 8 AI assistants (4 male, 4 female)
const VOICE_PERSONAS: VoicePersona[] = [
  // Female Personas
  {
    id: 'aurora',
    displayName: 'Aurora',
    gender: 'female',
    description: 'Ethereal soprano with celestial warmth',
    voiceStyle: 'Soft, angelic, with floating high notes',
    musicGenres: ['Classical', 'Ambient', 'New Age'],
    colorTheme: '#C084FC', // Soft Purple
  },
  {
    id: 'stella',
    displayName: 'Stella',
    gender: 'female',
    description: 'Vibrant alto with energetic spirit',
    voiceStyle: 'Bold, confident, with rich harmonics',
    musicGenres: ['Pop', 'Rock', 'Dance'],
    colorTheme: '#EC4899', // Hot Pink
  },
  {
    id: 'luna',
    displayName: 'Luna',
    gender: 'female',
    description: 'Soothing mezzo with calming presence',
    voiceStyle: 'Gentle, melodic, with peaceful tones',
    musicGenres: ['Jazz', 'Soul', 'Acoustic'],
    colorTheme: '#14B8A6', // Teal
  },
  {
    id: 'nova',
    displayName: 'Nova',
    gender: 'female',
    description: 'Dynamic powerhouse with explosive range',
    voiceStyle: 'Strong, versatile, with dramatic flair',
    musicGenres: ['R&B', 'Gospel', 'Musical Theatre'],
    colorTheme: '#F59E0B', // Golden Amber
  },
  // Male Personas
  {
    id: 'orion',
    displayName: 'Orion',
    gender: 'male',
    description: 'Deep bass with commanding presence',
    voiceStyle: 'Powerful, resonant, with rich depth',
    musicGenres: ['Opera', 'Classical', 'Choral'],
    colorTheme: '#4338CA', // Deep Indigo
  },
  {
    id: 'atlas',
    displayName: 'Atlas',
    gender: 'male',
    description: 'Smooth baritone with soulful warmth',
    voiceStyle: 'Warm, expressive, with emotional depth',
    musicGenres: ['Soul', 'Blues', 'Jazz'],
    colorTheme: '#DC2626', // Deep Red
  },
  {
    id: 'phoenix',
    displayName: 'Phoenix',
    gender: 'male',
    description: 'Energetic tenor with fiery passion',
    voiceStyle: 'Bright, dynamic, with soaring highs',
    musicGenres: ['Rock', 'Pop', 'Country'],
    colorTheme: '#EA580C', // Vibrant Orange
  },
  {
    id: 'echo',
    displayName: 'Echo',
    gender: 'male',
    description: 'Versatile tenor with modern edge',
    voiceStyle: 'Clear, adaptable, with contemporary feel',
    musicGenres: ['Electronic', 'Hip-Hop', 'Indie'],
    colorTheme: '#06B6D4', // Electric Blue
  },
];

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllVoicePersonas(): Promise<VoicePersona[]>;
  getVoicePersona(id: string): Promise<VoicePersona | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private voicePersonas: Map<string, VoicePersona>;

  constructor() {
    this.users = new Map();
    this.voicePersonas = new Map();
    
    // Seed voice personas
    VOICE_PERSONAS.forEach(persona => {
      this.voicePersonas.set(persona.id, persona);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllVoicePersonas(): Promise<VoicePersona[]> {
    return Array.from(this.voicePersonas.values());
  }

  async getVoicePersona(id: string): Promise<VoicePersona | undefined> {
    return this.voicePersonas.get(id);
  }
}

export const storage = new MemStorage();

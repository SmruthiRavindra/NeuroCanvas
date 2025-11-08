import { type User, type InsertUser, type UpdateUser, type VoicePersona, type JournalEntry, type InsertJournalEntry, type MoodHistory, type InsertMoodHistory } from "@shared/schema";
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
  updateUser(id: string, updates: UpdateUser): Promise<User | undefined>;
  getAllVoicePersonas(): Promise<VoicePersona[]>;
  getVoicePersona(id: string): Promise<VoicePersona | undefined>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntries(userId?: string): Promise<JournalEntry[]>;
  getJournalEntry(id: string): Promise<JournalEntry | undefined>;
  createMoodHistory(entry: InsertMoodHistory): Promise<MoodHistory>;
  getMoodHistory(userId: string, limit?: number): Promise<MoodHistory[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private voicePersonas: Map<string, VoicePersona>;
  private journalEntries: Map<string, JournalEntry>;
  private moodHistoryEntries: Map<string, MoodHistory>;

  constructor() {
    this.users = new Map();
    this.voicePersonas = new Map();
    this.journalEntries = new Map();
    this.moodHistoryEntries = new Map();
    
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
    const user: User = { 
      ...insertUser, 
      id,
      email: insertUser.email ?? null,
      phone: insertUser.phone ?? null,
      guardianName: insertUser.guardianName ?? null,
      guardianPhone: insertUser.guardianPhone ?? null,
      guardianRelationship: insertUser.guardianRelationship ?? null,
      personality: insertUser.personality ?? null,
      interests: insertUser.interests ?? null,
      hasCompletedGuardianSetup: false,
      hasCompletedOnboarding: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: UpdateUser): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllVoicePersonas(): Promise<VoicePersona[]> {
    return Array.from(this.voicePersonas.values());
  }

  async getVoicePersona(id: string): Promise<VoicePersona | undefined> {
    return this.voicePersonas.get(id);
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const id = randomUUID();
    const entry: JournalEntry = {
      id,
      userId: insertEntry.userId ?? null,
      mood: insertEntry.mood,
      content: insertEntry.content,
      createdAt: new Date(),
    };
    this.journalEntries.set(id, entry);
    return entry;
  }

  async getJournalEntries(userId?: string): Promise<JournalEntry[]> {
    let entries = Array.from(this.journalEntries.values());
    if (userId) {
      entries = entries.filter(entry => entry.userId === userId);
    }
    return entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getJournalEntry(id: string): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }

  async createMoodHistory(insertEntry: InsertMoodHistory): Promise<MoodHistory> {
    const id = randomUUID();
    const entry: MoodHistory = {
      id,
      userId: insertEntry.userId,
      mood: insertEntry.mood,
      confidence: insertEntry.confidence,
      detectionSource: insertEntry.detectionSource ?? null,
      createdAt: new Date(),
    };
    this.moodHistoryEntries.set(id, entry);
    return entry;
  }

  async getMoodHistory(userId: string, limit: number = 50): Promise<MoodHistory[]> {
    const entries = Array.from(this.moodHistoryEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    return entries;
  }
}

export const storage = new MemStorage();

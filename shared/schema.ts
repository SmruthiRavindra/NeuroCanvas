import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  phone: text("phone"),
  
  // Guardian details
  guardianName: text("guardian_name"),
  guardianPhone: text("guardian_phone"),
  guardianRelationship: text("guardian_relationship"),
  
  // User personality and interests
  personality: text("personality"),
  interests: text("interests"),
  
  // Onboarding status
  hasCompletedGuardianSetup: boolean("has_completed_guardian_setup").default(false),
  hasCompletedOnboarding: boolean("has_completed_onboarding").default(false),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  hasCompletedGuardianSetup: true,
  hasCompletedOnboarding: true,
});

export const updateUserSchema = createInsertSchema(users).omit({
  id: true,
  password: true,
  createdAt: true,
}).partial();

// Auth validation schemas
export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(10).max(20).optional().or(z.literal('')),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const guardianSchema = z.object({
  guardianName: z.string().min(1).max(100),
  guardianPhone: z.string().min(10).max(20),
  guardianRelationship: z.string().min(1).max(50),
});

export const onboardingSchema = z.object({
  personality: z.string().max(500),
  interests: z.string().max(500),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type User = typeof users.$inferSelect;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GuardianInput = z.infer<typeof guardianSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  mood: text("mood").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
});

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;

// Mood history tracking for guardian alerts
export const moodHistory = pgTable("mood_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  mood: text("mood").notNull(),
  confidence: integer("confidence").notNull(),
  detectionSource: text("detection_source"), // 'voice', 'video', 'multimodal'
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertMoodHistorySchema = createInsertSchema(moodHistory).omit({
  id: true,
  createdAt: true,
});

export type InsertMoodHistory = z.infer<typeof insertMoodHistorySchema>;
export type MoodHistory = typeof moodHistory.$inferSelect;

// Voice Persona schema for music/singing generation
export type VoicePersona = {
  id: string;
  displayName: string;
  gender: 'male' | 'female';
  description: string;
  voiceStyle: string;
  musicGenres: string[];
  colorTheme: string;
};

export const voicePersonaSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  gender: z.enum(['male', 'female']),
  description: z.string(),
  voiceStyle: z.string(),
  musicGenres: z.array(z.string()),
  colorTheme: z.string(),
});

// Creative generation request schemas
export const creativeSuggestionSchema = z.object({
  mood: z.string(),
  mode: z.enum(['music', 'art', 'poetry']),
  customPrompt: z.string().optional(),
});

export const voiceGenerationSchema = z.object({
  prompt: z.string(),
  personaId: z.string(),
  compositionType: z.enum(['singing', 'music', 'instrumental']),
});

export type CreativeSuggestionRequest = z.infer<typeof creativeSuggestionSchema>;
export type VoiceGenerationRequest = z.infer<typeof voiceGenerationSchema>;

// API Keys table for storing user's Gemini API keys
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  apiKey: text("api_key").notNull(),
  label: text("label"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
});

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;

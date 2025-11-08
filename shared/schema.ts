import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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

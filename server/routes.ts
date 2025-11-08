import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeMoodFromText, generateCreativeSuggestions, chatAboutHobby, suggestYouTubeChannels, generateMethodActingDescription, analyzeMusicInput } from "./gemini";
import { insertJournalEntrySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Multimodal mood detection endpoint (voice + video)
  app.post("/api/analyze-mood", async (req, res) => {
    try {
      const { 
        transcript, 
        voiceFeatures, 
        voiceConfidence,
        videoEmotions,
        videoConfidence,
        hasVideo
      } = req.body;

      // Build text analysis from transcript and voice characteristics
      const textAnalysis = transcript 
        ? `${transcript}. ${voiceFeatures?.characteristics || ''}`
        : voiceFeatures?.characteristics || '';

      // Analyze using Gemini/local fallback
      const result = await analyzeMoodFromText(textAnalysis);

      // If we have video emotions, fuse them with voice analysis
      if (hasVideo && videoEmotions && videoConfidence > 0.3) {
        const fusedResult = fuseMultimodalMood(result, videoEmotions, voiceConfidence, videoConfidence);
        return res.json(fusedResult);
      }

      res.json(result);
    } catch (error) {
      console.error("Error analyzing mood:", error);
      res.status(500).json({ error: "Failed to analyze mood" });
    }
  });

  // Helper function to fuse video and voice moods - PRIORITIZE FACIAL + VOICE TONE over transcript
  function fuseMultimodalMood(
    voiceResult: any,
    videoEmotions: any,
    voiceConf: number,
    videoConf: number
  ) {
    // Map face-api emotions to NeuroCanvas moods with enhanced multi-mood detection
    const videoMood = mapVideoEmotionsToMood(videoEmotions);
    
    // PRIORITIZE FACIAL EXPRESSIONS AND VOICE TONE (70%) over transcript words (30%)
    const baselineFacialWeight = 0.70;
    const baselineVoiceWeight = 0.30;
    
    // Adjust weights based on confidence
    const confidenceAdjustment = (videoConf - voiceConf) * 0.1;
    const facialWeight = Math.max(0.60, Math.min(0.80, baselineFacialWeight + confidenceAdjustment));
    const voiceWeight = 1 - facialWeight;

    // If both agree on mood, boost confidence
    const moodsAgree = voiceResult.mood === videoMood.mood;
    const blendedConfidence = (videoMood.confidence * facialWeight) + (voiceResult.confidence * voiceWeight);
    const finalConfidence = moodsAgree
      ? Math.min(95, blendedConfidence * 1.20)
      : blendedConfidence;

    // FACIAL EXPRESSIONS take priority, but with intelligent confidence comparison
    // Use relative confidence to determine which modality is more reliable
    const confidenceRatio = videoMood.confidence / Math.max(voiceResult.confidence, 1);
    
    const finalMood = (videoConf < 0.6 && voiceConf > 0.70 && voiceResult.confidence > 70)
      ? voiceResult.mood  // Use voice if video confidence is low but voice is strong
      : (confidenceRatio < 0.7 && voiceResult.confidence > 75)
        ? voiceResult.mood  // Use voice if it's significantly more confident than video
        : (voiceConf > 0.85 && voiceResult.confidence > 85 && !moodsAgree && videoMood.confidence < 80)
          ? voiceResult.mood  // Use voice if very high confidence and video is weaker
          : videoMood.mood;   // Default to facial expressions when both are confident

    return {
      mood: finalMood,
      confidence: Math.round(finalConfidence),
      reasoning: `Multimodal fusion (facial ${Math.round(facialWeight * 100)}%, voice ${Math.round(voiceWeight * 100)}%): Facial detected ${videoMood.mood}, voice detected ${voiceResult.mood}`,
      apiSource: voiceResult.apiSource,
      videoDetected: true
    };
  }

  // Map face-api emotions to ALL 16 NeuroCanvas moods with nuanced detection
  function mapVideoEmotionsToMood(emotions: any) {
    // Calculate intensity scores for all possible moods
    const moodScores: Record<string, number> = {
      // Primary happy moods
      happy: emotions.happy * 0.8 + emotions.surprised * 0.2,
      blissful: emotions.happy * 0.9 + emotions.surprised * 0.1,
      excited: emotions.happy * 0.5 + emotions.surprised * 0.5,
      
      // Neutral/calm moods  
      calm: emotions.neutral * 0.7 + (1 - emotions.happy - emotions.sad - emotions.angry) * 0.3,
      peaceful: emotions.neutral * 0.8 + (1 - emotions.fearful - emotions.angry) * 0.2,
      
      // Sad/melancholic moods
      sad: emotions.sad * 0.8 + emotions.neutral * 0.1,
      melancholic: emotions.sad * 0.6 + emotions.neutral * 0.3,
      lonely: emotions.sad * 0.7 + emotions.fearful * 0.2,
      
      // Anxious/stressed moods
      anxious: emotions.fearful * 0.7 + emotions.sad * 0.2,
      stressed: emotions.fearful * 0.5 + emotions.angry * 0.3 + emotions.sad * 0.2,
      overwhelmed: emotions.fearful * 0.6 + emotions.disgusted * 0.2 + emotions.sad * 0.2,
      
      // Angry/frustrated moods
      angry: emotions.angry * 0.9,
      
      // Confused/uncertain moods
      confused: emotions.disgusted * 0.5 + emotions.fearful * 0.3 + emotions.surprised * 0.2,
      
      // Energetic/confident moods
      energetic: emotions.happy * 0.6 + emotions.surprised * 0.3,
      confident: emotions.happy * 0.5 + emotions.angry * 0.3 + emotions.neutral * 0.2,
      
      // Hopeful mood
      hopeful: emotions.happy * 0.4 + emotions.neutral * 0.3 + emotions.surprised * 0.2
    };

    // Find the top 2 moods to check if there's a clear winner
    const sortedMoods = Object.entries(moodScores)
      .sort(([, a], [, b]) => b - a);
    
    const topMood = sortedMoods[0];
    const secondMood = sortedMoods[1];
    
    // If the top mood is significantly stronger, use it. Otherwise blend top two.
    const moodDifference = topMood[1] - secondMood[1];
    const finalMood = moodDifference > 0.15 ? topMood[0] : topMood[0];
    const confidence = Math.round(topMood[1] * 100);

    return {
      mood: finalMood,
      confidence: Math.max(55, Math.min(92, confidence)),
      reasoning: `Facial expression analysis: ${Math.round(emotions.happy * 100)}% happy, ${Math.round(emotions.sad * 100)}% sad, ${Math.round(emotions.neutral * 100)}% neutral, ${Math.round(emotions.fearful * 100)}% fearful → ${finalMood}`
    };
  }

  // Get all voice personas
  app.get("/api/personas", async (req, res) => {
    try {
      const personas = await storage.getAllVoicePersonas();
      res.json({ personas });
    } catch (error) {
      console.error("Error fetching personas:", error);
      res.status(500).json({ error: "Failed to fetch personas" });
    }
  });

  // Creative suggestions endpoint (now supports custom prompts)
  app.post("/api/creative-suggestions", async (req, res) => {
    try {
      const { mood, mode, context, customPrompt } = req.body;
      if (!mood || !mode) {
        return res.status(400).json({ error: "Mood and mode are required" });
      }

      const suggestions = await generateCreativeSuggestions(mood, mode, context, customPrompt);
      res.json({ suggestions });
    } catch (error) {
      console.error("Error generating suggestions:", error);
      res.status(500).json({ error: "Failed to generate suggestions" });
    }
  });

  // YouTube channel suggestions endpoint
  app.post("/api/suggest-youtube-channels", async (req, res) => {
    try {
      const { prompt, mood } = req.body;
      if (!prompt || !mood) {
        return res.status(400).json({ error: "Prompt and mood are required" });
      }

      const result = await suggestYouTubeChannels(prompt, mood);
      res.json(result);
    } catch (error) {
      console.error("Error suggesting YouTube channels:", error);
      res.status(500).json({ error: "Failed to suggest channels" });
    }
  });

  // Method Acting chatbot endpoint for artwork descriptions
  app.post("/api/method-acting-chat", async (req, res) => {
    try {
      const { drawingPrompt, mood } = req.body;
      if (!drawingPrompt || !mood) {
        return res.status(400).json({ error: "Drawing prompt and mood are required" });
      }

      const result = await generateMethodActingDescription(drawingPrompt, mood);
      res.json(result);
    } catch (error) {
      console.error("Error in method acting chat:", error);
      res.status(500).json({ error: "Failed to generate description" });
    }
  });

  // Intelligent music input analysis endpoint
  app.post("/api/analyze-music", async (req, res) => {
    try {
      const { userInput, mood } = req.body;
      if (!userInput || !mood) {
        return res.status(400).json({ error: "User input and mood are required" });
      }

      const result = await analyzeMusicInput(userInput, mood);
      res.json(result);
    } catch (error) {
      console.error("Error analyzing music input:", error);
      res.status(500).json({ error: "Failed to analyze music input" });
    }
  });

  // Hobby chat endpoint
  app.post("/api/hobby-chat", async (req, res) => {
    try {
      const { hobbyName, question, mood } = req.body;
      if (!hobbyName || !question || !mood) {
        return res.status(400).json({ error: "Hobby name, question, and mood are required" });
      }

      const response = await chatAboutHobby(hobbyName, question, mood);
      res.json({ response });
    } catch (error) {
      console.error("Error in hobby chat:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  // Journal entries endpoints
  app.post("/api/journal-entries", async (req, res) => {
    try {
      const validationResult = insertJournalEntrySchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request data",
          details: validationResult.error.errors 
        });
      }

      const entry = await storage.createJournalEntry(validationResult.data);
      res.json(entry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(500).json({ error: "Failed to create journal entry" });
    }
  });

  app.get("/api/journal-entries", async (req, res) => {
    try {
      const userId = req.query.userId as string | undefined;
      const entries = await storage.getJournalEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  });

  const httpServer = createServer(app);
  
  // Set up Lyria RealTime WebSocket proxy
  const { setupLyriaWebSocket } = await import('./lyriaProxy');
  setupLyriaWebSocket(httpServer);
  
  return httpServer;
}

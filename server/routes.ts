import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeMoodFromText, generateCreativeSuggestions, chatAboutHobby } from "./gemini";

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

  // Helper function to fuse video and voice moods with 60/40 baseline weighting
  function fuseMultimodalMood(
    voiceResult: any,
    videoEmotions: any,
    voiceConf: number,
    videoConf: number
  ) {
    // Map face-api emotions to NeuroCanvas moods
    const videoMood = mapVideoEmotionsToMood(videoEmotions);
    
    // Enforce 60/40 baseline weighting (voice priority)
    const baselineVoiceWeight = 0.60;
    const baselineVideoWeight = 0.40;
    
    // Adjust weights based on confidence (but maintain voice priority)
    const confidenceAdjustment = (voiceConf - videoConf) * 0.1;
    const voiceWeight = Math.max(0.5, Math.min(0.75, baselineVoiceWeight + confidenceAdjustment));
    const videoWeight = 1 - voiceWeight;

    // If both agree on mood, boost confidence
    const moodsAgree = voiceResult.mood === videoMood.mood;
    const blendedConfidence = (voiceResult.confidence * voiceWeight) + (videoMood.confidence * videoWeight);
    const finalConfidence = moodsAgree
      ? Math.min(95, blendedConfidence * 1.15)
      : blendedConfidence;

    // Voice mood takes priority unless video has very high confidence and disagrees
    const finalMood = (videoConf > 0.85 && videoMood.confidence > 85 && !moodsAgree)
      ? videoMood.mood
      : voiceResult.mood;

    return {
      mood: finalMood,
      confidence: Math.round(finalConfidence),
      reasoning: `Multimodal fusion (voice ${Math.round(voiceWeight * 100)}%, video ${Math.round(videoWeight * 100)}%): Voice detected ${voiceResult.mood}, video detected ${videoMood.mood}`,
      apiSource: voiceResult.apiSource,
      videoDetected: true
    };
  }

  // Map face-api emotions to NeuroCanvas 16 moods
  function mapVideoEmotionsToMood(emotions: any) {
    const scores = {
      happy: emotions.happy,
      sad: emotions.sad,
      angry: emotions.angry,
      anxious: emotions.fearful, // fearful maps to anxious
      confused: emotions.disgusted,
      excited: emotions.surprised,
      calm: emotions.neutral
    };

    // Find dominant emotion
    const dominant = Object.entries(scores).reduce((a: any, b: any) => 
      a[1] > b[1] ? a : b
    );

    const mood = dominant[0] as string;
    const confidence = Math.round((dominant[1] as number) * 100);

    return {
      mood,
      confidence: Math.max(50, Math.min(90, confidence)),
      reasoning: `Facial expression analysis detected ${mood}`
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

  // Voice synthesis endpoint (placeholder for future enhancement)
  app.post("/api/generate-audio", async (req, res) => {
    try {
      const { prompt, personaId, compositionType } = req.body;
      if (!prompt || !personaId) {
        return res.status(400).json({ error: "Prompt and personaId are required" });
      }

      // Validate persona exists
      const persona = await storage.getVoicePersona(personaId);
      if (!persona) {
        return res.status(404).json({ error: "Persona not found" });
      }

      // Placeholder response - in future this would call a TTS/music generation service
      res.json({
        success: true,
        message: `Voice synthesis for ${persona.displayName} is coming soon!`,
        persona: persona.displayName,
        prompt,
        compositionType,
        // In future, this would include: audioUrl, duration, etc.
      });
    } catch (error) {
      console.error("Error generating audio:", error);
      res.status(500).json({ error: "Failed to generate audio" });
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

  const httpServer = createServer(app);
  return httpServer;
}

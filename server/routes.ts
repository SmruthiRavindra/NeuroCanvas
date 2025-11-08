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

  // Helper function to fuse video and voice moods
  function fuseMultimodalMood(
    voiceResult: any,
    videoEmotions: any,
    voiceConf: number,
    videoConf: number
  ) {
    // Map face-api emotions to NeuroCanvas moods
    const videoMood = mapVideoEmotionsToMood(videoEmotions);
    
    // Weight by confidence
    const totalConf = voiceConf + videoConf;
    const voiceWeight = voiceConf / totalConf;
    const videoWeight = videoConf / totalConf;

    // If both agree or have similar moods, boost confidence
    const moodsAgree = voiceResult.mood === videoMood.mood;
    const finalConfidence = moodsAgree
      ? Math.min(95, voiceResult.confidence * 1.15)
      : (voiceResult.confidence * voiceWeight + videoMood.confidence * videoWeight);

    // Prefer voice mood if it has higher weight, otherwise blend
    const finalMood = voiceWeight > 0.6 ? voiceResult.mood : videoMood.mood;

    return {
      mood: finalMood,
      confidence: Math.round(finalConfidence),
      reasoning: `Combined analysis (voice ${Math.round(voiceWeight * 100)}%, video ${Math.round(videoWeight * 100)}%): ${voiceResult.reasoning}`,
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

  // Creative suggestions endpoint
  app.post("/api/creative-suggestions", async (req, res) => {
    try {
      const { mood, mode, context } = req.body;
      if (!mood || !mode) {
        return res.status(400).json({ error: "Mood and mode are required" });
      }

      const suggestions = await generateCreativeSuggestions(mood, mode, context);
      res.json({ suggestions });
    } catch (error) {
      console.error("Error generating suggestions:", error);
      res.status(500).json({ error: "Failed to generate suggestions" });
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

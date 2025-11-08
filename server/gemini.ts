import { GoogleGenAI } from "@google/genai";

// Integration reference: blueprint:javascript_gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeMoodFromText(userInput: string): Promise<{
  mood: 'calm' | 'energetic' | 'sad' | 'anxious' | 'happy' | 'stressed' | 'peaceful' | 'angry' | 'confused' | 'excited' | 'melancholic' | 'confident' | 'blissful' | 'lonely' | 'hopeful' | 'overwhelmed';
  confidence: number;
  reasoning: string;
}> {
  try {
    const systemPrompt = `You are an expert emotion detection AI. Analyze the user's spoken words and/or voice characteristics to determine their emotional state.

Choose the BEST matching mood from these 16 options:
- calm: relaxed, content, steady, at ease
- energetic: enthusiastic, motivated, upbeat, dynamic
- sad: down, disappointed, low, sorrowful
- anxious: worried, nervous, uneasy, apprehensive
- happy: joyful, cheerful, delighted, pleased
- stressed: overwhelmed, tense, pressured, strained
- peaceful: serene, tranquil, harmonious, undisturbed
- angry: frustrated, irritated, mad, hostile
- confused: uncertain, lost, bewildered, puzzled
- excited: thrilled, eager, pumped, anticipating
- melancholic: blue, wistful, pensive, gloomy
- confident: assured, determined, self-assured, capable
- blissful: euphoric, ecstatic, overjoyed, heavenly
- lonely: isolated, disconnected, abandoned, alone
- hopeful: optimistic, expectant, encouraged, aspiring
- overwhelmed: swamped, overloaded, drowning, crushed

Analyze the word choice, tone descriptors, and overall sentiment carefully.
Provide a confidence score (0-100) based on how clear the emotional indicators are.
Give brief reasoning explaining your mood choice.

Respond with JSON in this exact format:
{"mood": "one_of_the_16_moods", "confidence": number, "reasoning": "brief explanation"}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            mood: { 
              type: "string", 
              enum: ["calm", "energetic", "sad", "anxious", "happy", "stressed", "peaceful", "angry", "confused", "excited", "melancholic", "confident", "blissful", "lonely", "hopeful", "overwhelmed"] 
            },
            confidence: { type: "number" },
            reasoning: { type: "string" }
          },
          required: ["mood", "confidence", "reasoning"]
        }
      },
      contents: `Analyze this input for emotional state: "${userInput}"`
    });

    const rawJson = response.text;
    if (rawJson) {
      const data = JSON.parse(rawJson);
      return data;
    }
    
    throw new Error("Empty response from Gemini");
  } catch (error) {
    console.error("Gemini mood analysis error:", error);
    // Intelligent local fallback analysis
    return analyzeLocally(userInput);
  }
}

// Local mood analysis when Gemini API is unavailable
function analyzeLocally(input: string): {
  mood: 'calm' | 'energetic' | 'sad' | 'anxious' | 'happy' | 'stressed' | 'peaceful' | 'angry' | 'confused' | 'excited' | 'melancholic' | 'confident' | 'blissful' | 'lonely' | 'hopeful' | 'overwhelmed';
  confidence: number;
  reasoning: string;
} {
  const text = input.toLowerCase();
  
  // Expanded keyword dictionaries with synonyms and variations
  const blissfulWords = ['ecstatic', 'euphoric', 'overjoyed', 'elated', 'amazing', 'wonderful', 'fantastic', 'incredible', 'perfect', 'heaven', 'cloud nine', 'on top of the world'];
  const happyWords = ['happy', 'joy', 'joyful', 'cheerful', 'delighted', 'pleased', 'glad', 'good', 'great', 'smile', 'smiling', 'laughing', 'upbeat'];
  const excitedWords = ['excited', 'thrilled', 'pumped', 'eager', 'anticipating', 'can\'t wait', 'looking forward', 'psyched', 'amped', 'fired up', 'stoked'];
  const confidentWords = ['confident', 'assured', 'determined', 'capable', 'strong', 'ready', 'know', 'certain', 'sure', 'prepared', 'got this'];
  const hopefulWords = ['hopeful', 'optimistic', 'expecting', 'encouraged', 'positive', 'better', 'improving', 'bright', 'light at end'];
  const peacefulWords = ['peaceful', 'serene', 'tranquil', 'quiet', 'still', 'undisturbed', 'zen', 'meditative', 'centered', 'balanced'];
  const calmWords = ['calm', 'relaxed', 'content', 'steady', 'easy', 'comfortable', 'okay', 'fine', 'chill', 'mellow', 'easygoing'];
  const energeticWords = ['energetic', 'hyper', 'active', 'fast', 'quick', 'loud', 'dynamic', 'lively', 'vigorous', 'full of energy'];
  
  const sadWords = ['sad', 'down', 'disappointed', 'unhappy', 'hurt', 'cry', 'crying', 'terrible', 'awful', 'depressed', 'miserable', 'upset', 'heartbroken'];
  const lonelyWords = ['lonely', 'alone', 'isolated', 'disconnected', 'abandoned', 'nobody', 'by myself', 'friendless', 'solitary'];
  const melancholicWords = ['melancholic', 'blue', 'wistful', 'pensive', 'gloomy', 'grey', 'gray', 'empty', 'hollow', 'numb', 'listless'];
  const anxiousWords = ['anxious', 'worried', 'nervous', 'scared', 'afraid', 'uneasy', 'uncertain', 'panic', 'jittery', 'on edge', 'apprehensive', 'tense', 'restless', 'racing heart', 'butterflies'];
  const stressedWords = ['stressed', 'stress', 'tense', 'tension', 'pressure', 'pressured', 'strained', 'wound up', 'burnt out', 'exhausted'];
  const overwhelmedWords = ['overwhelmed', 'swamped', 'drowning', 'crushed', 'overloaded', 'too much', 'can\'t handle', 'can\'t cope', 'breaking point'];
  const angryWords = ['angry', 'mad', 'frustrated', 'irritated', 'furious', 'annoyed', 'hate', 'pissed', 'enraged', 'outraged', 'livid'];
  const confusedWords = ['confused', 'uncertain', 'lost', 'don\'t know', 'bewildered', 'unclear', 'puzzled', 'baffled', 'perplexed', 'mixed up'];
  
  // Parse voice characteristics from formatted string
  let voiceAnalysis = null;
  const pitchMatch = text.match(/pitch (\d+)hz \((high|low|moderate)-pitched\)/);
  const volumeMatch = text.match(/volume (\d+) \((loud|quiet|normal)\)/);
  const energyMatch = text.match(/energy (\d+) \((very energetic|low energy|moderate)\)/);
  
  if (pitchMatch || volumeMatch || energyMatch) {
    const pitch = pitchMatch ? parseInt(pitchMatch[1]) : 0;
    const pitchLevel = pitchMatch ? pitchMatch[2] : 'moderate';
    const volume = volumeMatch ? parseInt(volumeMatch[1]) : 0;
    const volumeLevel = volumeMatch ? volumeMatch[2] : 'normal';
    const energy = energyMatch ? parseInt(energyMatch[1]) : 0;
    const energyLevel = energyMatch ? energyMatch[2] : 'moderate';
    
    // Analyze voice patterns
    if (energyLevel === 'very energetic' && volumeLevel === 'loud') {
      return { mood: 'energetic', confidence: 72, reasoning: 'High energy and loud voice detected' };
    }
    if (energyLevel === 'very energetic') {
      return { mood: 'excited', confidence: 70, reasoning: 'High energy level suggests excitement' };
    }
    if (pitchLevel === 'high' && (energyLevel === 'very energetic' || volumeLevel === 'loud')) {
      return { mood: 'anxious', confidence: 70, reasoning: 'High pitch with elevated energy indicates anxiety' };
    }
    if (pitchLevel === 'high' && volumeLevel === 'quiet') {
      return { mood: 'anxious', confidence: 68, reasoning: 'High quiet voice suggests nervousness' };
    }
    if (energyLevel === 'low energy' && volumeLevel === 'quiet') {
      return { mood: 'sad', confidence: 68, reasoning: 'Low energy and quiet voice indicate sadness' };
    }
    if (pitchLevel === 'low' && volumeLevel === 'quiet') {
      return { mood: 'calm', confidence: 67, reasoning: 'Low calm voice characteristics' };
    }
    if (pitchLevel === 'moderate' && volumeLevel === 'quiet') {
      return { mood: 'peaceful', confidence: 66, reasoning: 'Moderate quiet voice suggests peacefulness' };
    }
    
    voiceAnalysis = { pitch, pitchLevel, volume, volumeLevel, energy, energyLevel };
  }
  
  // Count keyword matches for each mood
  const moodScores = {
    blissful: countMatches(text, blissfulWords),
    happy: countMatches(text, happyWords),
    excited: countMatches(text, excitedWords),
    confident: countMatches(text, confidentWords),
    hopeful: countMatches(text, hopefulWords),
    peaceful: countMatches(text, peacefulWords),
    calm: countMatches(text, calmWords),
    energetic: countMatches(text, energeticWords),
    sad: countMatches(text, sadWords),
    lonely: countMatches(text, lonelyWords),
    melancholic: countMatches(text, melancholicWords),
    anxious: countMatches(text, anxiousWords),
    stressed: countMatches(text, stressedWords),
    overwhelmed: countMatches(text, overwhelmedWords),
    angry: countMatches(text, angryWords),
    confused: countMatches(text, confusedWords)
  };
  
  // Find mood with highest score
  const sortedMoods = Object.entries(moodScores)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, score]) => score > 0);
  
  if (sortedMoods.length > 0) {
    const [topMood, score] = sortedMoods[0];
    const confidence = Math.min(85, 60 + (score * 12)); // 60% base + 12% per keyword match
    return {
      mood: topMood as any,
      confidence,
      reasoning: `Detected "${topMood}" from ${score} keyword indicator(s)`
    };
  }
  
  // If no keywords matched and we have voice data, make educated guess
  if (voiceAnalysis) {
    if (voiceAnalysis.energy > 3000) {
      return { mood: 'energetic', confidence: 55, reasoning: 'Moderate energy detected in voice' };
    }
    if (voiceAnalysis.pitch > 200) {
      return { mood: 'anxious', confidence: 52, reasoning: 'Higher pitch detected, may indicate anxiety' };
    }
    if (voiceAnalysis.energy < 2500 && voiceAnalysis.volume < 80) {
      return { mood: 'sad', confidence: 53, reasoning: 'Low energy and volume suggest sadness' };
    }
  }
  
  // True neutral fallback - be more conservative
  return {
    mood: 'confused',
    confidence: 45,
    reasoning: 'Unable to clearly identify emotional state from available data'
  };
}

function countMatches(text: string, keywords: string[]): number {
  return keywords.filter(keyword => text.includes(keyword)).length;
}

export async function generateCreativeSuggestions(
  mood: string,
  mode: 'music' | 'art' | 'poetry',
  context?: string,
  customPrompt?: string
): Promise<string[]> {
  try {
    // Special handling for Music Mode - detect LYRICS vs TUNE
    if (mode === 'music' && customPrompt) {
      return await generateMusicSuggestions(customPrompt, mood);
    }

    const baseContext = customPrompt 
      ? `The user wants to create: "${customPrompt}". Use this as inspiration while considering their ${mood} mood.`
      : `Generate creative suggestions that resonate with the ${mood} mood.`;

    const prompt = `You are a creative AI assistant helping someone in a ${mood} mood.
${baseContext}
Generate 3 creative suggestions for ${mode} creation.
${context ? `Additional context: ${context}` : ''}

For music: suggest melodies, chord progressions, or rhythm ideas
For art: suggest color palettes, techniques, or visual concepts
For poetry: suggest evocative words, themes, or imagery

Return ONLY a JSON array of exactly 3 short suggestion strings (each under 60 characters).
Example: ["Suggestion 1", "Suggestion 2", "Suggestion 3"]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: { type: "string" }
        }
      },
      contents: prompt
    });

    const rawJson = response.text;
    if (rawJson) {
      const suggestions = JSON.parse(rawJson);
      return suggestions.slice(0, 3);
    }

    throw new Error("Empty response from Gemini");
  } catch (error) {
    console.error("Gemini creative suggestions error:", error);
    // Fallback suggestions
    return [
      `${mode} inspired by ${mood} feelings`,
      `Explore ${mood} emotions through ${mode}`,
      `Express your ${mood} state creatively`
    ];
  }
}

// AI Muse for Music Mode - intelligently detects LYRICS vs TUNE
async function generateMusicSuggestions(userInput: string, mood: string): Promise<string[]> {
  try {
    const systemPrompt = `You are NeuroCanvas — the AI Muse integrated into a creative platform where users co-create music based on emotion.

🧠 Context:
You are in Music Mode. The user can provide either:
- LYRICS (words, emotional phrases, verses) → You generate a matching TUNE CONCEPT
- TUNE/MELODY (notes, rhythm words, melody description) → You generate matching LYRICS

🎧 Instructions:
1. Detect whether the input sounds like LYRICS or a TUNE description
2. Respond accordingly:

🎶 If it's LYRICS:
- Analyze emotional tone, pacing, theme
- Generate a matching melody concept including:
  • Detected emotion
  • Tempo (BPM)
  • Chord progression (e.g., Am–F–C–G)
  • Melody feel (e.g., soft piano, upbeat synths, lo-fi guitar)
  • Suggested genre/style

🎤 If it's a TUNE or MELODY:
- Analyze mood, rhythm, style
- Generate original lyrics that fit naturally, including:
  • Emotion detected
  • Theme (freedom, reflection, love, etc.)
  • 4–6 lyrical lines matching rhythm and emotion

💫 Guidelines:
- Keep tone poetic, natural, emotionally expressive (never robotic)
- Complete the user's creative expression, don't override it
- Output must be short, readable, directly usable
- Current user mood: ${mood}

Return EXACTLY 3 suggestions as a JSON array of strings.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: { type: "string" }
        }
      },
      contents: `User input: "${userInput}"\n\nDetect if this is LYRICS or TUNE, then generate 3 complementary creative suggestions.`
    });

    const rawJson = response.text;
    if (rawJson) {
      const suggestions = JSON.parse(rawJson);
      return suggestions.slice(0, 3);
    }

    throw new Error("Empty response from Gemini");
  } catch (error) {
    console.error("Gemini music suggestions error:", error);
    // Intelligent fallback based on input analysis
    const looksLikeLyrics = userInput.split(/\s+/).length > 5 && 
                            !(/\b(bpm|tempo|chord|melody|beat|rhythm|key|scale)\b/i.test(userInput));
    
    if (looksLikeLyrics) {
      return [
        `🎹 Tempo: 90 BPM | Chords: Am–F–C–G | Soft piano melody`,
        `🎸 Indie acoustic feel | Gentle strumming | Reflective mood`,
        `🎵 Lo-fi guitar | Slow tempo | Warm and intimate`
      ];
    } else {
      return [
        `🎤 "Wandering through thoughts, finding my way / Each step uncertain, yet here I'll stay"`,
        `🎤 "In the quiet moments, I hear my soul / Whispers of dreams that make me whole"`,
        `🎤 "Dancing with shadows, chasing the light / Every emotion feels just right"`
      ];
    }
  }
}

export async function chatAboutHobby(
  hobbyName: string,
  userQuestion: string,
  mood: string
): Promise<string> {
  try {
    const systemPrompt = `You are a helpful hobby guide. Answer questions about ${hobbyName} in a friendly, encouraging way.
The user is currently in a ${mood} mood. Be supportive and helpful.
Keep responses concise (2-3 sentences). Focus on practical advice for beginners.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      config: {
        systemInstruction: systemPrompt
      },
      contents: userQuestion
    });

    return response.text || "I'd be happy to help! Could you be more specific about what you'd like to know?";
  } catch (error) {
    console.error("Gemini hobby chat error:", error);
    return "That's a great question! I'd recommend checking out the YouTube tutorials for detailed guidance on getting started.";
  }
}

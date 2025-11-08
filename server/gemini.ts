import { GoogleGenAI } from "@google/genai";

// Integration reference: blueprint:javascript_gemini
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
});

// Lyria RealTime client for music generation
const lyriaClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  apiVersion: "v1alpha"
});

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
    
    // IMPROVED voice pattern analysis - prioritize voice tone, less biased toward anxious
    
    // High energy + loud = energetic or excited (NOT anxious)
    if (energyLevel === 'very energetic' && volumeLevel === 'loud') {
      return { mood: 'energetic', confidence: 75, reasoning: 'High energy and loud voice indicate energetic mood' };
    }
    
    // High energy alone = excited (NOT anxious unless other indicators present)
    if (energyLevel === 'very energetic' && pitchLevel !== 'high') {
      return { mood: 'excited', confidence: 73, reasoning: 'High energy suggests excitement' };
    }
    
    // Moderate/high energy + normal volume = confident or happy
    if ((energyLevel === 'very energetic' || energyLevel === 'moderate') && volumeLevel === 'normal' && pitchLevel === 'moderate') {
      return { mood: 'confident', confidence: 72, reasoning: 'Balanced energy and moderate tone suggest confidence' };
    }
    
    // Only classify as anxious if MULTIPLE anxiety indicators present
    const anxietyIndicators = [
      pitchLevel === 'high',
      energyLevel === 'very energetic',
      volumeLevel === 'quiet'
    ].filter(Boolean).length;
    
    if (anxietyIndicators >= 2) {
      return { mood: 'anxious', confidence: 70, reasoning: 'Multiple anxiety indicators: high pitch + energy/quiet voice' };
    }
    
    // Low energy patterns
    if (pitchLevel === 'low' && energyLevel === 'low energy') {
      return { mood: 'calm', confidence: 70, reasoning: 'Low pitch and energy indicate calmness' };
    }
    
    if (energyLevel === 'low energy' && volumeLevel === 'quiet') {
      return { mood: 'melancholic', confidence: 68, reasoning: 'Low energy and quiet voice suggest melancholy' };
    }
    
    // Neutral baseline - calm or peaceful
    if (volumeLevel === 'normal' && energyLevel === 'moderate') {
      return { mood: 'calm', confidence: 67, reasoning: 'Moderate voice characteristics suggest calmness' };
    }
    
    // Default to happy for unclear but positive-leaning patterns
    if (pitchLevel === 'moderate' && volumeLevel !== 'quiet') {
      return { mood: 'happy', confidence: 65, reasoning: 'Moderate pitch with normal/loud volume suggests positive mood' };
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
    if (voiceAnalysis.energy > 3000 && voiceAnalysis.volume > 90) {
      return { mood: 'energetic', confidence: 58, reasoning: 'High energy and volume detected in voice' };
    }
    
    // FIXED: Don't classify high pitch alone as anxious
    // High pitch can indicate happiness, excitement, or just natural voice characteristics
    if (voiceAnalysis.pitch > 250 && voiceAnalysis.energy > 3000 && voiceAnalysis.volume < 80) {
      return { mood: 'anxious', confidence: 55, reasoning: 'High pitch with high energy but quiet volume may indicate anxiety' };
    }
    
    // High pitch with high energy and normal/loud volume = excited or happy, not anxious
    if (voiceAnalysis.pitch > 200 && voiceAnalysis.energy > 3000) {
      return { mood: 'excited', confidence: 58, reasoning: 'High pitch and high energy suggest excitement' };
    }
    
    // High pitch alone with moderate energy = likely just happy or neutral
    if (voiceAnalysis.pitch > 200) {
      return { mood: 'happy', confidence: 54, reasoning: 'Higher pitch detected, suggests positive mood' };
    }
    
    if (voiceAnalysis.energy < 2500 && voiceAnalysis.volume < 80) {
      return { mood: 'calm', confidence: 56, reasoning: 'Low energy and volume suggest calmness' };
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

export async function suggestYouTubeChannels(prompt: string, mood: string): Promise<{
  channels: Array<{
    name: string;
    handle: string;
    description: string;
    genre: string;
    subscribers: string;
    why: string;
  }>;
}> {
  try {
    const systemPrompt = `You are a music discovery expert. Based on the user's mood and music preferences, suggest 3-5 REAL, EXISTING YouTube music channels that are still active and available.

IMPORTANT: Only suggest channels that:
- Are real and currently active on YouTube
- Have substantial content (100K+ subscribers preferred)
- Match the mood and genre requested
- Are well-known and easy to find

For each channel provide:
- name: The channel's display name
- handle: The @handle (e.g., "@LofiGirl", "@NPRMusic")
- description: Brief description of their content
- genre: Primary music genre
- subscribers: Approximate subscriber count
- why: Why this channel fits the user's request

Respond with JSON in this format:
{
  "channels": [
    {
      "name": "Channel Name",
      "handle": "@channelhandle",
      "description": "What they offer",
      "genre": "Genre",
      "subscribers": "XM subscribers",
      "why": "Why it matches"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            channels: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  handle: { type: "string" },
                  description: { type: "string" },
                  genre: { type: "string" },
                  subscribers: { type: "string" },
                  why: { type: "string" }
                },
                required: ["name", "handle", "description", "genre", "subscribers", "why"]
              }
            }
          },
          required: ["channels"]
        }
      },
      contents: `User mood: ${mood}\nMusic preference: ${prompt}\n\nSuggest real YouTube music channels that match.`
    });

    const rawJson = response.text;
    if (rawJson) {
      const data = JSON.parse(rawJson);
      return data;
    }
    
    throw new Error("Empty response from Gemini");
  } catch (error) {
    console.error("Gemini YouTube channel suggestions error:", error);
    // Fallback with popular channels
    return {
      channels: [
        {
          name: "Lofi Girl",
          handle: "@LofiGirl",
          description: "24/7 lofi hip hop beats for study and relaxation",
          genre: "Lofi Hip Hop",
          subscribers: "13M subscribers",
          why: "Perfect for calm, peaceful moods with continuous ambient music"
        },
        {
          name: "NPR Music",
          handle: "@nprmusic",
          description: "Live performances and music discovery from NPR",
          genre: "Various",
          subscribers: "2M subscribers",
          why: "High-quality live sessions across many genres"
        },
        {
          name: "Chill Music Lab",
          handle: "@ChillMusicLab",
          description: "Chill music for relaxation and focus",
          genre: "Chill",
          subscribers: "1M subscribers",
          why: "Curated playlists for relaxation and productivity"
        }
      ]
    };
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

// Generate music prompt configuration from persona and user input
export function generateLyriaMusicPrompts(
  personaGender: 'male' | 'female',
  personaStyle: string,
  musicGenres: string[],
  userInput: string,
  mood: string
): { prompts: Array<{ text: string, weight: number }>, config: { bpm: number, temperature: number } } {
  
  // Detect if user provided lyrics or tune description
  const looksLikeLyrics = userInput.split(/\s+/).length > 5 && 
                          !(/\b(bpm|tempo|chord|melody|beat|rhythm|key|scale)\b/i.test(userInput));
  
  const prompts: Array<{ text: string, weight: number }> = [];
  
  // Base genre from persona
  if (musicGenres.length > 0) {
    prompts.push({ text: musicGenres[0], weight: 0.8 });
  }
  
  // Mood-based characteristics
  const moodPrompts: Record<string, string> = {
    happy: "Upbeat, Bright Tones, Danceable",
    energetic: "Fast Beats, Dynamic, High Energy",
    calm: "Ambient, Smooth, Peaceful",
    sad: "Melancholic, Slow, Emotional",
    anxious: "Tense, Unsettling, Dissonant",
    peaceful: "Ethereal, Calm, Gentle",
    excited: "Energetic, Fast-paced, Uplifting",
    angry: "Aggressive, Heavy, Distorted",
    confident: "Bold, Strong, Powerful",
    hopeful: "Uplifting, Bright, Optimistic"
  };
  
  if (moodPrompts[mood]) {
    prompts.push({ text: moodPrompts[mood], weight: 1.0 });
  }
  
  // BPM based on mood
  const moodBPM: Record<string, number> = {
    energetic: 140,
    excited: 130,
    happy: 120,
    confident: 115,
    hopeful: 110,
    calm: 85,
    peaceful: 75,
    sad: 70,
    melancholic: 65,
    anxious: 95,
    stressed: 100
  };
  
  const bpm = moodBPM[mood] || 100;
  
  return {
    prompts,
    config: {
      bpm,
      temperature: 1.0
    }
  };
}

// Method Acting Description Generator - Converts drawing prompts into first-person immersive experiences
export async function generateMethodActingDescription(
  drawingPrompt: string,
  mood: string
): Promise<{ description: string }> {
  try {
    const systemPrompt = `You are a creative visualization guide who helps artists by providing immersive, first-person experiential descriptions.

When given a drawing prompt, respond with a vivid, sensory-rich description AS IF THE USER IS EXPERIENCING IT THEMSELVES. Use "you" language to make them feel like they ARE in the scene.

Guidelines:
- Write in second person ("you feel", "you see", "you hear")
- Engage ALL senses: sight, sound, touch, smell, emotions
- Keep it evocative and artistic, not literal instructions
- Match the emotional tone to the user's current mood: ${mood}
- Focus on the FEELING and EXPERIENCE, not technical drawing steps
- Be poetic and immersive (2-4 paragraphs)
- Create a sense of being "in the moment"

Example:
Prompt: "girl riding a horse"
Response: "You feel the powerful muscles of the horse moving beneath you, each stride a rhythmic dance of strength and grace. The wind rushes past your face, carrying the earthy scent of leather and warm animal. Your fingers grip the reins—weathered, familiar—as sunlight filters through the trees ahead, dappling the path in golden light.

The world seems to slow down. You're aware of everything: the horse's breathing, deep and steady; the creak of the saddle; the way your hair flows behind you like a banner. There's a freedom here, a connection between rider and beast that transcends words. You move as one being, racing toward the horizon where earth meets sky.

The emotion swells in your chest—wild, untamed, alive. This is more than movement; it's flight without wings, partnership without speaking. Every hoofbeat echoes your heartbeat, and in this moment, you understand what it means to be truly present, truly free."`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      config: {
        systemInstruction: systemPrompt,
        temperature: 1.2, // Higher creativity for immersive descriptions
        topP: 0.95,
        topK: 40
      },
      contents: `Create an immersive, first-person experiential description for this artwork: "${drawingPrompt}"`
    });

    const description = response.text?.trim();
    
    if (!description) {
      throw new Error("Empty response from Gemini");
    }

    return { description };

  } catch (error) {
    console.error("Error generating method acting description:", error);
    
    // Fallback response
    return {
      description: `You imagine ${drawingPrompt} coming to life before you. The scene unfolds in your mind's eye, vivid and real. You can almost feel the textures, hear the sounds, sense the emotions of this moment. Every detail matters—the light, the shadows, the feeling in the air. This is your vision, waiting to be brought to life on canvas.`
    };
  }
}

// Intelligent Music Input Analyzer - Detects lyrics vs tune and provides complementary suggestions
export async function analyzeMusicInput(
  userInput: string,
  mood: string
): Promise<{
  inputType: 'lyrics' | 'tune';
  complementarySuggestions: {
    type: string;
    suggestions: string[];
  };
  youtubeChannels: Array<{
    name: string;
    handle: string;
    description: string;
    genre: string;
    subscribers: string;
    why: string;
  }>;
}> {
  try {
    const systemPrompt = `You are NeuroCanvas Music Intelligence — an AI that analyzes musical input and provides complementary creative suggestions.

🎯 Your Task:
1. Analyze the user's input to determine if it's LYRICS or a TUNE/MELODY description
2. Generate complementary suggestions (tune for lyrics, lyrics for tune)
3. Consider the user's emotional mood: ${mood}

📊 Detection Criteria:
LYRICS indicators:
- Contains complete sentences or poetic phrases
- Emotional/narrative content
- Verse-like structure
- Story or message being conveyed

TUNE indicators:
- Musical terminology (BPM, chords, key, tempo, melody, rhythm)
- Instrument descriptions
- Sound characteristics
- Musical notation or structure references

🎵 If INPUT is LYRICS:
Provide tune/chord suggestions including:
- Tempo (BPM)
- Chord progressions (e.g., "Am-F-C-G", "I-V-vi-IV")
- Instrumentation suggestions
- Genre/style recommendations
- Mood/feel descriptions

🎤 If INPUT is TUNE:
Provide lyric suggestions including:
- Theme or emotional core
- 4-8 lines of original lyrics
- Rhyme scheme indication
- Vocal style suggestions
- Emotional tone

Return JSON in this exact format:
{
  "inputType": "lyrics" or "tune",
  "complementarySuggestions": {
    "type": "Tune/Chord Suggestions" or "Lyric Suggestions",
    "suggestions": [
      "Suggestion 1 with specific details",
      "Suggestion 2 with specific details",
      "Suggestion 3 with specific details"
    ]
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            inputType: {
              type: "string",
              enum: ["lyrics", "tune"]
            },
            complementarySuggestions: {
              type: "object",
              properties: {
                type: { type: "string" },
                suggestions: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["type", "suggestions"]
            }
          },
          required: ["inputType", "complementarySuggestions"]
        }
      },
      contents: `User input: "${userInput}"\n\nAnalyze this musical input and provide complementary suggestions based on the detected type.`
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    const analysis = JSON.parse(rawJson);

    // Generate mood-aware YouTube channel recommendations
    const channelPrompt = analysis.inputType === 'lyrics' 
      ? `${analysis.complementarySuggestions.suggestions[0]} - mood: ${mood}`
      : `${userInput} - mood: ${mood}`;
    
    const youtubeData = await suggestYouTubeChannels(channelPrompt, mood);

    return {
      inputType: analysis.inputType,
      complementarySuggestions: analysis.complementarySuggestions,
      youtubeChannels: youtubeData.channels
    };

  } catch (error) {
    console.error("Gemini music input analysis error:", error);
    console.log("Using local fallback for music analysis");
    
    // Robust local fallback with mood-aware suggestions
    return analyzeMusicallyLocally(userInput, mood);
  }
}

// Local music analysis when Gemini API is unavailable
function analyzeMusicallyLocally(
  userInput: string,
  mood: string
): {
  inputType: 'lyrics' | 'tune';
  complementarySuggestions: {
    type: string;
    suggestions: string[];
  };
  youtubeChannels: Array<{
    name: string;
    handle: string;
    description: string;
    genre: string;
    subscribers: string;
    why: string;
  }>;
} {
  const text = userInput.toLowerCase();
  
  // Enhanced detection logic
  const musicalTerms = ['bpm', 'tempo', 'chord', 'chords', 'melody', 'beat', 'rhythm', 'key', 'scale', 'instrument', 'progression', 'notes', 'acoustic', 'electric', 'synthesizer', 'drums', 'bass', 'major', 'minor', 'sharp', 'flat'];
  const hasMusicalTerms = musicalTerms.some(term => text.includes(term));
  
  // Check for chord notation patterns (e.g., "Am", "Cmaj7", "F#m", "Bbm")
  // Require chord suffixes or multiple chord instances to avoid false positives with lyrics
  // Case-sensitive to avoid matching words like "am" in lyrics
  const chordPattern = /\b[A-G][#b]?(m|maj|min|aug|dim|sus|add|\d|\/[A-G])/g;
  const chordMatches = userInput.match(chordPattern);
  const hasMultipleChords = chordMatches && chordMatches.length >= 2;
  
  // Detect simple chord sequences like "C G Am F" (multiple single letters, short tokens)
  const words = userInput.split(/\s+/);
  const simpleChordPattern = /^[A-G][#b]?m?$/;
  const simpleChordCount = words.filter(word => simpleChordPattern.test(word.trim())).length;
  const hasSimpleChordSequence = simpleChordCount >= 3 && words.length <= 10;
  
  // If it has musical terminology or chord notation, it's likely a tune description
  const looksLikeTune = hasMusicalTerms || hasMultipleChords || hasSimpleChordSequence;
  
  if (looksLikeTune) {
    // Input appears to be tune - suggest lyrics
    const moodBasedLyrics = getMoodBasedLyrics(mood);
    return {
      inputType: 'tune',
      complementarySuggestions: {
        type: 'Lyric Suggestions',
        suggestions: moodBasedLyrics
      },
      youtubeChannels: getMoodBasedChannels(mood, 'tune')
    };
  } else {
    // Input appears to be lyrics - suggest tune/chords
    const moodBasedTunes = getMoodBasedTunes(mood);
    return {
      inputType: 'lyrics',
      complementarySuggestions: {
        type: 'Tune/Chord Suggestions',
        suggestions: moodBasedTunes
      },
      youtubeChannels: getMoodBasedChannels(mood, 'lyrics')
    };
  }
}

// Get mood-appropriate tune/chord suggestions
function getMoodBasedTunes(mood: string): string[] {
  const moodTunes: Record<string, string[]> = {
    happy: [
      `🎹 Tempo: 120 BPM | Chords: C–G–Am–F | Bright piano with uplifting melody`,
      `🎸 Tempo: 125 BPM | Chords: D–A–Bm–G | Cheerful acoustic strumming`,
      `🎵 Tempo: 115 BPM | Chords: G–D–Em–C | Pop feel with major progressions`
    ],
    energetic: [
      `🎹 Tempo: 140 BPM | Chords: Em–C–G–D | Fast-paced with driving rhythm`,
      `🎸 Tempo: 135 BPM | Chords: Am–F–C–G | Electric guitar with power chords`,
      `🎵 Tempo: 145 BPM | Chords: Dm–Bb–F–C | High-energy dance beat`
    ],
    calm: [
      `🎹 Tempo: 75 BPM | Chords: Am–F–C–G | Soft piano with gentle strings`,
      `🎸 Tempo: 70 BPM | Chords: Em–C–G–D | Fingerpicked acoustic`,
      `🎵 Tempo: 80 BPM | Chords: Dm–Bb–F–C | Ambient pads with subtle melody`
    ],
    sad: [
      `🎹 Tempo: 65 BPM | Chords: Am–F–C–Em | Minor key piano ballad`,
      `🎸 Tempo: 60 BPM | Chords: Dm–Bb–F–Am | Melancholic acoustic`,
      `🎵 Tempo: 70 BPM | Chords: Em–C–G–Am | Slow, emotional progression`
    ]
  };
  
  return moodTunes[mood] || moodTunes['calm'];
}

// Get mood-appropriate lyric suggestions
function getMoodBasedLyrics(mood: string): string[] {
  const moodLyrics: Record<string, string[]> = {
    happy: [
      `🎤 "Sunshine breaking through the clouds today / Every moment feels like a new way / Dancing freely, nothing in my way / This is where I choose to stay"`,
      `🎤 "Laughter echoes in the summer air / No more worries, no more cares / Living fully, hearts laid bare / Joy is everywhere"`,
      `🎤 "Colors brighter than I've ever seen / Life's a canvas, painting dreams / Every heartbeat in between / Shows me what it means"`
    ],
    energetic: [
      `🎤 "Racing forward, can't slow down / Feel the power all around / Breaking barriers, breaking ground / This is where I'm found"`,
      `🎤 "Lightning strikes inside my veins / Nothing holding back the flames / Push beyond the old constraints / Write my name in change"`,
      `🎤 "Thunder rolling in my chest / Never settling for less / Taking on this quest / Giving it my best"`
    ],
    calm: [
      `🎤 "Wandering through thoughts, finding my way / Each step certain, in the light of day / Peaceful moments, here to stay / Breathing in this gentle sway"`,
      `🎤 "Stillness wraps around my soul / Finally feeling whole / Let the quiet take control / In this peaceful role"`,
      `🎤 "Soft winds whisper through the trees / Finding comfort in the breeze / All my worries start to ease / Moments just like these"`
    ],
    sad: [
      `🎤 "Empty spaces where you used to be / Shadows of what we could see / Missing all that used to be / Lost in memory"`,
      `🎤 "Rain falls softly on the glass / Watching moments as they pass / Nothing good could ever last / Holding to the past"`,
      `🎤 "Silent tears that no one sees / Fallen to my knees / Searching for some ease / In these broken memories"`
    ]
  };
  
  return moodLyrics[mood] || moodLyrics['calm'];
}

// Get mood-appropriate YouTube channel suggestions
function getMoodBasedChannels(mood: string, inputType: 'lyrics' | 'tune'): Array<{
  name: string;
  handle: string;
  description: string;
  genre: string;
  subscribers: string;
  why: string;
}> {
  const moodChannels: Record<string, any[]> = {
    happy: [
      {
        name: "Vevo",
        handle: "@vevo",
        description: "Official music videos from top artists",
        genre: "Pop/Various",
        subscribers: "30M subscribers",
        why: `Uplifting ${mood} music from popular artists`
      },
      {
        name: "Selected.",
        handle: "@selected",
        description: "Upbeat indie and electronic music",
        genre: "Indie/Electronic",
        subscribers: "3M subscribers",
        why: "Feel-good tracks matching your cheerful vibe"
      }
    ],
    energetic: [
      {
        name: "Monstercat",
        handle: "@Monstercat",
        description: "Electronic music label with high-energy tracks",
        genre: "EDM/Electronic",
        subscribers: "13M subscribers",
        why: `High-energy ${mood} beats and bass`
      },
      {
        name: "Proximity",
        handle: "@Proximity",
        description: "Electronic dance music channel",
        genre: "EDM",
        subscribers: "7M subscribers",
        why: "Dynamic tracks for your energetic mood"
      }
    ],
    calm: [
      {
        name: "Lofi Girl",
        handle: "@LofiGirl",
        description: "24/7 lofi hip hop beats",
        genre: "Lofi Hip Hop",
        subscribers: "13M subscribers",
        why: `Perfect for ${mood} relaxation and focus`
      },
      {
        name: "Chill Music Lab",
        handle: "@ChillMusicLab",
        description: "Chill music for relaxation",
        genre: "Chill/Ambient",
        subscribers: "1M subscribers",
        why: "Peaceful vibes for your calm state"
      }
    ],
    sad: [
      {
        name: "Sad Songs",
        handle: "@SadSongsMusic",
        description: "Emotional and melancholic music",
        genre: "Sad/Emotional",
        subscribers: "500K subscribers",
        why: `Songs that understand your ${mood} feelings`
      },
      {
        name: "Indie Folk Central",
        handle: "@indiefolkcentral",
        description: "Melancholic indie folk music",
        genre: "Indie Folk",
        subscribers: "800K subscribers",
        why: "Reflective music for introspective moments"
      }
    ]
  };
  
  return moodChannels[mood] || moodChannels['calm'];
}

export { lyriaClient };

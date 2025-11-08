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
  // Frontend sends: "Voice characteristics: Average pitch 247Hz (high-pitched), volume 10 (quiet), energy 764 (low energy)"
  let voiceAnalysis = null;
  const pitchMatch = text.match(/pitch\s+(\d+)hz\s*\(([^)]+)-pitched\)/i);
  const volumeMatch = text.match(/volume\s+(\d+)\s*\(([^)]+)\)/i);
  const energyMatch = text.match(/energy\s+(\d+)\s*\(([^)]+)\)/i);
  
  if (pitchMatch || volumeMatch || energyMatch) {
    const pitch = pitchMatch ? parseInt(pitchMatch[1]) : 0;
    const pitchLevel = pitchMatch ? pitchMatch[2].toLowerCase() : 'moderate';
    const volume = volumeMatch ? parseInt(volumeMatch[1]) : 0;
    const volumeLevel = volumeMatch ? volumeMatch[2].toLowerCase() : 'normal';
    const energy = energyMatch ? parseInt(energyMatch[1]) : 0;
    // Energy level comes as "very energetic", "low energy", or "moderate"
    const energyLevel = energyMatch ? energyMatch[2].toLowerCase().trim() : 'moderate';
    
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
    console.log('✓ Parsed voice characteristics:', voiceAnalysis);
  } else {
    console.log('✗ Could not parse voice characteristics from text:', text.substring(0, 200));
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
    console.log(`✓ Keyword match: "${topMood}" with score ${score}`);
    return {
      mood: topMood as any,
      confidence,
      reasoning: `Detected "${topMood}" from ${score} keyword indicator(s)`
    };
  }
  
  console.log('✗ No keyword matches found, analyzing voice characteristics...');
  
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
  console.log('⚠️ Fallback: Defaulting to calm mood (no clear emotional indicators)');
  return {
    mood: 'calm',
    confidence: 40,
    reasoning: 'No clear emotional indicators detected - defaulting to calm baseline'
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
3. CRITICAL: All suggestions MUST reflect and align with the user's emotional mood: ${mood}

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
Provide tune/chord suggestions that MATCH THE ${mood.toUpperCase()} MOOD including:
- Tempo (BPM) appropriate for ${mood} feeling
- Chord progressions that evoke ${mood} emotion
- Instrumentation that resonates with ${mood} state
- Genre/style recommendations matching ${mood}
- Mood/feel descriptions aligned with ${mood}

🎤 If INPUT is TUNE:
Provide lyric suggestions that EXPRESS THE ${mood.toUpperCase()} MOOD including:
- Theme or emotional core reflecting ${mood}
- 4-8 lines of original lyrics capturing ${mood} feeling
- Rhyme scheme indication
- Vocal style suggestions matching ${mood}
- Emotional tone that embodies ${mood}

⚠️ IMPORTANT: Every suggestion must be specifically tailored to the ${mood} mood. Generic suggestions are not acceptable.

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
    ],
    anxious: [
      `🎹 Tempo: 90 BPM | Chords: Em–C–G–D | Grounding bass line with steady rhythm`,
      `🎸 Tempo: 95 BPM | Chords: Am–Dm–G–C | Rhythmic acoustic with calming pattern`,
      `🎵 Tempo: 85 BPM | Chords: Bm–G–D–A | Repetitive soothing progression`
    ],
    stressed: [
      `🎹 Tempo: 95 BPM | Chords: Dm–Bb–F–C | Tension-building verses with releasing chorus`,
      `🎸 Tempo: 100 BPM | Chords: Gm–Eb–Bb–F | Medium tempo with dynamic shifts`,
      `🎵 Tempo: 90 BPM | Chords: Em–Am–D–G | Calming down from intensity`
    ],
    peaceful: [
      `🎹 Tempo: 75 BPM | Chords: F–C–Dm–Bb | Gentle flowing melody with nature sounds`,
      `🎸 Tempo: 70 BPM | Chords: G–Em–C–D | Soft fingerstyle with open chords`,
      `🎵 Tempo: 65 BPM | Chords: Am–F–G–C | Meditative flute and strings`
    ],
    angry: [
      `🎹 Tempo: 130 BPM | Chords: Dm–A–Bb–F | Heavy percussion and power chords`,
      `🎸 Tempo: 125 BPM | Chords: Em–B–C–G | Distorted electric guitar`,
      `🎵 Tempo: 135 BPM | Chords: Am–E–F–C | Aggressive rhythm with strong dynamics`
    ],
    confused: [
      `🎹 Tempo: 85 BPM | Chords: Am–Dm–G–C | Questioning melodic phrases`,
      `🎸 Tempo: 80 BPM | Chords: Em–Am–Bm–G | Wandering chord progression`,
      `🎵 Tempo: 90 BPM | Chords: Cm–Fm–Bb–Eb | Suspended chords with unresolved feel`
    ],
    excited: [
      `🎹 Tempo: 145 BPM | Chords: A–E–F#m–D | Fast upbeat with building energy`,
      `🎸 Tempo: 150 BPM | Chords: C–G–Am–F | Vibrant synths and driving beat`,
      `🎵 Tempo: 140 BPM | Chords: E–B–C#m–A | Explosive crescendos and drops`
    ],
    melancholic: [
      `🎹 Tempo: 65 BPM | Chords: Em–Am–D–G | Nostalgic cello and piano`,
      `🎸 Tempo: 70 BPM | Chords: Am–Em–F–C | Bittersweet fingerpicked progression`,
      `🎵 Tempo: 60 BPM | Chords: Dm–Gm–C–F | Wistful strings with minor harmonies`
    ],
    confident: [
      `🎹 Tempo: 115 BPM | Chords: C–G–Am–F | Bold brass fanfares and strong bass`,
      `🎸 Tempo: 120 BPM | Chords: E–A–B–C#m | Powerful electric guitar`,
      `🎵 Tempo: 110 BPM | Chords: D–G–A–Bm | Triumphant major progressions`
    ],
    blissful: [
      `🎹 Tempo: 80 BPM | Chords: Dmaj7–Amaj7–Emaj7–Bm7 | Ethereal synths and pads`,
      `🎸 Tempo: 85 BPM | Chords: Cmaj7–Gmaj7–Fmaj7–Am7 | Dreamy sustained melodies`,
      `🎵 Tempo: 75 BPM | Chords: Gmaj7–Dmaj7–Cmaj7–Em7 | Floating ambient textures`
    ],
    lonely: [
      `🎹 Tempo: 70 BPM | Chords: Am–Em–F–C | Sparse solo piano or guitar`,
      `🎸 Tempo: 65 BPM | Chords: Dm–Am–Bb–F | Minimal arrangement with space`,
      `🎵 Tempo: 75 BPM | Chords: Em–Bm–C–G | Quiet, isolated single instrument`
    ],
    hopeful: [
      `🎹 Tempo: 100 BPM | Chords: D–A–Bm–G | Ascending melodies with brightness`,
      `🎸 Tempo: 105 BPM | Chords: C–F–G–Am | Uplifting acoustic and strings`,
      `🎵 Tempo: 95 BPM | Chords: G–D–Em–C | Inspiring progression building to light`
    ],
    overwhelmed: [
      `🎹 Tempo: 80 BPM | Chords: Gm–Eb–Bb–F | Initially complex then simplifying`,
      `🎸 Tempo: 75 BPM | Chords: Cm–Ab–Eb–Bb | Resolving to simpler pattern`,
      `🎵 Tempo: 85 BPM | Chords: Dm–F–Am–C | Calming down to gentle melody`
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
    ],
    anxious: [
      `🎤 "Heart is racing, breath unsteady now / Trying to remember how / To find my center, calm somehow / Break free from this vow"`,
      `🎤 "Thoughts are spinning out of control / Need to find my solid ground / Take it slow, make myself whole / Let peace be found"`,
      `🎤 "Gripping tight to what I know / Fear is just a shadow's show / Breathe in deep and let it go / Watch my courage grow"`
    ],
    stressed: [
      `🎤 "Weight of the world upon my shoulders / Pressure building, growing colder / Need to find a way to hold her / Before I fold up"`,
      `🎤 "Deadlines closing in on me / Drowning in responsibility / Searching for a way to be / Finally free"`,
      `🎤 "Step by step, I'll make it through / One more breath, one thing to do / Breaking down what's overdue / Starting fresh and new"`
    ],
    peaceful: [
      `🎤 "Morning light on tranquil waters / Everything in perfect order / Nature's song, I'm her supporter / Peace is all I've sought here"`,
      `🎤 "Silence speaks in gentle tones / Finding rest in quiet zones / Let the world fade, I'm alone / In this sacred home"`,
      `🎤 "Harmony flows through my being / Every breath, a peaceful feeling / Wounds of yesterday are healing / Truth I'm now revealing"`
    ],
    angry: [
      `🎤 "Fire burning deep inside / Won't let them see me hide / Standing tall with righteous pride / Fury I won't disguise"`,
      `🎤 "Thunder crashing in my mind / Done with being pushed behind / Breaking chains of every kind / Freedom I will find"`,
      `🎤 "Rage like lightning in my soul / Shattered pieces made me whole / Taking back complete control / Playing my own role"`
    ],
    confused: [
      `🎤 "Lost between the what and why / Questions circle, multiply / Truth and lies begin to fly / Can't tell earth from sky"`,
      `🎤 "Every path looks just the same / Don't even know my own name / In this never-ending game / Who's to blame?"`,
      `🎤 "Searching for a guiding star / Wonder who and what we are / Answers feel so very far / From where we are"`
    ],
    excited: [
      `🎤 "Lightning dancing in my chest / This feeling is the best / Ready for this brand new quest / Put me to the test"`,
      `🎤 "Can't contain this energy / Everything's a possibility / Breaking free from gravity / Living wild and free"`,
      `🎤 "Counting seconds till it starts / Electric fire in our hearts / This is where the future sparks / We're creating art"`
    ],
    melancholic: [
      `🎤 "Bittersweet like autumn rain / Beauty mixed with all this pain / Memories that still remain / Echoes of your name"`,
      `🎤 "Fading photos, distant sighs / Watching as the daylight dies / Truth beneath the alibis / Goodbye after goodbye"`,
      `🎤 "Wistful dreams of what could be / Ghosts of our what used to be / Haunted by the memory / Of how we used to be"`
    ],
    confident: [
      `🎤 "Standing tall, I know my worth / Claimed my power since my birth / Shaking up the earth / Showing what I'm worth"`,
      `🎤 "No more doubt within my mind / Left my fears all behind / Destiny that I'll define / Victory I'll find"`,
      `🎤 "Walking with my head held high / Reaching for the endless sky / Never asking how or why / Born to fly"`
    ],
    blissful: [
      `🎤 "Floating on a cloud of dreams / Nothing's quite what it seems / Pure euphoria in streams / Bursting at the seams"`,
      `🎤 "Every color, every sound / Perfect harmony I've found / Feet above the ground / Bliss is all around"`,
      `🎤 "Heaven's closer than I thought / Found the peace I always sought / Can't be bought or taught / In this moment caught"`
    ],
    lonely: [
      `🎤 "Empty echoes fill my room / Silence like a heavy gloom / Waiting for someone to / Chase away this tomb"`,
      `🎤 "Phone that never seems to ring / Longing for what morning brings / Isolated from all things / Clipped my wings"`,
      `🎤 "Walking streets I've walked before / But now I'm on my own once more / Searching for an open door / To something more"`
    ],
    hopeful: [
      `🎤 "Tomorrow holds a brighter day / Darkness slowly fades away / Finding strength to make my way / To where I'll stay"`,
      `🎤 "Seeds I've planted start to grow / Light returns with gentle glow / Better days ahead I know / Watch me grow"`,
      `🎤 "Dawn is breaking through the night / Everything will be alright / Holding on with all my might / To this new light"`
    ],
    overwhelmed: [
      `🎤 "Too much noise, can't find my center / Drowning in what I must enter / Need a moment to remember / How to be tender"`,
      `🎤 "Chaos swirling all around / Trying to find solid ground / One thing at a time I've found / Peace can still be found"`,
      `🎤 "Simplifying all the mess / Learning how to do with less / Breathing through the stress / Finding rest"`
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
        why: "Uplifting happy music from popular artists"
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
        why: "High-energy beats and bass to match your energy"
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
        why: "Perfect for calm relaxation and focus"
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
        why: "Songs that understand your sad feelings"
      },
      {
        name: "Indie Folk Central",
        handle: "@indiefolkcentral",
        description: "Melancholic indie folk music",
        genre: "Indie Folk",
        subscribers: "800K subscribers",
        why: "Reflective music for introspective moments"
      }
    ],
    anxious: [
      {
        name: "Meditation Relax Music",
        handle: "@MeditationRelaxMusic",
        description: "Calming meditation and relaxation music",
        genre: "Meditation/Ambient",
        subscribers: "10M subscribers",
        why: "Soothing sounds to ease anxiety and tension"
      },
      {
        name: "Yellow Brick Cinema",
        handle: "@YellowBrickCinema",
        description: "Relaxing music for stress relief",
        genre: "Relaxation/Healing",
        subscribers: "6M subscribers",
        why: "Gentle music to calm anxious thoughts"
      }
    ],
    stressed: [
      {
        name: "Soothing Relaxation",
        handle: "@SoothingRelaxation",
        description: "Beautiful relaxing music for stress relief",
        genre: "Relaxation/Piano",
        subscribers: "8M subscribers",
        why: "Stress-relieving music to help you unwind"
      },
      {
        name: "Peaceful Mind",
        handle: "@peacefulmindmusic",
        description: "Peaceful music for meditation and relaxation",
        genre: "Meditation",
        subscribers: "2M subscribers",
        why: "Calming tracks to reduce stress levels"
      }
    ],
    peaceful: [
      {
        name: "Meditation Mind",
        handle: "@MeditationMindfulness",
        description: "Peaceful meditation music and nature sounds",
        genre: "Meditation/Nature",
        subscribers: "4M subscribers",
        why: "Tranquil soundscapes for peaceful moments"
      },
      {
        name: "Nature Sounds",
        handle: "@NatureSoundsRelaxation",
        description: "Pure nature sounds and ambient music",
        genre: "Nature/Ambient",
        subscribers: "3M subscribers",
        why: "Natural peaceful sounds for deep relaxation"
      }
    ],
    angry: [
      {
        name: "Rock Sound",
        handle: "@rocksound",
        description: "Rock and alternative music channel",
        genre: "Rock/Metal",
        subscribers: "2M subscribers",
        why: "Powerful rock music to channel your anger"
      },
      {
        name: "Metal Hammer",
        handle: "@MetalHammer",
        description: "Heavy metal and hard rock videos",
        genre: "Metal/Hard Rock",
        subscribers: "1.5M subscribers",
        why: "Intense music that matches your fiery mood"
      }
    ],
    confused: [
      {
        name: "Majestic Casual",
        handle: "@majesticcasual",
        description: "Indie and alternative music discoveries",
        genre: "Indie/Alternative",
        subscribers: "5M subscribers",
        why: "Thought-provoking music to help clear confusion"
      },
      {
        name: "Mr Suicide Sheep",
        handle: "@MrSuicideSheep",
        description: "Electronic and indie music channel",
        genre: "Electronic/Indie",
        subscribers: "12M subscribers",
        why: "Atmospheric tracks for contemplative moments"
      }
    ],
    excited: [
      {
        name: "Trap Nation",
        handle: "@TrapNation",
        description: "Best trap music and remixes",
        genre: "Trap/EDM",
        subscribers: "30M subscribers",
        why: "Exciting beats to amplify your enthusiasm"
      },
      {
        name: "UKF Dubstep",
        handle: "@UKFDubstep",
        description: "Dubstep and bass music channel",
        genre: "Dubstep/Bass",
        subscribers: "5M subscribers",
        why: "High-energy drops for your excited state"
      }
    ],
    melancholic: [
      {
        name: "Alexrainbird Music",
        handle: "@alexrainbirdMusic",
        description: "Indie music with melancholic vibes",
        genre: "Indie/Alternative",
        subscribers: "2M subscribers",
        why: "Beautiful melancholic indie tracks"
      },
      {
        name: "The Sound You Need",
        handle: "@thesoundyouneed",
        description: "Emotional indie and electronic music",
        genre: "Indie/Electronic",
        subscribers: "7M subscribers",
        why: "Emotional depth for melancholic reflection"
      }
    ],
    confident: [
      {
        name: "Rap Nation",
        handle: "@RapNation",
        description: "Best hip hop and rap music",
        genre: "Hip Hop/Rap",
        subscribers: "9M subscribers",
        why: "Confident rap tracks to boost your swagger"
      },
      {
        name: "Trap City",
        handle: "@OfficialTrapCity",
        description: "Trap music and bass boosted tracks",
        genre: "Trap/Hip Hop",
        subscribers: "15M subscribers",
        why: "Bold beats that match your confidence"
      }
    ],
    blissful: [
      {
        name: "Silk Music",
        handle: "@SilkMusic",
        description: "Progressive house and chillout music",
        genre: "Progressive House/Chillout",
        subscribers: "1M subscribers",
        why: "Blissful progressive melodies and euphoric vibes"
      },
      {
        name: "MrRevillz",
        handle: "@MrRevillz",
        description: "Future bass and melodic dubstep",
        genre: "Future Bass/Melodic",
        subscribers: "3M subscribers",
        why: "Uplifting melodic sounds for blissful moments"
      }
    ],
    lonely: [
      {
        name: "Chill Nation",
        handle: "@ChillNation",
        description: "Chill music and sad songs",
        genre: "Chill/Emotional",
        subscribers: "7M subscribers",
        why: "Comforting music for lonely times"
      },
      {
        name: "CloudKid",
        handle: "@CloudKid",
        description: "Emotional indie and electronic music",
        genre: "Indie/Electronic",
        subscribers: "4M subscribers",
        why: "Emotional tracks that keep you company"
      }
    ],
    hopeful: [
      {
        name: "Epic Music World",
        handle: "@EpicMusicWorld",
        description: "Inspirational and epic orchestral music",
        genre: "Epic/Orchestral",
        subscribers: "2M subscribers",
        why: "Uplifting orchestral music for hopeful dreams"
      },
      {
        name: "Seeking Light",
        handle: "@SeekingLight",
        description: "Inspirational music and soundtracks",
        genre: "Inspirational/Cinematic",
        subscribers: "800K subscribers",
        why: "Inspiring melodies that fuel hope and optimism"
      }
    ],
    overwhelmed: [
      {
        name: "Calming Sounds",
        handle: "@CalmingSounds",
        description: "Gentle music to reduce overwhelm",
        genre: "Ambient/Healing",
        subscribers: "1.5M subscribers",
        why: "Gentle ambient sounds to help you breathe"
      },
      {
        name: "Calm Meditation",
        handle: "@CalmMeditationMusic",
        description: "Meditation music for mental clarity",
        genre: "Meditation/Spa",
        subscribers: "3M subscribers",
        why: "Grounding music to restore balance when overwhelmed"
      }
    ]
  };
  
  return moodChannels[mood] || moodChannels['calm'];
}

export { lyriaClient };

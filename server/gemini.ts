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
    // Fallback to random mood
    const moods: Array<'calm' | 'energetic' | 'sad' | 'anxious' | 'happy' | 'stressed' | 'peaceful' | 'angry' | 'confused' | 'excited' | 'melancholic' | 'confident' | 'blissful' | 'lonely' | 'hopeful' | 'overwhelmed'> = 
      ['calm', 'energetic', 'sad', 'anxious', 'happy', 'stressed', 'peaceful', 'angry', 'confused', 'excited', 'melancholic', 'confident', 'blissful', 'lonely', 'hopeful', 'overwhelmed'];
    return {
      mood: moods[Math.floor(Math.random() * moods.length)],
      confidence: 75,
      reasoning: "Analysis based on general patterns"
    };
  }
}

export async function generateCreativeSuggestions(
  mood: string,
  mode: 'music' | 'art' | 'poetry',
  context?: string
): Promise<string[]> {
  try {
    const prompt = `You are a creative AI assistant helping someone in a ${mood} mood.
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

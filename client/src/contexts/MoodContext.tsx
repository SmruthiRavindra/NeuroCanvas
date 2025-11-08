import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Mood = 'calm' | 'energetic' | 'sad' | 'anxious' | null;

interface MoodContextType {
  mood: Mood;
  setMood: (mood: Mood) => void;
  confidence: number;
  setConfidence: (confidence: number) => void;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export function MoodProvider({ children }: { children: ReactNode }) {
  const [mood, setMood] = useState<Mood>(null);
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    if (mood) {
      root.setAttribute('data-mood', mood);
    } else {
      root.removeAttribute('data-mood');
    }
  }, [mood]);

  return (
    <MoodContext.Provider value={{ mood, setMood, confidence, setConfidence }}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
}

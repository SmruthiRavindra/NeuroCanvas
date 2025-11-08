import { useState, useEffect, useRef } from 'react';
import { Music, Palette, FileText, Sparkles, RefreshCw, Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useMood } from '@/contexts/MoodContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const moodColorPalettes = {
  calm: [
    { name: 'Ocean Blue', hex: '#3B82F6', rgb: 'rgb(59, 130, 246)' },
    { name: 'Soft Teal', hex: '#14B8A6', rgb: 'rgb(20, 184, 166)' },
    { name: 'Lavender', hex: '#A78BFA', rgb: 'rgb(167, 139, 250)' },
    { name: 'Mint Green', hex: '#6EE7B7', rgb: 'rgb(110, 231, 183)' },
    { name: 'Sky Blue', hex: '#7DD3FC', rgb: 'rgb(125, 211, 252)' },
    { name: 'Periwinkle', hex: '#C7D2FE', rgb: 'rgb(199, 210, 254)' },
  ],
  energetic: [
    { name: 'Vibrant Orange', hex: '#F97316', rgb: 'rgb(249, 115, 22)' },
    { name: 'Hot Pink', hex: '#EC4899', rgb: 'rgb(236, 72, 153)' },
    { name: 'Electric Yellow', hex: '#FBBF24', rgb: 'rgb(251, 191, 36)' },
    { name: 'Lime Green', hex: '#84CC16', rgb: 'rgb(132, 204, 22)' },
    { name: 'Coral Red', hex: '#EF4444', rgb: 'rgb(239, 68, 68)' },
    { name: 'Magenta', hex: '#D946EF', rgb: 'rgb(217, 70, 239)' },
  ],
  sad: [
    { name: 'Deep Navy', hex: '#1E3A8A', rgb: 'rgb(30, 58, 138)' },
    { name: 'Slate Gray', hex: '#64748B', rgb: 'rgb(100, 116, 139)' },
    { name: 'Muted Purple', hex: '#6366F1', rgb: 'rgb(99, 102, 241)' },
    { name: 'Storm Blue', hex: '#475569', rgb: 'rgb(71, 85, 105)' },
    { name: 'Charcoal', hex: '#374151', rgb: 'rgb(55, 65, 81)' },
    { name: 'Twilight', hex: '#4C1D95', rgb: 'rgb(76, 29, 149)' },
  ],
  anxious: [
    { name: 'Warm Terracotta', hex: '#EA580C', rgb: 'rgb(234, 88, 12)' },
    { name: 'Soft Peach', hex: '#FED7AA', rgb: 'rgb(254, 215, 170)' },
    { name: 'Earth Brown', hex: '#92400E', rgb: 'rgb(146, 64, 14)' },
    { name: 'Sage Green', hex: '#16A34A', rgb: 'rgb(22, 163, 74)' },
    { name: 'Golden Amber', hex: '#F59E0B', rgb: 'rgb(245, 158, 11)' },
    { name: 'Clay', hex: '#B45309', rgb: 'rgb(180, 83, 9)' },
  ],
  happy: [
    { name: 'Sunshine Yellow', hex: '#FDE047', rgb: 'rgb(253, 224, 71)' },
    { name: 'Bright Gold', hex: '#FBBF24', rgb: 'rgb(251, 191, 36)' },
    { name: 'Warm Amber', hex: '#F59E0B', rgb: 'rgb(245, 158, 11)' },
    { name: 'Cheerful Orange', hex: '#FB923C', rgb: 'rgb(251, 146, 60)' },
    { name: 'Light Coral', hex: '#FCA5A5', rgb: 'rgb(252, 165, 165)' },
    { name: 'Golden Peach', hex: '#FDBA74', rgb: 'rgb(253, 186, 116)' },
  ],
  stressed: [
    { name: 'Deep Red', hex: '#DC2626', rgb: 'rgb(220, 38, 38)' },
    { name: 'Burnt Orange', hex: '#EA580C', rgb: 'rgb(234, 88, 12)' },
    { name: 'Dark Crimson', hex: '#991B1B', rgb: 'rgb(153, 27, 27)' },
    { name: 'Rust', hex: '#C2410C', rgb: 'rgb(194, 65, 12)' },
    { name: 'Maroon', hex: '#7F1D1D', rgb: 'rgb(127, 29, 29)' },
    { name: 'Terracotta', hex: '#B91C1C', rgb: 'rgb(185, 28, 28)' },
  ],
  peaceful: [
    { name: 'Soft Green', hex: '#86EFAC', rgb: 'rgb(134, 239, 172)' },
    { name: 'Mint', hex: '#6EE7B7', rgb: 'rgb(110, 231, 183)' },
    { name: 'Aqua', hex: '#5EEAD4', rgb: 'rgb(94, 234, 212)' },
    { name: 'Seafoam', hex: '#99F6E4', rgb: 'rgb(153, 246, 228)' },
    { name: 'Jade', hex: '#34D399', rgb: 'rgb(52, 211, 153)' },
    { name: 'Teal', hex: '#2DD4BF', rgb: 'rgb(45, 212, 191)' },
  ],
  angry: [
    { name: 'Crimson', hex: '#EF4444', rgb: 'rgb(239, 68, 68)' },
    { name: 'Scarlet', hex: '#DC2626', rgb: 'rgb(220, 38, 38)' },
    { name: 'Blood Red', hex: '#B91C1C', rgb: 'rgb(185, 28, 28)' },
    { name: 'Fire', hex: '#F87171', rgb: 'rgb(248, 113, 113)' },
    { name: 'Ruby', hex: '#991B1B', rgb: 'rgb(153, 27, 27)' },
    { name: 'Vermillion', hex: '#FCA5A5', rgb: 'rgb(252, 165, 165)' },
  ],
  confused: [
    { name: 'Lavender Gray', hex: '#A78BFA', rgb: 'rgb(167, 139, 250)' },
    { name: 'Misty Purple', hex: '#C4B5FD', rgb: 'rgb(196, 181, 253)' },
    { name: 'Dusty Violet', hex: '#9333EA', rgb: 'rgb(147, 51, 234)' },
    { name: 'Soft Mauve', hex: '#DDD6FE', rgb: 'rgb(221, 214, 254)' },
    { name: 'Haze', hex: '#8B5CF6', rgb: 'rgb(139, 92, 246)' },
    { name: 'Periwinkle', hex: '#C7D2FE', rgb: 'rgb(199, 210, 254)' },
  ],
  excited: [
    { name: 'Hot Pink', hex: '#EC4899', rgb: 'rgb(236, 72, 153)' },
    { name: 'Fuchsia', hex: '#D946EF', rgb: 'rgb(217, 70, 239)' },
    { name: 'Magenta', hex: '#C026D3', rgb: 'rgb(192, 38, 211)' },
    { name: 'Rose', hex: '#F472B6', rgb: 'rgb(244, 114, 182)' },
    { name: 'Bright Pink', hex: '#F9A8D4', rgb: 'rgb(249, 168, 212)' },
    { name: 'Vivid Purple', hex: '#E879F9', rgb: 'rgb(232, 121, 249)' },
  ],
  melancholic: [
    { name: 'Dusk Blue', hex: '#6366F1', rgb: 'rgb(99, 102, 241)' },
    { name: 'Twilight', hex: '#4C1D95', rgb: 'rgb(76, 29, 149)' },
    { name: 'Midnight', hex: '#312E81', rgb: 'rgb(49, 46, 129)' },
    { name: 'Deep Indigo', hex: '#4338CA', rgb: 'rgb(67, 56, 202)' },
    { name: 'Somber Gray', hex: '#64748B', rgb: 'rgb(100, 116, 139)' },
    { name: 'Stormy Blue', hex: '#475569', rgb: 'rgb(71, 85, 105)' },
  ],
  confident: [
    { name: 'Bright Cyan', hex: '#22D3EE', rgb: 'rgb(34, 211, 238)' },
    { name: 'Electric Blue', hex: '#06B6D4', rgb: 'rgb(6, 182, 212)' },
    { name: 'Azure', hex: '#38BDF8', rgb: 'rgb(56, 189, 248)' },
    { name: 'Sky', hex: '#7DD3FC', rgb: 'rgb(125, 211, 252)' },
    { name: 'Turquoise', hex: '#14B8A6', rgb: 'rgb(20, 184, 166)' },
    { name: 'Ocean', hex: '#0EA5E9', rgb: 'rgb(14, 165, 233)' },
  ],
  blissful: [
    { name: 'Soft Purple', hex: '#C084FC', rgb: 'rgb(192, 132, 252)' },
    { name: 'Dreamy Violet', hex: '#A78BFA', rgb: 'rgb(167, 139, 250)' },
    { name: 'Lavender', hex: '#DDD6FE', rgb: 'rgb(221, 214, 254)' },
    { name: 'Lilac', hex: '#E9D5FF', rgb: 'rgb(233, 213, 255)' },
    { name: 'Orchid', hex: '#D8B4FE', rgb: 'rgb(216, 180, 254)' },
    { name: 'Amethyst', hex: '#9333EA', rgb: 'rgb(147, 51, 234)' },
  ],
  lonely: [
    { name: 'Cool Gray', hex: '#94A3B8', rgb: 'rgb(148, 163, 184)' },
    { name: 'Slate', hex: '#64748B', rgb: 'rgb(100, 116, 139)' },
    { name: 'Ash', hex: '#475569', rgb: 'rgb(71, 85, 105)' },
    { name: 'Steel', hex: '#334155', rgb: 'rgb(51, 65, 85)' },
    { name: 'Pewter', hex: '#1E293B', rgb: 'rgb(30, 41, 59)' },
    { name: 'Shadow', hex: '#0F172A', rgb: 'rgb(15, 23, 42)' },
  ],
  hopeful: [
    { name: 'Fresh Teal', hex: '#14B8A6', rgb: 'rgb(20, 184, 166)' },
    { name: 'Spring Green', hex: '#10B981', rgb: 'rgb(16, 185, 129)' },
    { name: 'Emerald', hex: '#059669', rgb: 'rgb(5, 150, 105)' },
    { name: 'Seafoam', hex: '#2DD4BF', rgb: 'rgb(45, 212, 191)' },
    { name: 'Aquamarine', hex: '#5EEAD4', rgb: 'rgb(94, 234, 212)' },
    { name: 'Mint', hex: '#6EE7B7', rgb: 'rgb(110, 231, 183)' },
  ],
  overwhelmed: [
    { name: 'Burnt Sienna', hex: '#EA580C', rgb: 'rgb(234, 88, 12)' },
    { name: 'Copper', hex: '#C2410C', rgb: 'rgb(194, 65, 12)' },
    { name: 'Bronze', hex: '#9A3412', rgb: 'rgb(154, 52, 18)' },
    { name: 'Rust Red', hex: '#DC2626', rgb: 'rgb(220, 38, 38)' },
    { name: 'Mahogany', hex: '#7C2D12', rgb: 'rgb(124, 45, 18)' },
    { name: 'Dark Amber', hex: '#92400E', rgb: 'rgb(146, 64, 14)' },
  ],
};

const moodSuggestions: Record<string, { music: string[], art: string[], poetry: string[] }> = {
  calm: {
    music: ['Soft piano melody in C major', 'Ambient soundscape with gentle strings', 'Lo-fi beats at 80 BPM'],
    art: ['Watercolor blues and soft greens', 'Gentle brush strokes with flowing lines', 'Abstract ocean waves'],
    poetry: ['Serenity', 'Stillness', 'Gentle breath', 'Quiet moments'],
  },
  energetic: {
    music: ['Upbeat tempo at 140 BPM', 'Major key progression with brass', 'Electronic dance rhythm'],
    art: ['Bold orange and yellow palettes', 'Dynamic angular shapes', 'Vibrant sunset colors'],
    poetry: ['Lightning', 'Momentum', 'Burning bright', 'Electric energy'],
  },
  sad: {
    music: ['Minor key ballad', 'Slow tempo at 60 BPM', 'Melancholic strings'],
    art: ['Muted grays and deep blues', 'Soft charcoal sketches', 'Rain-soaked scenes'],
    poetry: ['Fading light', 'Silent tears', 'Empty spaces', 'Longing'],
  },
  anxious: {
    music: ['Rhythmic grounding patterns', 'Warm acoustic guitar', 'Steady heartbeat percussion'],
    art: ['Warm earth tones', 'Structured geometric patterns', 'Grounding landscapes'],
    poetry: ['Breathe deep', 'Finding center', 'Steady ground', 'Inner strength'],
  },
  happy: {
    music: ['Cheerful pop progression', 'Upbeat acoustic strumming', 'Major scale joy'],
    art: ['Sunny yellows and bright whites', 'Playful patterns', 'Smiling faces'],
    poetry: ['Sunshine', 'Laughter', 'Dancing heart', 'Pure joy'],
  },
  stressed: {
    music: ['Calming breathing exercises', 'Tension-release patterns', 'Grounding bass tones'],
    art: ['Structured mandalas', 'Soothing cool tones', 'Organized patterns'],
    poetry: ['Release', 'Let go', 'Find peace', 'Rest now'],
  },
  peaceful: {
    music: ['Nature sounds with flute', 'Gentle harp melodies', 'Meditative chimes'],
    art: ['Tranquil greens and blues', 'Flowing water scenes', 'Zen gardens'],
    poetry: ['Flowing stream', 'Quiet dawn', 'Gentle breeze', 'Perfect stillness'],
  },
  angry: {
    music: ['Heavy percussion release', 'Powerful rock chords', 'Intense rhythm'],
    art: ['Bold red strokes', 'Explosive abstracts', 'Powerful contrasts'],
    poetry: ['Fire within', 'Thunder', 'Breaking free', 'Raw power'],
  },
  confused: {
    music: ['Questioning melodies', 'Searching harmonies', 'Wandering chords'],
    art: ['Abstract patterns', 'Puzzle pieces', 'Swirling colors'],
    poetry: ['Which way', 'Lost path', 'Seeking clarity', 'Questions'],
  },
  excited: {
    music: ['Fast-paced dance beats', 'Explosive build-ups', 'Triumphant crescendos'],
    art: ['Vibrant pinks and purples', 'Bursting stars', 'Dynamic movement'],
    poetry: ['Can\'t wait', 'Thrilling', 'Heart racing', 'Electric'],
  },
  melancholic: {
    music: ['Bittersweet piano', 'Nostalgic strings', 'Wistful melodies'],
    art: ['Muted purples and grays', 'Fading memories', 'Distant horizons'],
    poetry: ['Yesterday', 'Fading echoes', 'Wistful dreams', 'Silent longing'],
  },
  confident: {
    music: ['Bold brass fanfares', 'Powerful progressions', 'Triumphant themes'],
    art: ['Strong cyan tones', 'Bold geometric shapes', 'Commanding compositions'],
    poetry: ['I can', 'Unshakeable', 'Strong stride', 'Ready'],
  },
  blissful: {
    music: ['Ethereal synths', 'Heavenly choir', 'Floating melodies'],
    art: ['Dreamy purples and whites', 'Glowing auras', 'Transcendent visions'],
    poetry: ['Euphoria', 'Floating', 'Pure bliss', 'Heaven'],
  },
  lonely: {
    music: ['Solo acoustic', 'Echoing notes', 'Empty spaces'],
    art: ['Solitary figures', 'Empty rooms', 'Distant lights'],
    poetry: ['Alone', 'Empty chair', 'Silent phone', 'Waiting'],
  },
  hopeful: {
    music: ['Uplifting progressions', 'Ascending melodies', 'Bright harmonies'],
    art: ['Fresh greens and teals', 'Sunrise scenes', 'Opening doors'],
    poetry: ['Tomorrow', 'New dawn', 'Rising sun', 'Possibility'],
  },
  overwhelmed: {
    music: ['Calming mantras', 'Simplifying rhythms', 'Slowing tempo'],
    art: ['Decluttering visuals', 'Simple shapes', 'Breathing space'],
    poetry: ['Step by step', 'One thing', 'Breathe', 'Simplify'],
  },
};

export default function CreativeCanvas() {
  const { mood } = useMood();
  const [activeMode, setActiveMode] = useState<'music' | 'art' | 'poetry'>('art');
  const [userInput, setUserInput] = useState('');
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({
    music: [],
    art: [],
    poetry: []
  });
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const currentMood = mood || 'calm';
  const fallbackSuggestions = moodSuggestions[currentMood];
  const colorPalette = moodColorPalettes[currentMood];

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setUserInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
        setTranscript(interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          console.log('No speech detected');
        } else if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access to use speech-to-text.');
        }
      };

      recognition.onend = () => {
        if (isRecording) {
          setIsRecording(false);
          setTranscript('');
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  useEffect(() => {
    fetchSuggestions(activeMode);
  }, [activeMode, currentMood]);

  const fetchSuggestions = async (mode: 'music' | 'art' | 'poetry') => {
    setLoadingSuggestions(true);
    try {
      const response = await fetch('/api/creative-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: currentMood, mode })
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(prev => ({ ...prev, [mode]: data.suggestions }));
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const regenerateSuggestion = () => {
    fetchSuggestions(activeMode);
  };

  const startVoiceRecording = async () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      recognitionRef.current.start();
      setIsRecording(true);
      setTranscript('');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      alert('Failed to start speech recognition. Please try again.');
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setTranscript('');
    }
  };

  const selectColor = (color: { name: string; hex: string; rgb: string }) => {
    setSelectedColor(color.hex);
    const colorText = `Color: ${color.name} (${color.hex})`;
    setUserInput(userInput + (userInput ? '\n' : '') + colorText);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 mood-transition">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header with gradient */}
        <div className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary capitalize">Current Mood: {currentMood}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Creative Canvas
          </h1>
          <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
            Let your emotions guide your creativity. Co-create art, music, and poetry with AI.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card data-testid="card-creation-workspace">
              <CardHeader>
                <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as typeof activeMode)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="music" className="gap-2" data-testid="tab-music-mode">
                      <Music className="w-4 h-4" />
                      Music
                    </TabsTrigger>
                    <TabsTrigger value="art" className="gap-2" data-testid="tab-art-mode">
                      <Palette className="w-4 h-4" />
                      Art
                    </TabsTrigger>
                    <TabsTrigger value="poetry" className="gap-2" data-testid="tab-poetry-mode">
                      <FileText className="w-4 h-4" />
                      Poetry
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeMode === 'art' && (
                  <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-white/50 to-white/30 dark:from-white/5 dark:to-white/10 border border-white/20 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-primary" />
                        <p className="text-base font-bold">Mood Color Palette</p>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {currentMood}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-6 gap-4 mb-4">
                      {colorPalette.map((color, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-3">
                          <button
                            onClick={() => selectColor(color)}
                            className={`group relative aspect-square w-full rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95 ${
                              selectedColor === color.hex ? 'ring-4 ring-primary ring-offset-4 ring-offset-background scale-105' : 'hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 hover:ring-offset-background'
                            }`}
                            style={{ backgroundColor: color.hex }}
                            data-testid={`color-${idx}`}
                            title={color.name}
                          >
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                          <span className="text-xs font-medium text-center opacity-70 group-hover:opacity-100 transition-opacity">
                            {color.name}
                          </span>
                        </div>
                      ))}
                    </div>
                    {selectedColor && (
                      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-purple-950/30 border border-purple-200/50 dark:border-purple-800/50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg shadow-lg" style={{ backgroundColor: selectedColor }} />
                          <p className="text-sm font-semibold">
                            Selected Color: <span style={{ color: selectedColor }}>{selectedColor}</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="space-y-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={isRecording ? 'destructive' : 'outline'}
                      onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                      className="gap-2"
                      data-testid="button-voice-recording"
                    >
                      {isRecording ? (
                        <>
                          <Square className="w-4 h-4" />
                          Stop Dictation
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4" />
                          Start Dictation
                        </>
                      )}
                    </Button>
                    {isRecording && (
                      <Badge variant="destructive" className="animate-pulse">
                        Listening...
                      </Badge>
                    )}
                  </div>
                  {transcript && (
                    <div className="p-2 rounded-md bg-primary/10 border border-primary/20">
                      <p className="text-sm text-muted-foreground italic">
                        {transcript}
                      </p>
                    </div>
                  )}
                </div>

                <Textarea
                  placeholder={`Start creating your ${activeMode}...`}
                  className="min-h-[400px] text-base resize-none"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  data-testid="textarea-creative-input"
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:sticky lg:top-6">
            <Card className="relative overflow-hidden border-2 border-primary/20 shadow-xl" data-testid="card-ai-companion">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                    <AvatarFallback className="bg-transparent">
                      <Sparkles className="w-6 h-6 text-white animate-pulse" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      AI Muse
                    </CardTitle>
                    <CardDescription className="text-sm">Your creative companion</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-foreground">Mood-based suggestions</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={regenerateSuggestion}
                      className="gap-2 h-9 hover:scale-105 transition-transform"
                      data-testid="button-regenerate"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {(suggestions[activeMode].length > 0 ? suggestions[activeMode] : fallbackSuggestions[activeMode]).map((suggestion, idx) => (
                      <Card
                        key={idx}
                        className="p-4 hover-elevate active-elevate-2 cursor-pointer border border-primary/10 transition-all duration-200 hover:border-primary/30 hover:shadow-lg"
                        onClick={() => {
                          setUserInput(userInput + (userInput ? '\n' : '') + suggestion);
                          console.log('Applied suggestion:', suggestion);
                        }}
                        data-testid={`suggestion-${idx}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <p className="text-sm leading-relaxed">{suggestion}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm font-semibold mb-3 text-muted-foreground">Mood context</p>
                  <Badge variant="outline" className="capitalize text-base px-4 py-2" data-testid="badge-mood-context">
                    {currentMood}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

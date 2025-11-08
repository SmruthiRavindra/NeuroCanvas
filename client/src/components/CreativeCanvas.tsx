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
};

const moodSuggestions = {
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const currentMood = mood || 'calm';
  const fallbackSuggestions = moodSuggestions[currentMood];
  const colorPalette = moodColorPalettes[currentMood];

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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        // Here you could send the audio to a speech-to-text API
        console.log('Voice recording completed', audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to use voice recording');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const selectColor = (color: { name: string; hex: string; rgb: string }) => {
    setSelectedColor(color.hex);
    const colorText = `Color: ${color.name} (${color.hex})`;
    setUserInput(userInput + (userInput ? '\n' : '') + colorText);
  };

  return (
    <div className="min-h-screen bg-background mood-transition">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">Creative Canvas</h1>
          <p className="text-muted-foreground">
            Co-create with AI based on your current mood: <span className="text-primary font-medium capitalize">{currentMood}</span>
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
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold">Color Palette</p>
                      <Badge variant="outline" className="text-xs">
                        Mood: {currentMood}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-6 gap-3">
                      {colorPalette.map((color, idx) => (
                        <button
                          key={idx}
                          onClick={() => selectColor(color)}
                          className={`group relative aspect-square rounded-full transition-all hover:scale-110 active:scale-95 ${
                            selectedColor === color.hex ? 'ring-4 ring-primary ring-offset-2' : 'hover:ring-2 hover:ring-primary/50'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          data-testid={`color-${idx}`}
                          title={color.name}
                        >
                          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {color.name}
                          </span>
                        </button>
                      ))}
                    </div>
                    {selectedColor && (
                      <div className="mt-6 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                        <p className="text-sm font-medium">
                          Selected: <span style={{ color: selectedColor }}>{selectedColor}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-2 mb-2">
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
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        Voice Input
                      </>
                    )}
                  </Button>
                  {isRecording && (
                    <Badge variant="destructive" className="animate-pulse">
                      Recording...
                    </Badge>
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

          <div className="space-y-6">
            <Card data-testid="card-ai-companion">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 bg-primary/10">
                    <AvatarFallback>
                      <Sparkles className="w-5 h-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">AI Muse</CardTitle>
                    <CardDescription className="text-xs">Your creative companion</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">Mood-based suggestions</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={regenerateSuggestion}
                      className="gap-1 h-8"
                      data-testid="button-regenerate"
                    >
                      <RefreshCw className="w-3 h-3" />
                      New
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(suggestions[activeMode].length > 0 ? suggestions[activeMode] : fallbackSuggestions[activeMode]).map((suggestion, idx) => (
                      <Card
                        key={idx}
                        className="p-3 hover-elevate cursor-pointer"
                        onClick={() => {
                          setUserInput(userInput + (userInput ? '\n' : '') + suggestion);
                          console.log('Applied suggestion:', suggestion);
                        }}
                        data-testid={`suggestion-${idx}`}
                      >
                        <p className="text-sm">{suggestion}</p>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Mood context</p>
                  <Badge variant="outline" className="capitalize" data-testid="badge-mood-context">
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

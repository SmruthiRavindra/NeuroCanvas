import { useState } from 'react';
import { Music, Palette, FileText, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useMood } from '@/contexts/MoodContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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

  const currentMood = mood || 'calm';
  const suggestions = moodSuggestions[currentMood];

  const regenerateSuggestion = () => {
    console.log('Regenerating AI suggestion for', activeMode);
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
              <CardContent>
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
                    {suggestions[activeMode].map((suggestion, idx) => (
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

import { useState } from 'react';
import { Palette, Music, BookOpen, Camera, Dumbbell, TreePine, Home, Sparkles, Send, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMood } from '@/contexts/MoodContext';
import paintingImg from '@assets/generated_images/Energetic_painting_hobby_activity_e5b3d9d4.png';
import journalingImg from '@assets/generated_images/Peaceful_journaling_activity_fc864e4e.png';
import musicImg from '@assets/generated_images/Music_creation_hobby_activity_3bc76712.png';

interface Hobby {
  id: string;
  name: string;
  description: string;
  category: 'indoor' | 'outdoor';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: typeof Palette;
  recommendedFor: string[];
  image?: string;
  aiDescription: string;
  youtubeVideos: Array<{
    title: string;
    url: string;
    description: string;
  }>;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const hobbies: Hobby[] = [
  {
    id: '1',
    name: 'Watercolor Painting',
    description: 'Express emotions through flowing colors and gentle brush strokes',
    category: 'indoor',
    difficulty: 'beginner',
    icon: Palette,
    recommendedFor: ['calm', 'sad'],
    image: paintingImg,
    aiDescription: 'Watercolor painting is a therapeutic art form that allows you to express emotions through the fluid movement of colors. Perfect for beginners, it requires minimal materials: watercolor paints, brushes, and paper. The unpredictable nature of watercolors teaches you to embrace imperfection and find beauty in spontaneity. Start with simple washes and gradually build up to more complex techniques.',
    youtubeVideos: [
      {
        title: 'Watercolor Painting for Absolute Beginners',
        url: 'https://www.youtube.com/watch?v=VW0eN_O_5hE',
        description: 'Complete beginner guide covering basic techniques and materials'
      },
      {
        title: 'Relaxing Watercolor Tutorial - Easy Landscapes',
        url: 'https://www.youtube.com/watch?v=EeZXClpyu8Y',
        description: 'Step-by-step calming landscape painting tutorial'
      },
      {
        title: 'Emotional Expression Through Watercolors',
        url: 'https://www.youtube.com/watch?v=0IbGd58GDoc',
        description: 'Learn to paint your feelings with abstract watercolor techniques'
      }
    ]
  },
  {
    id: '2',
    name: 'Music Composition',
    description: 'Create melodies that capture your emotional state',
    category: 'indoor',
    difficulty: 'intermediate',
    icon: Music,
    recommendedFor: ['energetic', 'calm'],
    image: musicImg,
    aiDescription: 'Music composition is the art of creating original melodies and harmonies that reflect your inner emotional landscape. You don\'t need formal training to start - many composers begin by humming melodies and using free digital audio workstations (DAWs) like GarageBand or Audacity. Start with simple chord progressions and let your emotions guide the melody.',
    youtubeVideos: [
      {
        title: 'How to Start Composing Music - No Experience Needed',
        url: 'https://www.youtube.com/watch?v=rgaTLrZGlk0',
        description: 'Beginner-friendly introduction to music composition basics'
      },
      {
        title: 'Creating Emotional Music - Chord Progressions',
        url: 'https://www.youtube.com/watch?v=M8eItITv8QA',
        description: 'Learn how to write music that evokes specific emotions'
      },
      {
        title: 'GarageBand Tutorial for Beginners',
        url: 'https://www.youtube.com/watch?v=9bJg5USpos4',
        description: 'Complete guide to making music with free software'
      }
    ]
  },
  {
    id: '3',
    name: 'Mindful Journaling',
    description: 'Process thoughts and feelings through reflective writing',
    category: 'indoor',
    difficulty: 'beginner',
    icon: BookOpen,
    recommendedFor: ['anxious', 'sad', 'calm'],
    image: journalingImg,
    aiDescription: 'Mindful journaling is a powerful practice for emotional processing and self-discovery. Unlike traditional diary writing, mindful journaling focuses on present-moment awareness and emotional exploration. You can use prompts like "What am I feeling right now?" or "What brought me joy today?" to guide your practice. It requires nothing more than a notebook and pen.',
    youtubeVideos: [
      {
        title: 'How to Start a Mindful Journal Practice',
        url: 'https://www.youtube.com/watch?v=L1LZ4PBEyHw',
        description: 'Complete guide to beginning your journaling journey'
      },
      {
        title: 'Journaling for Anxiety and Stress Relief',
        url: 'https://www.youtube.com/watch?v=dargucQfaDc',
        description: 'Specific techniques for managing difficult emotions'
      },
      {
        title: 'Creative Journaling Ideas',
        url: 'https://www.youtube.com/watch?v=SdU7hTgYdgI',
        description: 'Inspiring prompts and layouts for expressive journaling'
      }
    ]
  },
  {
    id: '4',
    name: 'Nature Photography',
    description: 'Capture beauty and find grounding in the outdoors',
    category: 'outdoor',
    difficulty: 'beginner',
    icon: Camera,
    recommendedFor: ['calm', 'anxious'],
    aiDescription: 'Nature photography combines the therapeutic benefits of outdoor time with creative expression. You can start with just a smartphone camera - no expensive equipment needed. This hobby encourages you to slow down, observe details, and connect with the natural world. Focus on capturing light, patterns, and moments that resonate with your emotional state.',
    youtubeVideos: [
      {
        title: 'Nature Photography for Beginners',
        url: 'https://www.youtube.com/watch?v=LxXp3ZVb42c',
        description: 'Essential tips for capturing stunning nature photos'
      },
      {
        title: 'Smartphone Photography - Pro Tips',
        url: 'https://www.youtube.com/watch?v=V_hge_nefb0',
        description: 'Get professional results with your phone camera'
      },
      {
        title: 'Finding Peace Through Photography',
        url: 'https://www.youtube.com/watch?v=Ju5LZQOWqHM',
        description: 'How photography can support mental wellness'
      }
    ]
  },
  {
    id: '5',
    name: 'Dance Movement',
    description: 'Release energy and express yourself through movement',
    category: 'indoor',
    difficulty: 'beginner',
    icon: Dumbbell,
    recommendedFor: ['energetic', 'anxious'],
    aiDescription: 'Dance movement therapy uses the body\'s natural desire to move as a way to express and process emotions. You don\'t need formal training or a dance studio - just space to move freely. Start with intuitive movement, letting your body respond to music. This practice is especially effective for releasing pent-up energy and reducing anxiety.',
    youtubeVideos: [
      {
        title: 'Dance for Emotional Release - Beginner Friendly',
        url: 'https://www.youtube.com/watch?v=4XfN3up21Ig',
        description: 'Guided movement session for emotional expression'
      },
      {
        title: 'Intuitive Dance Practice at Home',
        url: 'https://www.youtube.com/watch?v=fHWzlgQdCo8',
        description: 'Learn to move freely without judgment'
      },
      {
        title: 'Dance Therapy for Anxiety Relief',
        url: 'https://www.youtube.com/watch?v=b1cVg3tBz9k',
        description: 'Specific movements to calm the nervous system'
      }
    ]
  },
  {
    id: '6',
    name: 'Forest Bathing',
    description: 'Immerse yourself in nature for calming mindfulness',
    category: 'outdoor',
    difficulty: 'beginner',
    icon: TreePine,
    recommendedFor: ['calm', 'anxious', 'sad'],
    aiDescription: 'Forest bathing (Shinrin-yoku) is a Japanese practice of mindful nature immersion. Unlike hiking, it\'s about slow, intentional presence in a forest environment. Research shows it reduces stress hormones, lowers blood pressure, and improves mood. Simply find a natural area and spend 20-30 minutes walking slowly, engaging all your senses.',
    youtubeVideos: [
      {
        title: 'What is Forest Bathing? Complete Guide',
        url: 'https://www.youtube.com/watch?v=Z8sM0hqvwLg',
        description: 'Introduction to the practice and its benefits'
      },
      {
        title: 'Guided Forest Bathing Experience',
        url: 'https://www.youtube.com/watch?v=YCJZJKlOHCM',
        description: 'Virtual forest bathing meditation'
      },
      {
        title: 'Forest Therapy for Mental Health',
        url: 'https://www.youtube.com/watch?v=qGEyYYQgJwk',
        description: 'Science-backed benefits of nature immersion'
      }
    ]
  },
];

export default function DiscoverHobbies() {
  const { mood } = useMood();
  const [filter, setFilter] = useState<'all' | 'indoor' | 'outdoor'>('all');
  const [selectedHobby, setSelectedHobby] = useState<Hobby | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  
  const currentMood = mood || 'calm';

  const openHobbyDialog = (hobby: Hobby) => {
    setSelectedHobby(hobby);
    setChatMessages([
      {
        role: 'assistant',
        content: `Hi! I'm here to help you explore ${hobby.name}. ${hobby.aiDescription}\n\nI've also found some helpful YouTube tutorials for you below. Feel free to ask me any questions about getting started!`
      }
    ]);
    setUserInput('');
  };

  const sendMessage = async () => {
    if (!userInput.trim() || !selectedHobby) return;

    const newUserMessage: ChatMessage = { role: 'user', content: userInput };
    setChatMessages(prev => [...prev, newUserMessage]);
    setUserInput('');

    try {
      const response = await fetch('/api/hobby-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hobbyName: selectedHobby.name,
          question: userInput,
          mood: currentMood
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: ChatMessage = { role: 'assistant', content: data.response };
        setChatMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Error in hobby chat:', error);
      const aiMessage: ChatMessage = { 
        role: 'assistant', 
        content: `That's a great question about ${selectedHobby.name}! I'd recommend checking out the YouTube tutorials I've shared - they cover most beginner questions in detail.`
      };
      setChatMessages(prev => [...prev, aiMessage]);
    }
  };
  
  const filteredHobbies = hobbies.filter((hobby) => {
    const matchesFilter = filter === 'all' || hobby.category === filter;
    return matchesFilter;
  });

  const recommendedHobbies = filteredHobbies.filter((hobby) =>
    hobby.recommendedFor.includes(currentMood)
  );

  const otherHobbies = filteredHobbies.filter(
    (hobby) => !hobby.recommendedFor.includes(currentMood)
  );

  return (
    <div className="min-h-screen bg-background mood-transition">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">Try New with AI</h1>
          <p className="text-muted-foreground">
            Discover new creative activities tailored to your mood
          </p>
        </div>

        <div className="mb-8">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList>
              <TabsTrigger value="all" className="gap-2" data-testid="filter-all">
                All Activities
              </TabsTrigger>
              <TabsTrigger value="indoor" className="gap-2" data-testid="filter-indoor">
                <Home className="w-4 h-4" />
                Indoor
              </TabsTrigger>
              <TabsTrigger value="outdoor" className="gap-2" data-testid="filter-outdoor">
                <TreePine className="w-4 h-4" />
                Outdoor
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {recommendedHobbies.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-display font-semibold">
                Recommended for your mood
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedHobbies.map((hobby) => {
                const Icon = hobby.icon;
                return (
                  <Card
                    key={hobby.id}
                    className="hover-elevate overflow-hidden"
                    data-testid={`card-hobby-${hobby.id}`}
                  >
                    {hobby.image && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={hobby.image}
                          alt={hobby.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{hobby.name}</CardTitle>
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="capitalize text-xs">
                              {hobby.difficulty}
                            </Badge>
                            <Badge variant="outline" className="capitalize text-xs">
                              {hobby.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">{hobby.description}</CardDescription>
                      <Button
                        className="w-full gap-2"
                        onClick={() => openHobbyDialog(hobby)}
                        data-testid={`button-try-${hobby.id}`}
                      >
                        <Sparkles className="w-4 h-4" />
                        Try with AI
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {otherHobbies.length > 0 && (
          <div>
            <h2 className="text-2xl font-display font-semibold mb-6">Explore More</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherHobbies.map((hobby) => {
                const Icon = hobby.icon;
                return (
                  <Card
                    key={hobby.id}
                    className="hover-elevate"
                    data-testid={`card-hobby-${hobby.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{hobby.name}</CardTitle>
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="capitalize text-xs">
                              {hobby.difficulty}
                            </Badge>
                            <Badge variant="outline" className="capitalize text-xs">
                              {hobby.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">{hobby.description}</CardDescription>
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => openHobbyDialog(hobby)}
                        data-testid={`button-try-${hobby.id}`}
                      >
                        Try with AI
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        <Dialog open={!!selectedHobby} onOpenChange={() => setSelectedHobby(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col" data-testid="dialog-hobby-assistant">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-3">
                {selectedHobby && (
                  <>
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                      <selectedHobby.icon className="w-5 h-5 text-primary" />
                    </div>
                    {selectedHobby.name}
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                Your AI guide to getting started with this hobby
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {chatMessages.map((message, idx) => (
                    <div
                      key={idx}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                        data-testid={`message-${idx}`}
                      >
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                      </div>
                    </div>
                  ))}

                  {selectedHobby && chatMessages.length > 0 && (
                    <div className="pt-4 border-t">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-primary" />
                        Recommended YouTube Tutorials
                      </h3>
                      <div className="space-y-3">
                        {selectedHobby.youtubeVideos.map((video, idx) => (
                          <a
                            key={idx}
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 rounded-md bg-accent/50 hover-elevate"
                            data-testid={`video-link-${idx}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                                <ExternalLink className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm mb-1">{video.title}</p>
                                <p className="text-xs text-muted-foreground">{video.description}</p>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="flex gap-2 pt-2 border-t">
                <Input
                  placeholder="Ask me anything about this hobby..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  data-testid="input-chat-message"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!userInput.trim()}
                  className="gap-2"
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

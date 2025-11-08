import { useState } from 'react';
import { Palette, Music, BookOpen, Camera, Dumbbell, TreePine, Home, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  },
  {
    id: '4',
    name: 'Nature Photography',
    description: 'Capture beauty and find grounding in the outdoors',
    category: 'outdoor',
    difficulty: 'beginner',
    icon: Camera,
    recommendedFor: ['calm', 'anxious'],
  },
  {
    id: '5',
    name: 'Dance Movement',
    description: 'Release energy and express yourself through movement',
    category: 'indoor',
    difficulty: 'beginner',
    icon: Dumbbell,
    recommendedFor: ['energetic', 'anxious'],
  },
  {
    id: '6',
    name: 'Forest Bathing',
    description: 'Immerse yourself in nature for calming mindfulness',
    category: 'outdoor',
    difficulty: 'beginner',
    icon: TreePine,
    recommendedFor: ['calm', 'anxious', 'sad'],
  },
];

export default function DiscoverHobbies() {
  const { mood } = useMood();
  const [filter, setFilter] = useState<'all' | 'indoor' | 'outdoor'>('all');
  
  const currentMood = mood || 'calm';
  
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
          <h1 className="text-4xl font-display font-bold mb-2">Discover Hobbies</h1>
          <p className="text-muted-foreground">
            Try new creative activities tailored to your mood
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
                        onClick={() => console.log('Try hobby with AI:', hobby.name)}
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
                        onClick={() => console.log('Try hobby with AI:', hobby.name)}
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
      </div>
    </div>
  );
}

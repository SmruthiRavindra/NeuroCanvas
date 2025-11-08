import { Heart, MessageCircle, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CommunityPost {
  id: string;
  author: string;
  mood: string;
  type: 'art' | 'music' | 'poetry';
  content: string;
  likes: number;
  comments: number;
  timestamp: string;
}

const mockPosts: CommunityPost[] = [
  {
    id: '1',
    author: 'Sarah Chen',
    mood: 'calm',
    type: 'poetry',
    content: 'Whispers of dawn break through my window, painting dreams in shades of gold...',
    likes: 24,
    comments: 5,
    timestamp: '2h ago',
  },
  {
    id: '2',
    author: 'Marcus Rey',
    mood: 'energetic',
    type: 'music',
    content: '🎵 Just composed an upbeat track inspired by the city lights',
    likes: 42,
    comments: 12,
    timestamp: '4h ago',
  },
  {
    id: '3',
    author: 'Aisha Kumar',
    mood: 'calm',
    type: 'art',
    content: 'Watercolor study of ocean waves - finding peace in the blues',
    likes: 67,
    comments: 18,
    timestamp: '1d ago',
  },
  {
    id: '4',
    author: 'Jordan Lee',
    mood: 'anxious',
    type: 'poetry',
    content: 'In the chaos, I seek stillness. In the noise, I find my voice.',
    likes: 31,
    comments: 8,
    timestamp: '1d ago',
  },
  {
    id: '5',
    author: 'Elena Santos',
    mood: 'energetic',
    type: 'art',
    content: 'Bold abstract expressionism - letting the colors dance freely',
    likes: 55,
    comments: 14,
    timestamp: '2d ago',
  },
  {
    id: '6',
    author: 'Dev Patel',
    mood: 'calm',
    type: 'music',
    content: 'Ambient soundscape inspired by rain and quiet mornings',
    likes: 38,
    comments: 9,
    timestamp: '3d ago',
  },
];

export default function Community() {
  return (
    <div className="min-h-screen bg-background mood-transition">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">Community</h1>
          <p className="text-muted-foreground">Share your creative work and connect with others</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPosts.map((post) => (
            <Card key={post.id} className="hover-elevate" data-testid={`card-post-${post.id}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{post.author}</p>
                    <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex gap-2 mb-3">
                    <Badge variant="outline" className="capitalize text-xs" data-testid={`badge-mood-${post.id}`}>
                      {post.mood}
                    </Badge>
                    <Badge variant="secondary" className="capitalize text-xs" data-testid={`badge-type-${post.id}`}>
                      {post.type}
                    </Badge>
                  </div>
                  <p className="text-sm leading-relaxed">{post.content}</p>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 hover-elevate"
                    onClick={() => console.log('Liked post', post.id)}
                    data-testid={`button-like-${post.id}`}
                  >
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{post.likes}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 hover-elevate"
                    onClick={() => console.log('Comment on post', post.id)}
                    data-testid={`button-comment-${post.id}`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{post.comments}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

import { Link, useLocation } from 'wouter';
import { Palette, BookOpen, BarChart3, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useMood } from '@/contexts/MoodContext';
import logoUrl from '@assets/generated_images/NeuroCanvas_emotional_AI_logo_894759fb.png';

const navItems = [
  { path: '/canvas', label: 'Creative Canvas', icon: Palette },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/overview', label: 'Weekly Mood', icon: BarChart3 },
  { path: '/discover', label: 'Discover Hobbies', icon: Lightbulb },
];

export default function Navbar() {
  const [location] = useLocation();
  const { mood } = useMood();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-r from-background/90 via-background/95 to-background/90 border-b border-border/50 shadow-lg mood-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover-elevate active-elevate-2 px-4 py-2 rounded-xl transition-all group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg blur-md opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative">
                  <img 
                    src={logoUrl} 
                    alt="NeuroCanvas Logo" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
              </div>
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                NeuroCanvas
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="default"
                      className={`gap-2 transition-all ${
                        isActive 
                          ? 'shadow-md' 
                          : ''
                      }`}
                      data-testid={`nav-link-${item.path.slice(1)}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-4">
              {mood && (
                <Badge 
                  variant="outline" 
                  className="gap-2 px-3 py-1.5 text-sm font-semibold capitalize border-primary/30 bg-primary/5"
                  data-testid="badge-current-mood"
                >
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
                  {mood}
                </Badge>
              )}
              <Avatar className="w-10 h-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all cursor-pointer" data-testid="avatar-user">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                  U
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

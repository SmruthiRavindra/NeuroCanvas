import { Link, useLocation } from 'wouter';
import { Palette, BookOpen, BarChart3, Users, Lightbulb, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useMood } from '@/contexts/MoodContext';

const navItems = [
  { path: '/canvas', label: 'Creative Canvas', icon: Palette },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/overview', label: 'Weekly Mood', icon: BarChart3 },
  { path: '/community', label: 'Community', icon: Users },
  { path: '/discover', label: 'Discover Hobbies', icon: Lightbulb },
];

export default function Navbar() {
  const [location] = useLocation();
  const { mood } = useMood();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b mood-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2 hover-elevate px-3 py-2 rounded-md">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-xl font-display font-bold">NeuroCanvas</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className="gap-2"
                    data-testid={`nav-link-${item.path.slice(1)}`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {mood && (
              <Badge variant="outline" className="gap-1" data-testid="badge-current-mood">
                <div className="w-2 h-2 rounded-full bg-primary" />
                {mood}
              </Badge>
            )}
            <Avatar className="w-9 h-9" data-testid="avatar-user">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </nav>
  );
}

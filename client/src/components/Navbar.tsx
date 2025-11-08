import { Link, useLocation } from 'wouter';
import { Palette, BookOpen, BarChart3, Lightbulb, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMood } from '@/contexts/MoodContext';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { path: '/canvas', label: 'Creative Canvas', icon: Palette },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/overview', label: 'Weekly Mood', icon: BarChart3 },
  { path: '/discover', label: 'Discover Hobbies', icon: Lightbulb },
];

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const { mood } = useMood();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-r from-background/90 via-background/95 to-background/90 border-b border-border/50 shadow-lg mood-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="hover-elevate active-elevate-2 px-4 py-2 rounded-xl transition-all">
              <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                NeuroCanvas
              </h1>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="w-10 h-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all cursor-pointer" data-testid="avatar-user">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold">{user?.username}</span>
                      <span className="text-xs text-muted-foreground">Manage your account</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" data-testid="menu-item-profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive focus:text-destructive" 
                    onClick={handleLogout}
                    data-testid="button-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

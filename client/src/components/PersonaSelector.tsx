import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Music2, Sparkles } from 'lucide-react';
import type { VoicePersona } from '@shared/schema';

interface PersonaSelectorProps {
  selectedPersonaId?: string;
  onSelectPersona?: (personaId: string) => void;
  compact?: boolean;
}

export default function PersonaSelector({ selectedPersonaId, onSelectPersona, compact = false }: PersonaSelectorProps) {
  const { data: personasData, isLoading } = useQuery<{ personas: VoicePersona[] }>({
    queryKey: ['/api/personas'],
  });

  const personas = personasData?.personas || [];

  if (isLoading || personas.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Music2 className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">AI Voices:</span>
        {personas.map((persona) => (
          <TooltipProvider key={persona.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelectPersona?.(persona.id)}
                  className={`relative group transition-all duration-200 ${
                    selectedPersonaId === persona.id ? 'scale-110' : 'hover:scale-105'
                  }`}
                  data-testid={`persona-${persona.id}`}
                >
                  <Avatar
                    className={`w-8 h-8 border-2 ${
                      selectedPersonaId === persona.id
                        ? 'border-primary shadow-lg'
                        : 'border-border hover-elevate'
                    }`}
                  >
                    <AvatarFallback
                      className="text-xs font-bold"
                      style={{ backgroundColor: `${persona.colorTheme}30`, color: persona.colorTheme }}
                    >
                      {persona.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {selectedPersonaId === persona.id && (
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                    </div>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-semibold">{persona.displayName}</p>
                  <p className="text-xs text-muted-foreground">{persona.description}</p>
                  <div className="flex gap-1 mt-1">
                    {persona.musicGenres.slice(0, 3).map((genre) => (
                      <Badge key={genre} variant="outline" className="text-xs px-1 py-0">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {personas.map((persona) => (
        <Card
          key={persona.id}
          className={`p-4 cursor-pointer transition-all duration-200 ${
            selectedPersonaId === persona.id
              ? 'border-primary border-2 shadow-lg bg-primary/5'
              : 'hover-elevate active-elevate-2 border'
          }`}
          onClick={() => onSelectPersona?.(persona.id)}
          data-testid={`persona-card-${persona.id}`}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <Avatar
              className="w-12 h-12"
              style={{ backgroundColor: `${persona.colorTheme}30` }}
            >
              <AvatarFallback
                className="text-lg font-bold"
                style={{ backgroundColor: `${persona.colorTheme}30`, color: persona.colorTheme }}
              >
                {persona.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{persona.displayName}</p>
              <Badge variant="outline" className="text-xs mt-1">
                {persona.gender}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {persona.description}
            </p>
            <div className="flex flex-wrap gap-1 justify-center mt-1">
              {persona.musicGenres.slice(0, 2).map((genre) => (
                <Badge key={genre} variant="secondary" className="text-xs px-1.5 py-0">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

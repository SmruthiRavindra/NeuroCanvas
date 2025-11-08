import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

export default function OnboardingPage() {
  const { updateUserStatus } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [personality, setPersonality] = useState("");
  const [interests, setInterests] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personality,
          interests,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save onboarding details');
      }

      updateUserStatus({ hasCompletedOnboarding: true });

      toast({
        title: "Welcome to NeuroCanvas!",
        description: "Your creative journey begins now",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background p-8 animate-fade-in">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-6 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20">
            <Sparkles className="w-10 h-10 text-primary animate-float" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-heading font-bold tracking-tight text-foreground">
              Tell Us About Yourself
            </h1>
            <p className="text-base font-body text-muted-foreground leading-relaxed px-4">
              Help us personalize your creative experience by sharing a bit about who you are
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="glass shadow-xl border-white/20 dark:border-white/10 animate-scale-blur delay-200">
          <CardContent className="pt-8 pb-8 px-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="personality" className="font-body text-sm font-medium">
                  Personality & Mood Style
                </Label>
                <Textarea
                  id="personality"
                  data-testid="input-personality"
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  rows={4}
                  placeholder="How would you describe yourself? Are you introverted or extroverted? What makes you happy?"
                  className="rounded-2xl font-body resize-none transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                />
                <p className="text-xs font-body text-muted-foreground leading-relaxed">
                  Example: "I'm an introverted creative who loves quiet mornings and deep conversations"
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="interests" className="font-body text-sm font-medium">
                  Creative Interests & Hobbies
                </Label>
                <Textarea
                  id="interests"
                  data-testid="input-interests"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  rows={4}
                  placeholder="What creative activities do you enjoy? Music, art, writing, poetry, photography?"
                  className="rounded-2xl font-body resize-none transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                />
                <p className="text-xs font-body text-muted-foreground leading-relaxed">
                  Example: "I love painting watercolors, writing poetry, and playing guitar"
                </p>
              </div>

              <Button
                type="submit"
                className="w-full rounded-2xl mood-glow-hover font-body font-semibold text-base h-12"
                disabled={isLoading}
                data-testid="button-onboarding-submit"
              >
                {isLoading ? "Saving..." : "Start Creating"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Sparkles className="w-16 h-16 text-purple-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Tell Us About Yourself</CardTitle>
          <CardDescription className="text-base">
            Help us personalize your creative experience by sharing a bit about who you are
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="personality">Personality & Mood Style</Label>
              <Textarea
                id="personality"
                data-testid="input-personality"
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                rows={4}
                placeholder="How would you describe yourself? Are you introverted or extroverted? What makes you happy?"
              />
              <p className="text-xs text-muted-foreground">
                Example: "I'm an introverted creative who loves quiet mornings and deep conversations"
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Creative Interests & Hobbies</Label>
              <Textarea
                id="interests"
                data-testid="input-interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                rows={4}
                placeholder="What creative activities do you enjoy? Music, art, writing, poetry, photography?"
              />
              <p className="text-xs text-muted-foreground">
                Example: "I love painting watercolors, writing poetry, and playing guitar"
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-onboarding-submit"
            >
              {isLoading ? "Saving..." : "Start Creating"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

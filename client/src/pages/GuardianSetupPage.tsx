import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart } from "lucide-react";

export default function GuardianSetupPage() {
  const { updateUserStatus } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/guardian', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guardianName,
          guardianPhone,
          guardianRelationship,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save guardian details');
      }

      updateUserStatus({ hasCompletedGuardianSetup: true });

      toast({
        title: "Guardian set up!",
        description: "Your emotional support network is now active",
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
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-6 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20">
            <Heart className="w-10 h-10 text-primary animate-float" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-heading font-bold tracking-tight text-foreground">
              Guardian Details
            </h1>
            <p className="text-base font-body text-muted-foreground leading-relaxed px-4">
              Connect with someone who cares. If NeuroCanvas detects prolonged sadness, we'll send them a gentle alert to check in on you.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="glass shadow-xl border-white/20 dark:border-white/10 animate-scale-blur delay-200">
          <CardContent className="pt-8 pb-8 px-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="guardian-name" className="font-body text-sm font-medium">
                  Guardian Name *
                </Label>
                <Input
                  id="guardian-name"
                  data-testid="input-guardian-name"
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  required
                  placeholder="e.g., Mom, Best Friend, Therapist"
                  className="rounded-2xl font-body transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardian-phone" className="font-body text-sm font-medium">
                  Guardian Phone *
                </Label>
                <Input
                  id="guardian-phone"
                  data-testid="input-guardian-phone"
                  type="tel"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  required
                  minLength={10}
                  placeholder="+1234567890"
                  className="rounded-2xl font-body transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardian-relationship" className="font-body text-sm font-medium">
                  Relationship *
                </Label>
                <Input
                  id="guardian-relationship"
                  data-testid="input-guardian-relationship"
                  type="text"
                  value={guardianRelationship}
                  onChange={(e) => setGuardianRelationship(e.target.value)}
                  required
                  placeholder="e.g., Mother, Friend, Partner"
                  className="rounded-2xl font-body transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="p-6 glass rounded-2xl border border-primary/20">
                <p className="text-sm font-body text-muted-foreground leading-relaxed">
                  <strong className="text-foreground font-semibold">Example alert:</strong>
                  <br />
                  "Your {guardianRelationship || 'friend'} might need a bit of warmth today"
                </p>
              </div>

              <Button
                type="submit"
                className="w-full rounded-2xl mood-glow-hover font-body font-semibold text-base h-12"
                disabled={isLoading}
                data-testid="button-guardian-submit"
              >
                {isLoading ? "Saving..." : "Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Heart className="w-16 h-16 text-pink-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Guardian Details</CardTitle>
          <CardDescription className="text-base">
            Connect with someone who cares. If NeuroCanvas detects prolonged sadness, we'll send them a gentle alert to check in on you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guardian-name">Guardian Name *</Label>
              <Input
                id="guardian-name"
                data-testid="input-guardian-name"
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                required
                placeholder="e.g., Mom, Best Friend, Therapist"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardian-phone">Guardian Phone *</Label>
              <Input
                id="guardian-phone"
                data-testid="input-guardian-phone"
                type="tel"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                required
                minLength={10}
                placeholder="+1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardian-relationship">Relationship *</Label>
              <Input
                id="guardian-relationship"
                data-testid="input-guardian-relationship"
                type="text"
                value={guardianRelationship}
                onChange={(e) => setGuardianRelationship(e.target.value)}
                required
                placeholder="e.g., Mother, Friend, Partner"
              />
            </div>

            <div className="p-4 bg-pink-50 dark:bg-pink-950/20 rounded-lg border border-pink-200 dark:border-pink-800">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Example alert:</strong> "Your {guardianRelationship || 'friend'} might need a bit of warmth today 💛"
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-guardian-submit"
            >
              {isLoading ? "Saving..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

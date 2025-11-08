import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

export default function LoginRegisterPage() {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(loginUsername, loginPassword);
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(
        registerUsername,
        registerPassword,
        registerEmail || undefined,
        registerPhone || undefined
      );
    } catch (error: any) {
      toast({
        title: "Registration failed",
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
        {/* Logo and Welcome Message */}
        <div className="text-center space-y-6 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20">
            <Sparkles className="w-10 h-10 text-primary animate-float" />
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl font-heading font-bold tracking-tight text-foreground">
              NeuroCanvas
            </h1>
            <p className="text-lg font-body text-muted-foreground italic leading-relaxed px-4">
              "Your emotions have a story — let them create with you"
            </p>
          </div>
        </div>

        {/* Auth Card with Glassmorphism */}
        <Card className="glass shadow-xl border-white/20 dark:border-white/10 animate-scale-blur delay-200">
          <CardContent className="pt-8 pb-8 px-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-2xl">
                <TabsTrigger 
                  value="login" 
                  data-testid="tab-login"
                  className="rounded-xl font-body font-semibold"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  data-testid="tab-register"
                  className="rounded-xl font-body font-semibold"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-8">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="login-username" className="font-body text-sm font-medium">
                      Username
                    </Label>
                    <Input
                      id="login-username"
                      data-testid="input-login-username"
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      required
                      placeholder="Enter your username"
                      className="rounded-2xl font-body transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="font-body text-sm font-medium">
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      data-testid="input-login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="rounded-2xl font-body transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-2xl mood-glow-hover font-body font-semibold text-base h-12"
                    disabled={isLoading}
                    data-testid="button-login-submit"
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-8">
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="register-username" className="font-body text-sm font-medium">
                      Username *
                    </Label>
                    <Input
                      id="register-username"
                      data-testid="input-register-username"
                      type="text"
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      required
                      placeholder="Choose a username"
                      className="rounded-2xl font-body transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="font-body text-sm font-medium">
                      Password *
                    </Label>
                    <Input
                      id="register-password"
                      data-testid="input-register-password"
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="At least 6 characters"
                      className="rounded-2xl font-body transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="font-body text-sm font-medium">
                      Email (optional)
                    </Label>
                    <Input
                      id="register-email"
                      data-testid="input-register-email"
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="rounded-2xl font-body transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-phone" className="font-body text-sm font-medium">
                      Phone (optional)
                    </Label>
                    <Input
                      id="register-phone"
                      data-testid="input-register-phone"
                      type="tel"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      placeholder="+1234567890"
                      className="rounded-2xl font-body transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-2xl mood-glow-hover font-body font-semibold text-base h-12"
                    disabled={isLoading}
                    data-testid="button-register-submit"
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

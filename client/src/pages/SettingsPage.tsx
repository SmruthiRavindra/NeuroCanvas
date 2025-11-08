import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Key, AlertCircle, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ApiKey = {
  id: string;
  label: string | null;
  apiKey: string;
  isActive: boolean;
  createdAt: Date;
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [newApiKey, setNewApiKey] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ keys: ApiKey[] }>({
    queryKey: ["/api/api-keys"],
  });

  const addKeyMutation = useMutation({
    mutationFn: async () => {
      if (!newApiKey.trim()) {
        throw new Error("API key is required");
      }
      const res = await apiRequest("POST", "/api/api-keys", {
        apiKey: newApiKey.trim(),
        label: newLabel.trim() || null,
        isActive: true,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      setNewApiKey("");
      setNewLabel("");
      toast({
        title: "API Key Added",
        description: "Your Gemini API key has been successfully added.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add API key",
      });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const res = await apiRequest("DELETE", `/api/api-keys/${keyId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      setKeyToDelete(null);
      toast({
        title: "API Key Deleted",
        description: "The API key has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete API key",
      });
    },
  });

  const handleAddKey = () => {
    addKeyMutation.mutate();
  };

  const handleDeleteKey = (keyId: string) => {
    setKeyToDelete(keyId);
  };

  const confirmDelete = () => {
    if (keyToDelete) {
      deleteKeyMutation.mutate(keyToDelete);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-settings-title">Settings</h1>
          <p className="text-muted-foreground">
            Manage your Gemini API keys and application preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* API Keys Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Gemini API Keys
              </CardTitle>
              <CardDescription>
                Add multiple Gemini API keys to overcome the 50 requests/day quota limit. 
                The app will automatically rotate keys when one reaches its limit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Info Box */}
              <div className="bg-primary/5 border border-primary/20 rounded-md p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">How to get a Gemini API key:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Google AI Studio</a></li>
                    <li>Sign in with your Google account</li>
                    <li>Click "Get API Key" or "Create API Key"</li>
                    <li>Copy the key and paste it below</li>
                  </ol>
                </div>
              </div>

              {/* Add New Key Form */}
              <div className="space-y-4 border rounded-md p-4 bg-card">
                <h3 className="font-semibold flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add New API Key
                </h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <Input
                      id="api-key"
                      data-testid="input-api-key"
                      type="password"
                      placeholder="AIza..."
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                      disabled={addKeyMutation.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="label">Label (Optional)</Label>
                    <Input
                      id="label"
                      data-testid="input-api-key-label"
                      placeholder="e.g., Personal Account, Work Account"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      disabled={addKeyMutation.isPending}
                    />
                  </div>
                  <Button
                    data-testid="button-add-api-key"
                    onClick={handleAddKey}
                    disabled={!newApiKey.trim() || addKeyMutation.isPending}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {addKeyMutation.isPending ? "Adding..." : "Add API Key"}
                  </Button>
                </div>
              </div>

              {/* Existing Keys List */}
              <div className="space-y-3">
                <h3 className="font-semibold">Your API Keys</h3>
                
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading API keys...
                  </div>
                ) : !data?.keys || data.keys.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border rounded-md">
                    <Key className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No API keys added yet</p>
                    <p className="text-sm">Add your first key above to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data.keys.map((key, index) => (
                      <div
                        key={key.id}
                        data-testid={`card-api-key-${index}`}
                        className="border rounded-md p-4 flex items-center justify-between gap-4 hover-elevate"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {key.isActive && (
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            )}
                            <p className="font-medium truncate">
                              {key.label || `API Key ${index + 1}`}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">
                            {key.apiKey}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Added {new Date(key.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          data-testid={`button-delete-api-key-${index}`}
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteKey(key.id)}
                          disabled={deleteKeyMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!keyToDelete} onOpenChange={() => setKeyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this API key? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              data-testid="button-confirm-delete"
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

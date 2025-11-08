import { useState } from 'react';
import { Plus, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMood } from '@/contexts/MoodContext';
import { useToast } from '@/hooks/use-toast';

interface JournalEntry {
  id: string;
  userId: string | null;
  mood: string;
  content: string;
  createdAt: string;
}

export default function Journal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [newEntry, setNewEntry] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { mood } = useMood();
  const { toast } = useToast();

  const { data: entries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal-entries'],
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: { mood: string; content: string; userId?: string }) => {
      return await apiRequest('POST', '/api/journal-entries', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
      setNewEntry('');
      setIsDialogOpen(false);
      toast({
        title: 'Entry saved',
        description: 'Your journal entry has been saved successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save journal entry. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const filteredEntries = entries.filter(
    (entry) =>
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.mood.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const saveEntry = () => {
    if (!newEntry.trim()) {
      toast({
        title: 'Empty entry',
        description: 'Please write something before saving.',
        variant: 'destructive',
      });
      return;
    }
    createEntryMutation.mutate({
      mood: mood || 'calm',
      content: newEntry,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPreview = (content: string, maxLength: number = 60) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-background mood-transition">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">Journal</h1>
            <p className="text-muted-foreground">Reflect on your creative journey</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-new-entry">
                <Plus className="w-4 h-4" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-new-entry">
              <DialogHeader>
                <DialogTitle>New Journal Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="What's on your mind?"
                  className="min-h-[300px]"
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  data-testid="textarea-journal-entry"
                />
                <Button 
                  onClick={saveEntry} 
                  className="w-full" 
                  data-testid="button-save-entry"
                  disabled={createEntryMutation.isPending}
                >
                  {createEntryMutation.isPending ? 'Saving...' : 'Save Entry'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-entries"
            />
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading your journal entries...
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No entries match your search.' : 'No journal entries yet. Start writing!'}
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <Card key={entry.id} className="hover-elevate cursor-pointer" data-testid={`card-entry-${entry.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{formatDate(entry.createdAt)}</span>
                        <Badge variant="outline" className="capitalize" data-testid={`badge-mood-${entry.id}`}>
                          {entry.mood}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{getPreview(entry.content)}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Plus, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  content: string;
  preview: string;
}

const mockEntries: JournalEntry[] = [
  {
    id: '1',
    date: '2025-01-15',
    mood: 'calm',
    content: 'Today was peaceful. Spent the afternoon painting by the window.',
    preview: 'Today was peaceful. Spent the afternoon painting...',
  },
  {
    id: '2',
    date: '2025-01-14',
    mood: 'energetic',
    content: 'Feeling inspired! Started working on a new music composition.',
    preview: 'Feeling inspired! Started working on a new...',
  },
  {
    id: '3',
    date: '2025-01-13',
    mood: 'anxious',
    content: 'A bit overwhelmed today, but journaling helps ground me.',
    preview: 'A bit overwhelmed today, but journaling helps...',
  },
];

export default function Journal() {
  const [entries] = useState<JournalEntry[]>(mockEntries);
  const [searchQuery, setSearchQuery] = useState('');
  const [newEntry, setNewEntry] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredEntries = entries.filter(
    (entry) =>
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.mood.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const saveEntry = () => {
    console.log('Saving journal entry:', newEntry);
    setNewEntry('');
    setIsDialogOpen(false);
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
                <Button onClick={saveEntry} className="w-full" data-testid="button-save-entry">
                  Save Entry
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
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="hover-elevate cursor-pointer" data-testid={`card-entry-${entry.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{entry.date}</span>
                      <Badge variant="outline" className="capitalize" data-testid={`badge-mood-${entry.id}`}>
                        {entry.mood}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{entry.preview}</CardTitle>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

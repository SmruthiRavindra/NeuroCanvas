import { BarChart3, TrendingUp, Heart, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const moodData = [
  { mood: 'Calm', percentage: 45, color: 'bg-blue-500', icon: Heart },
  { mood: 'Energetic', percentage: 30, color: 'bg-orange-500', icon: Zap },
  { mood: 'Sad', percentage: 15, color: 'bg-gray-500', icon: TrendingUp },
  { mood: 'Anxious', percentage: 10, color: 'bg-amber-500', icon: BarChart3 },
];

const activities = [
  { name: 'Painting', count: 12, mood: 'calm' },
  { name: 'Music Creation', count: 8, mood: 'energetic' },
  { name: 'Poetry Writing', count: 15, mood: 'calm' },
  { name: 'Journaling', count: 20, mood: 'anxious' },
];

const insights = [
  'You create most when feeling calm and peaceful',
  'Poetry is your go-to outlet for expression',
  'Your creative sessions peak in the afternoon',
  'Journaling helps you process anxious moments',
];

export default function WeeklyMoodOverview() {
  return (
    <div className="min-h-screen bg-background mood-transition">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">Weekly Mood Overview</h1>
          <p className="text-muted-foreground">Track your emotional journey and creative patterns</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card data-testid="card-mood-distribution">
            <CardHeader>
              <CardTitle>Mood Distribution</CardTitle>
              <CardDescription>Your emotional landscape this week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {moodData.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.mood} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{item.mood}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" data-testid={`progress-${item.mood.toLowerCase()}`} />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card data-testid="card-creative-activities">
            <CardHeader>
              <CardTitle>Creative Activities</CardTitle>
              <CardDescription>What you've been creating</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.name}
                    className="flex items-center justify-between p-3 rounded-md bg-accent/50"
                    data-testid={`activity-${activity.name.toLowerCase().replace(' ', '-')}`}
                  >
                    <span className="font-medium">{activity.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{activity.count} sessions</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-ai-insights">
          <CardHeader>
            <CardTitle>AI-Generated Insights</CardTitle>
            <CardDescription>Patterns and observations about your creative journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {insights.map((insight, idx) => (
                <Card key={idx} className="p-4" data-testid={`insight-${idx}`}>
                  <p className="text-sm">{insight}</p>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

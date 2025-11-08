import { BarChart3, TrendingUp, Heart, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const moodData = [
  { mood: 'Calm', percentage: 45, value: 45, color: '#3B82F6', bgColor: 'bg-blue-500', icon: Heart },
  { mood: 'Energetic', percentage: 30, value: 30, color: '#F97316', bgColor: 'bg-orange-500', icon: Zap },
  { mood: 'Sad', percentage: 15, value: 15, color: '#8B5CF6', bgColor: 'bg-purple-500', icon: TrendingUp },
  { mood: 'Anxious', percentage: 10, value: 10, color: '#F59E0B', bgColor: 'bg-amber-500', icon: BarChart3 },
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
          <Card data-testid="card-mood-distribution" className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
            <CardHeader>
              <CardTitle className="text-2xl">Mood Distribution</CardTitle>
              <CardDescription>Your emotional landscape this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={moodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ mood, percentage }) => `${mood}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {moodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry: any) => {
                        const Icon = entry.payload.icon;
                        return (
                          <span className="inline-flex items-center gap-2">
                            {value}
                          </span>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-3">
                {moodData.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.mood} className="flex items-center justify-between p-3 rounded-lg hover-elevate" style={{ backgroundColor: `${item.color}15` }}>
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" style={{ color: item.color }} />
                        <span className="font-semibold">{item.mood}</span>
                      </div>
                      <span className="text-lg font-bold" style={{ color: item.color }}>{item.percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-creative-activities" className="bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-950/30 dark:to-pink-950/30">
            <CardHeader>
              <CardTitle className="text-2xl">Creative Activities</CardTitle>
              <CardDescription>What you've been creating</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.map((activity, idx) => {
                  const gradients = [
                    'from-pink-500 to-rose-500',
                    'from-orange-500 to-amber-500',
                    'from-blue-500 to-cyan-500',
                    'from-purple-500 to-fuchsia-500'
                  ];
                  return (
                    <div
                      key={activity.name}
                      className={`flex items-center justify-between p-4 rounded-lg bg-gradient-to-r ${gradients[idx]} text-white shadow-lg hover-elevate`}
                      data-testid={`activity-${activity.name.toLowerCase().replace(' ', '-')}`}
                    >
                      <span className="font-semibold text-lg">{activity.name}</span>
                      <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                        <span className="font-bold">{activity.count}</span>
                        <span className="text-sm">sessions</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-ai-insights" className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
          <CardHeader>
            <CardTitle className="text-2xl">AI-Generated Insights</CardTitle>
            <CardDescription>Patterns and observations about your creative journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {insights.map((insight, idx) => {
                const gradients = [
                  'from-emerald-400 to-teal-400',
                  'from-cyan-400 to-blue-400',
                  'from-violet-400 to-purple-400',
                  'from-fuchsia-400 to-pink-400'
                ];
                return (
                  <div 
                    key={idx} 
                    className={`p-5 rounded-lg bg-gradient-to-br ${gradients[idx]} text-white shadow-lg hover-elevate`}
                    data-testid={`insight-${idx}`}
                  >
                    <p className="font-medium leading-relaxed">{insight}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

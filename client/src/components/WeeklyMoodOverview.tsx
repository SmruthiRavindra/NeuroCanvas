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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 mood-transition">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Enhanced Header */}
        <div className="mb-12 text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent animate-fade-in">
            Weekly Mood Overview
          </h1>
          <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
            Track your emotional journey and uncover creative patterns across the week
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card data-testid="card-mood-distribution" className="relative overflow-hidden border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-white/50 to-white/30 dark:from-white/5 dark:to-white/10 backdrop-blur-sm animate-slide-in">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none" />
            <CardHeader className="relative">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Mood Distribution
              </CardTitle>
              <CardDescription className="text-base">Your emotional landscape this week</CardDescription>
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
              <div className="mt-6 space-y-4">
                {moodData.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={item.mood} 
                      className="flex items-center justify-between p-4 rounded-xl hover-elevate active-elevate-2 border border-white/20 backdrop-blur-sm transition-all duration-300 hover:shadow-lg cursor-pointer animate-slide-in"
                      style={{ 
                        backgroundColor: `${item.color}15`,
                        animationDelay: `${idx * 100}ms`
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg shadow-md" style={{ backgroundColor: item.color }}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg">{item.mood}</span>
                      </div>
                      <span className="text-2xl font-bold" style={{ color: item.color }}>{item.percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-creative-activities" className="relative overflow-hidden border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-white/50 to-white/30 dark:from-white/5 dark:to-white/10 backdrop-blur-sm animate-slide-in stagger-delay-1">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-pink-500/10 pointer-events-none" />
            <CardHeader className="relative">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Creative Activities
              </CardTitle>
              <CardDescription className="text-base">What you've been creating this week</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-4">
                {activities.map((activity, idx) => {
                  const gradients = [
                    'from-pink-500 via-rose-500 to-pink-600',
                    'from-orange-500 via-amber-500 to-orange-600',
                    'from-blue-500 via-cyan-500 to-blue-600',
                    'from-purple-500 via-fuchsia-500 to-purple-600'
                  ];
                  return (
                    <div
                      key={activity.name}
                      className={`flex items-center justify-between p-5 rounded-xl bg-gradient-to-r ${gradients[idx]} text-white shadow-xl hover:shadow-2xl hover-elevate active-elevate-2 transition-all duration-300 hover:scale-105 animate-slide-in`}
                      style={{ animationDelay: `${(idx + 1) * 100}ms` }}
                      data-testid={`activity-${activity.name.toLowerCase().replace(' ', '-')}`}
                    >
                      <span className="font-bold text-xl">{activity.name}</span>
                      <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                        <span className="font-extrabold text-lg">{activity.count}</span>
                        <span className="text-sm font-medium">sessions</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-ai-insights" className="relative overflow-hidden border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-white/50 to-white/30 dark:from-white/5 dark:to-white/10 backdrop-blur-sm animate-slide-in stagger-delay-2">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 pointer-events-none" />
          <CardHeader className="relative">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              AI-Generated Insights
            </CardTitle>
            <CardDescription className="text-base">Patterns and observations about your creative journey</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid md:grid-cols-2 gap-6">
              {insights.map((insight, idx) => {
                const gradients = [
                  'from-emerald-500 via-emerald-400 to-teal-500',
                  'from-cyan-500 via-cyan-400 to-blue-500',
                  'from-violet-500 via-violet-400 to-purple-500',
                  'from-fuchsia-500 via-fuchsia-400 to-pink-500'
                ];
                return (
                  <div 
                    key={idx} 
                    className={`relative p-6 rounded-2xl bg-gradient-to-br ${gradients[idx]} text-white shadow-2xl hover:shadow-3xl hover-elevate active-elevate-2 transition-all duration-300 hover:scale-105 overflow-hidden animate-scale-in`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                    data-testid={`insight-${idx}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                    <p className="relative font-semibold text-lg leading-relaxed">{insight}</p>
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

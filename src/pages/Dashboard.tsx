import { useMemo, useState } from 'react';
import { Flame, Shield, TrendingUp, BarChart3, CalendarDays, Trash2, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getEntries, getWeeklyDominantEmotion, getEmotionDistribution, getStabilityScore, getStreak, clearEntries } from '@/lib/storage';
import { EMOTION_META } from '@/lib/emotionEngine';
import { STATUS_META, type MentalHealthStatus } from '@/lib/mentalHealthClassifier';

const Dashboard = () => {
  const [entries, setEntries] = useState(() => getEntries());

  const weeklyEmotion = useMemo(() => getWeeklyDominantEmotion(entries), [entries]);
  const distribution = useMemo(() => getEmotionDistribution(entries), [entries]);
  const stability = useMemo(() => getStabilityScore(entries), [entries]);
  const streak = useMemo(() => getStreak(entries), [entries]);

  const mentalHealthDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach(e => {
      const status = e.result.mentalHealthStatus?.status;
      if (status) {
        counts[status] = (counts[status] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([status, count]) => ({
      status: STATUS_META[status as MentalHealthStatus]?.label || status,
      count,
      fill: STATUS_META[status as MentalHealthStatus]?.color || 'hsl(220, 15%, 55%)',
    }));
  }, [entries]);

  const handleClear = () => {
    if (confirm('Are you sure you want to delete all journal entries? This cannot be undone.')) {
      clearEntries();
      setEntries([]);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-accent/10 to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Emotional Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">{entries.length} journal {entries.length === 1 ? 'entry' : 'entries'} recorded</p>
          </div>
          {entries.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClear} className="text-destructive hover:text-destructive gap-1">
              <Trash2 className="h-4 w-4" /> Clear All
            </Button>
          )}
        </div>

        {entries.length === 0 ? (
          <Card className="text-center py-16 shadow-md">
            <CardContent>
              <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">No entries yet</h2>
              <p className="text-sm text-muted-foreground">Start writing in your journal to see your emotional patterns here.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Card className="shadow-md border-border/50">
                <CardContent className="p-5 text-center">
                  <Flame className="h-6 w-6 mx-auto text-primary mb-2" />
                  <p className="text-3xl font-bold text-foreground">{streak}</p>
                  <p className="text-xs text-muted-foreground mt-1">Day Streak 🔥</p>
                </CardContent>
              </Card>
              <Card className="shadow-md border-border/50">
                <CardContent className="p-5 text-center">
                  <Shield className="h-6 w-6 mx-auto text-primary mb-2" />
                  <p className="text-3xl font-bold text-foreground">{stability}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Stability Score</p>
                </CardContent>
              </Card>
              <Card className="shadow-md border-border/50">
                <CardContent className="p-5 text-center">
                  {weeklyEmotion ? (
                    <>
                      <div className="text-3xl mb-1">{EMOTION_META[weeklyEmotion].emoji}</div>
                      <p className="text-sm font-semibold text-foreground">{EMOTION_META[weeklyEmotion].label}</p>
                      <p className="text-xs text-muted-foreground mt-1">Weekly Dominant</p>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-6 w-6 mx-auto text-muted-foreground/40 mb-2" />
                      <p className="text-xs text-muted-foreground">Need more data</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            {distribution.length > 0 && (
              <Card className="mb-8 shadow-md border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" /> Emotion Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={distribution}>
                        <XAxis dataKey="emotion" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                          labelStyle={{ fontWeight: 600 }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {distribution.map((d, i) => (
                            <Cell key={i} fill={d.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mental Health Distribution */}
            {mentalHealthDistribution.length > 0 && (
              <Card className="mb-8 shadow-md border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" /> Mental Health Pattern Distribution
                    <span className="text-[10px] font-normal text-muted-foreground ml-auto">Kaggle Dataset-Aligned</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mentalHealthDistribution}>
                        <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                          labelStyle={{ fontWeight: 600 }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {mentalHealthDistribution.map((d, i) => (
                            <Cell key={i} fill={d.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Entry List */}
            <h2 className="text-lg font-semibold text-foreground mb-4">Past Entries</h2>
            <div className="space-y-3">
              {entries.map(entry => {
                const meta = EMOTION_META[entry.result.primaryEmotion];
                return (
                  <Card key={entry.id} className="shadow-sm border-border/50 hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-start gap-3">
                      <span className="text-2xl">{meta.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <Badge variant="secondary" className="text-xs">{meta.label}</Badge>
                          <span className="text-xs text-muted-foreground">{entry.result.confidence}%</span>
                        </div>
                        <p className="text-sm text-foreground line-clamp-2">{entry.text}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

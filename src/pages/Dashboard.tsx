import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Shield, TrendingUp, BarChart3, CalendarDays, Trash2, Database, Pencil, Save, X, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getEntries, getWeeklyDominantEmotion, getEmotionDistribution, getStabilityScore, getStreak, clearEntries, updateEntry, deleteEntry, JournalEntry } from '@/lib/storage';
import { EMOTION_META, analyzeEmotionWithAI, EMOTION_WORDS_SET } from '@/lib/emotionEngine';
import type { EmotionResult, EmotionType } from '@/lib/emotionEngine';
import { STATUS_META, type MentalHealthStatus } from '@/lib/mentalHealthClassifier';
import { isEnglishWord } from '@/lib/englishWords';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    getEntries().then(data => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

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

  const handleClear = async () => {
    if (confirm('Are you sure you want to delete all journal entries? This cannot be undone.')) {
      await clearEntries();
      setEntries([]);
    }
  };

  const handleEditStart = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setEditText(entry.text);
  };

  const handleEditSave = async (entry: JournalEntry) => {
    const trimmed = editText.trim();
    if (!trimmed) return;

    const words = trimmed.split(/\s+/).filter(Boolean);
    const englishWords = words.filter(isEnglishWord);
    if (englishWords.length < Math.max(1, Math.ceil(words.length * 0.5))) {
      toast({ title: "Invalid entry", description: "Please enter a valid journal entry with meaningful text.", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    try {
      let newResult: EmotionResult;
      if (words.length === 1) {
        const word = words[0].toLowerCase().replace(/[^a-z]/g, '');
        if (EMOTION_WORDS_SET.has(word)) {
          newResult = await analyzeEmotionWithAI(trimmed);
        } else {
          newResult = {
            primaryEmotion: 'neutral' as EmotionType, confidence: 80, sentiment: 'Neutral',
            keywords: [], intensity: 'Low',
            insight: "You shared a simple thought. Not every moment carries a strong emotion — and that's perfectly fine. 😊",
            suggestions: ["📝 Try writing a bit more about how your day is going", "🚶 Take a moment to check in with yourself", "☕ Enjoy this calm moment"],
            safetyAlert: false,
          };
        }
      } else {
        newResult = await analyzeEmotionWithAI(trimmed);
      }
      const updated = { ...entry, text: trimmed, result: newResult };
      await updateEntry(updated);
      setEntries(prev => prev.map(e => e.id === entry.id ? updated : e));
      setEditingId(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (confirm('Delete this entry?')) {
      await deleteEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-accent/10 to-secondary/20">
      <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-foreground">Emotional Dashboard</h1>
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
                const meta = EMOTION_META[entry.result?.primaryEmotion] ?? { emoji: '❓', color: 'hsl(0,0%,50%)', label: 'Unknown' };
                const isEditing = editingId === entry.id;
                return (
                  <Card key={entry.id} className="shadow-sm border-border/50 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{meta.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs text-muted-foreground">
                              {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <Badge variant="secondary" className="text-xs">{meta.label}</Badge>
                            <span className="text-xs text-muted-foreground">{entry.result.confidence}%</span>
                          </div>
                          {isEditing ? (
                            <div className="space-y-2 mt-2">
                              <Textarea
                                value={editText}
                                onChange={e => setEditText(e.target.value)}
                                className="min-h-[80px] text-sm resize-none border-border bg-muted/30"
                              />
                              <div className="flex gap-2 justify-end">
                                <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="gap-1 h-7 text-xs">
                                  <X className="h-3 w-3" /> Cancel
                                </Button>
                                <Button size="sm" onClick={() => handleEditSave(entry)} disabled={!editText.trim() || isAnalyzing} className="gap-1 h-7 text-xs">
                                  {isAnalyzing ? (
                                    <><span className="animate-spin h-3 w-3 border-2 border-primary-foreground border-t-transparent rounded-full" /> Analyzing...</>
                                  ) : (
                                    <><Save className="h-3 w-3" /> Save & Re-analyze</>
                                  )}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm text-foreground line-clamp-2">{entry.text}</p>
                              {entry.audioUrl && (
                                <audio controls className="mt-2 w-full h-8" preload="none">
                                  <source src={entry.audioUrl} type="audio/webm" />
                                </audio>
                              )}
                            </>
                          )}
                        </div>
                        {!isEditing && (
                          <div className="flex gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => navigate('/results', { state: { entry } })} title="View full results">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => handleEditStart(entry)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteEntry(entry.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
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

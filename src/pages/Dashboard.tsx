import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame, Shield, TrendingUp, BarChart3, CalendarDays, Trash2, Database,
  Pencil, Save, X, Eye, Printer, Activity, Tag, Sparkles
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area
} from 'recharts';
import {
  getEntries, getWeeklyDominantEmotion, getEmotionDistribution,
  getStabilityScore, getStreak, clearEntries, updateEntry, deleteEntry,
  JournalEntry
} from '@/lib/storage';
import { EMOTION_META, analyzeEmotionWithAI, EMOTION_WORDS_SET } from '@/lib/emotionEngine';
import type { EmotionResult, EmotionType } from '@/lib/emotionEngine';
import { STATUS_META, type MentalHealthStatus } from '@/lib/mentalHealthClassifier';
import { isEnglishWord } from '@/lib/englishWords';
import { toast } from '@/hooks/use-toast';

const VALENCE_MAP: Record<EmotionType, number> = {
  happy: 90,
  love: 95,
  surprise: 75,
  neutral: 50,
  stress: 35,
  anxious: 30,
  angry: 25,
  sad: 20,
  bipolar: 25,
  personality_disorder: 20,
  depression: 15,
  suicidal: 5,
};

const TRIGGER_KEYWORDS: Record<string, string[]> = {
  'Work & Career': ['work', 'job', 'boss', 'office', 'career', 'colleague', 'meeting', 'project', 'deadline', 'client', 'salary'],
  'Academics': ['exam', 'study', 'college', 'school', 'class', 'grade', 'marks', 'homework', 'professor', 'assignment'],
  'Relationships': ['friend', 'partner', 'family', 'parents', 'mom', 'dad', 'boyfriend', 'girlfriend', 'love', 'argument', 'lonely'],
  'Sleep & Physical Health': ['sleep', 'tired', 'insomnia', 'headache', 'sick', 'body', 'exhausted', 'pain', 'exercise', 'diet'],
  'Personal Growth': ['goal', 'habit', 'future', 'mind', 'peace', 'meditation', 'reading', 'improve', 'learn', 'gratitude'],
};

const Dashboard = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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

  // Longitudinal Valence Timeline (chronological order)
  const trajectoryData = useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14)
      .map(e => ({
        date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        valence: VALENCE_MAP[e.result.primaryEmotion] ?? 50,
        emotion: EMOTION_META[e.result.primaryEmotion]?.label || 'Neutral',
      }));
  }, [entries]);

  // Trigger Breakdown
  const triggerStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of Object.keys(TRIGGER_KEYWORDS)) counts[cat] = 0;

    entries.forEach(e => {
      const text = e.text.toLowerCase();
      for (const [cat, words] of Object.entries(TRIGGER_KEYWORDS)) {
        if (words.some(w => text.includes(w))) {
          counts[cat] = (counts[cat] || 0) + 1;
        }
      }
    });

    return Object.entries(counts)
      .filter(([, c]) => c > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [entries]);

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

  const safetyAlertsCount = useMemo(() => {
    return entries.filter(e => e.result.safetyAlert).length;
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

  const handlePrintSummary = () => {
    window.print();
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
      <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-8 max-w-4xl space-y-6">
        {/* Header section with Print Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-foreground">Emotional Health Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {entries.length} journal {entries.length === 1 ? 'entry' : 'entries'} recorded • Clinical Longitudinal Tracking
            </p>
          </div>
          {entries.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintSummary}
                className="gap-1.5 shadow-sm text-xs bg-background/80"
              >
                <Printer className="h-3.5 w-3.5 text-primary" /> Export Clinical Summary
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-destructive hover:text-destructive gap-1 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear All
              </Button>
            </div>
          )}
        </div>

        {entries.length === 0 ? (
          <Card className="text-center py-16 shadow-md border-border/50">
            <CardContent>
              <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">No entries yet</h2>
              <p className="text-sm text-muted-foreground mb-4">Start writing in your journal to track your emotional patterns over time.</p>
              <Button onClick={() => navigate('/')} className="rounded-full">Write First Entry</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* KPI Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Card className="shadow-sm border-border/50">
                <CardContent className="p-4 sm:p-5 text-center">
                  <Flame className="h-5 w-5 mx-auto text-primary mb-1.5" />
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{streak}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Day Streak 🔥</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border/50">
                <CardContent className="p-4 sm:p-5 text-center">
                  <Shield className="h-5 w-5 mx-auto text-primary mb-1.5" />
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{stability}%</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Stability Score</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border/50">
                <CardContent className="p-4 sm:p-5 text-center">
                  {weeklyEmotion ? (
                    <>
                      <div className="text-2xl sm:text-3xl mb-0.5">{EMOTION_META[weeklyEmotion].emoji}</div>
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{EMOTION_META[weeklyEmotion].label}</p>
                      <p className="text-[11px] text-muted-foreground">Weekly Mode</p>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-5 w-5 mx-auto text-muted-foreground/40 mb-1.5" />
                      <p className="text-xs text-muted-foreground">Gathering data</p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border/50">
                <CardContent className="p-4 sm:p-5 text-center">
                  <Activity className="h-5 w-5 mx-auto text-primary mb-1.5" />
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{safetyAlertsCount}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Crisis Flags</p>
                </CardContent>
              </Card>
            </div>

            {/* Longitudinal Mood Valence Trajectory */}
            {trajectoryData.length > 1 && (
              <Card className="shadow-md border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm sm:text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" /> Longitudinal Mood Trajectory (Valence Trend)
                    </span>
                    <span className="text-[11px] font-normal text-muted-foreground">Last {trajectoryData.length} entries</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 sm:h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="valenceGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid hsl(var(--border))',
                            background: 'hsl(var(--card))',
                            fontSize: '12px'
                          }}
                          formatter={(value: any, name: any, item: any) => [
                            `${value}% (${item.payload.emotion})`,
                            'Valence Score'
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="valence"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#valenceGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Triggers & Contexts */}
            {triggerStats.length > 0 && (
              <Card className="shadow-sm border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" /> Top Context & Stress Triggers
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2 pt-1">
                    {triggerStats.map(([category, count]) => (
                      <Badge key={category} variant="secondary" className="px-3 py-1 text-xs gap-1.5">
                        <span>{category}</span>
                        <span className="font-semibold px-1 rounded bg-primary/20 text-primary text-[10px]">{count}</span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Emotion Distribution BarChart */}
            {distribution.length > 0 && (
              <Card className="shadow-md border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" /> Emotion Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={isMobile ? "h-80" : "h-72"}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={distribution} margin={{ bottom: isMobile ? 60 : 20 }}>
                        <XAxis
                          dataKey="emotion"
                          interval={0}
                          tick={({ x, y, payload }: any) => {
                            if (isMobile) {
                              return (
                                <g transform={`translate(${x},${y})`}>
                                  <text x={0} y={0} dy={4} textAnchor="end" fontSize={8} fill="currentColor" transform="rotate(-45)">
                                    {payload.value}
                                  </text>
                                </g>
                              );
                            }
                            const words = payload.value.split(' ');
                            return (
                              <g transform={`translate(${x},${y})`}>
                                {words.length > 1 ? (
                                  <>
                                    <text x={0} y={8} textAnchor="middle" fontSize={10} fill="currentColor">{words[0]}</text>
                                    <text x={0} y={20} textAnchor="middle" fontSize={10} fill="currentColor">{words[1]}</text>
                                  </>
                                ) : (
                                  <text x={0} y={14} textAnchor="middle" fontSize={11} fill="currentColor">{payload.value}</text>
                                )}
                              </g>
                            );
                          }}
                        />
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

            {/* Mental Health Distribution (Kaggle Aligned) */}
            {mentalHealthDistribution.length > 0 && (
              <Card className="shadow-md border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" /> Mental Health Pattern Distribution
                    </span>
                    <Badge variant="outline" className="text-[10px] font-normal">
                      51,000+ Kaggle Aligned
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={isMobile ? "h-72" : "h-64"}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mentalHealthDistribution} margin={{ bottom: isMobile ? 50 : 5 }}>
                        <XAxis
                          dataKey="status"
                          interval={0}
                          tick={({ x, y, payload }: any) => {
                            if (isMobile) {
                              return (
                                <g transform={`translate(${x},${y})`}>
                                  <text x={0} y={0} dy={4} textAnchor="end" fontSize={8} fill="currentColor" transform="rotate(-45)">
                                    {payload.value}
                                  </text>
                                </g>
                              );
                            }
                            const words = payload.value.split(' ');
                            return (
                              <g transform={`translate(${x},${y})`}>
                                {words.length > 1 ? (
                                  <>
                                    <text x={0} y={8} textAnchor="middle" fontSize={10} fill="currentColor">{words[0]}</text>
                                    <text x={0} y={20} textAnchor="middle" fontSize={10} fill="currentColor">{words[1]}</text>
                                  </>
                                ) : (
                                  <text x={0} y={14} textAnchor="middle" fontSize={11} fill="currentColor">{payload.value}</text>
                                )}
                              </g>
                            );
                          }}
                        />
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

            {/* Past Entries List */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Past Journal Records</h2>
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
                              <span className="text-xs text-muted-foreground">{entry.result.confidence}% confidence</span>
                              {entry.result.safetyAlert && (
                                <Badge variant="destructive" className="text-[10px]">Crisis Flagged</Badge>
                              )}
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
                                <p className="text-sm text-foreground line-clamp-2 leading-relaxed">"{entry.text}"</p>
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
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => navigate('/results', { state: { entry } })} title="View full analysis">
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
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

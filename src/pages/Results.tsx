import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Lightbulb, Brain, TrendingUp, Database, MessageSquareQuote, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EMOTION_META } from '@/lib/emotionEngine';
import { STATUS_META } from '@/lib/mentalHealthClassifier';
import type { JournalEntry } from '@/lib/storage';

const intensityColor: Record<string, string> = {
  Low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 shadow-sm',
  Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 shadow-sm',
  High: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 shadow-sm',
};

const sentimentColor: Record<string, string> = {
  Positive: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 shadow-sm',
  Negative: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 shadow-sm',
  Neutral: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300 shadow-sm',
  Mixed: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 shadow-sm',
};

const confidenceColor = (value: number) => {
  if (value >= 75) return 'bg-emerald-500';
  if (value >= 50) return 'bg-amber-500';
  return 'bg-rose-500';
};

const statusBorderColor: Record<string, string> = {
  Normal: 'border-l-emerald-500',
  Depression: 'border-l-blue-500',
  Suicidal: 'border-l-red-600',
  Anxiety: 'border-l-amber-500',
  Stress: 'border-l-orange-500',
  Bipolar: 'border-l-violet-500',
  'Personality disorder': 'border-l-pink-500',
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const entry = (location.state as { entry: JournalEntry } | null)?.entry;

  useEffect(() => {
    if (!entry) {
      navigate('/');
    }
  }, [entry, navigate]);

  const colorStrip = useMemo(() => {
    if (!entry) return '';
    const meta = EMOTION_META[entry.result.primaryEmotion];
    return meta?.color ?? '';
  }, [entry]);

  if (!entry) return null;

  const { result } = entry;
  const meta = EMOTION_META[result.primaryEmotion];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-accent/10 to-secondary/20">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4 sm:mb-6 gap-2 text-muted-foreground hover:text-foreground animate-fade-slide-up stagger-1">
          <ArrowLeft className="h-4 w-4" /> Write Another Entry
        </Button>

        {/* Safety Alert */}
        {result.safetyAlert && (
          <Card className="mb-4 sm:mb-6 border-destructive/30 bg-destructive/5 animate-fade-slide-up stagger-1">
            <CardContent className="p-4 sm:p-5 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed text-foreground">{result.safetyMessage}</p>
            </CardContent>
          </Card>
        )}

        {/* Primary Emotion Card */}
        <Card className="mb-4 sm:mb-6 shadow-lg border-border/50 overflow-hidden animate-fade-slide-up stagger-2">
          <div
            className="h-2 w-full"
            style={{ background: `linear-gradient(90deg, hsl(${colorStrip}) 0%, hsl(${colorStrip} / 0.4) 100%)` }}
          />
          <CardContent className="p-5 sm:p-8 text-center">
            <div className="text-5xl sm:text-7xl mb-3 drop-shadow-md">{meta.emoji}</div>
            <h2 className="text-xl sm:text-3xl font-bold text-foreground mb-1">{meta.label}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-5">Primary Emotion Detected</p>

            <div className="max-w-xs mx-auto mb-2">
              <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-semibold text-foreground">{result.confidence}%</span>
              </div>
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${confidenceColor(result.confidence)}`}
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-5 flex-wrap">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${sentimentColor[result.sentiment]}`}>
                {result.sentiment}
              </span>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${intensityColor[result.intensity]}`}>
                {result.intensity} Intensity
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Keywords */}
        <Card className="mb-4 sm:mb-6 shadow-md border-border/50 animate-fade-slide-up stagger-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Emotional Keywords
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {result.keywords.map((kw, i) => (
                <Badge key={i} variant="secondary" className="text-xs sm:text-sm px-3 py-1">
                  {kw}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insight */}
        <Card className="mb-4 sm:mb-6 shadow-md border-border/50 animate-fade-slide-up stagger-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" /> AI Insight
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground italic">"{result.insight}"</p>
          </CardContent>
        </Card>

        {/* Mental Health Pattern */}
        {result.mentalHealthStatus && (() => {
          const mh = result.mentalHealthStatus;
          const statusMeta = STATUS_META[mh.status];
          const borderClass = statusBorderColor[mh.status] || 'border-l-muted';
          return (
            <Card className={`mb-4 sm:mb-6 shadow-md border-border/50 border-l-4 ${borderClass} animate-fade-slide-up stagger-5`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" /> Mental Health Pattern
                  <span className="text-[10px] font-normal text-muted-foreground ml-auto hidden sm:inline">Based on Kaggle Mental Health Dataset</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl">{statusMeta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm sm:text-base">{statusMeta.label}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{mh.explanation}</p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">{mh.confidence}%</Badge>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-medium text-foreground">{mh.confidence}%</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${confidenceColor(mh.confidence)}`}
                      style={{ width: `${mh.confidence}%` }}
                    />
                  </div>
                </div>

                {mh.sampleStatements.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <MessageSquareQuote className="h-3 w-3" /> Similar entries from dataset
                    </p>
                    <div className="space-y-2">
                      {mh.sampleStatements.slice(0, 2).map((s, i) => (
                        <p key={i} className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5 italic border border-border/30">"{s}"</p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 pb-3 px-6">
                <p className="text-[10px] text-muted-foreground/60 italic">
                  This is a pattern-based estimate, not a clinical diagnosis. Please consult a professional for medical advice.
                </p>
              </CardFooter>
            </Card>
          );
        })()}

        {/* Suggestions */}
        <Card className="shadow-md border-border/50 animate-fade-slide-up stagger-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" /> Personalized Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2 sm:space-y-3">
              {result.suggestions.map((s, i) => (
                <li key={i} className="text-xs sm:text-sm leading-relaxed text-foreground bg-muted/40 rounded-lg p-2.5 sm:p-3">
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Share hint */}
        <div className="mt-6 text-center animate-fade-slide-up stagger-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground gap-1.5"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'My Emotion Analysis', text: `I'm feeling ${meta.label} today.` });
              }
            }}
          >
            <Share2 className="h-3.5 w-3.5" /> Share Results
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;

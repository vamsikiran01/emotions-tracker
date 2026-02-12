import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Lightbulb, Brain, TrendingUp, Database, MessageSquareQuote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EMOTION_META } from '@/lib/emotionEngine';
import { STATUS_META } from '@/lib/mentalHealthClassifier';
import type { JournalEntry } from '@/lib/storage';

const intensityColor: Record<string, string> = {
  Low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  High: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const sentimentColor: Record<string, string> = {
  Positive: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  Negative: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  Neutral: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
  Mixed: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const entry = (location.state as { entry: JournalEntry } | null)?.entry;

  if (!entry) {
    navigate('/');
    return null;
  }

  const { result } = entry;
  const meta = EMOTION_META[result.primaryEmotion];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-accent/10 to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Write Another Entry
        </Button>

        {/* Safety Alert */}
        {result.safetyAlert && (
          <Card className="mb-6 border-destructive/30 bg-destructive/5">
            <CardContent className="p-5 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed text-foreground">{result.safetyMessage}</p>
            </CardContent>
          </Card>
        )}

        {/* Primary Emotion Card */}
        <Card className="mb-6 shadow-lg border-border/50 overflow-hidden">
          <div className="h-1.5 w-full" style={{ background: `hsl(${meta.color.replace('var(--emotion-', '').replace(')', '')})` }} />
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-3">{meta.emoji}</div>
            <h2 className="text-2xl font-bold text-foreground mb-1">{meta.label}</h2>
            <p className="text-sm text-muted-foreground mb-4">Primary Emotion Detected</p>

            <div className="max-w-xs mx-auto mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-semibold text-foreground">{result.confidence}%</span>
              </div>
              <Progress value={result.confidence} className="h-2.5" />
            </div>

            <div className="flex justify-center gap-2 mt-4 flex-wrap">
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
        <Card className="mb-6 shadow-md border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Emotional Keywords
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {result.keywords.map((kw, i) => (
                <Badge key={i} variant="secondary" className="text-sm px-3 py-1">
                  {kw}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insight */}
        <Card className="mb-6 shadow-md border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" /> AI Insight
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm leading-relaxed text-muted-foreground italic">"{result.insight}"</p>
          </CardContent>
        </Card>

        {/* Mental Health Pattern (Dataset-Aligned) */}
        {result.mentalHealthStatus && (() => {
          const mh = result.mentalHealthStatus;
          const statusMeta = STATUS_META[mh.status];
          return (
            <Card className="mb-6 shadow-md border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" /> Mental Health Pattern
                  <span className="text-[10px] font-normal text-muted-foreground ml-auto">Based on Kaggle Mental Health Dataset</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{statusMeta.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{statusMeta.label}</p>
                    <p className="text-xs text-muted-foreground">{mh.explanation}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{mh.confidence}%</Badge>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-medium text-foreground">{mh.confidence}%</span>
                  </div>
                  <Progress value={mh.confidence} className="h-2" />
                </div>

                {mh.sampleStatements.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <MessageSquareQuote className="h-3 w-3" /> Similar entries from dataset
                    </p>
                    <div className="space-y-2">
                      {mh.sampleStatements.slice(0, 2).map((s, i) => (
                        <p key={i} className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-2.5 italic">"{s}"</p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}

        {/* Suggestions */}
        <Card className="shadow-md border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" /> Personalized Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3">
              {result.suggestions.map((s, i) => (
                <li key={i} className="text-sm leading-relaxed text-foreground bg-muted/40 rounded-lg p-3">
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Results;

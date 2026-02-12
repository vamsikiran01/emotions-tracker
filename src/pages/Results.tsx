import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Lightbulb, Brain, Share2, Pencil, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { EMOTION_META, analyzeEmotion } from '@/lib/emotionEngine';
import { updateEntry, deleteEntry } from '@/lib/storage';
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

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<JournalEntry | null>(
    (location.state as { entry: JournalEntry } | null)?.entry ?? null
  );
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');

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

  const handleEdit = () => {
    setEditText(entry.text);
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    const newResult = analyzeEmotion(trimmed);
    const updated: JournalEntry = { ...entry, text: trimmed, result: newResult };
    await updateEntry(updated);
    setEntry(updated);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      await deleteEntry(entry.id);
      navigate('/');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-accent/10 to-secondary/20">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-4 sm:mb-6 animate-fade-slide-up stagger-1">
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Write Another Entry
          </Button>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={handleEdit} className="text-muted-foreground hover:text-foreground" title="Edit entry">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete} className="text-muted-foreground hover:text-destructive" title="Delete entry">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Edit mode */}
        {editing && (
          <Card className="mb-4 sm:mb-6 shadow-md border-primary/30 animate-fade-slide-up">
            <CardContent className="p-4 sm:p-5 space-y-3">
              <p className="text-sm font-medium text-foreground">Edit your entry</p>
              <Textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="min-h-[120px] text-sm resize-none border-border bg-muted/30 focus-visible:ring-primary/30"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="gap-1">
                  <X className="h-3.5 w-3.5" /> Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit} disabled={!editText.trim()} className="gap-1">
                  <Save className="h-3.5 w-3.5" /> Save & Re-analyze
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Original text preview */}
        <Card className="mb-4 sm:mb-6 shadow-sm border-border/50 animate-fade-slide-up stagger-1">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Your entry</p>
            <p className="text-sm text-foreground leading-relaxed">"{entry.text}"</p>
          </CardContent>
        </Card>

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
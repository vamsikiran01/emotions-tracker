import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { analyzeEmotion, AFFIRMATIONS } from '@/lib/emotionEngine';
import { saveEntry, JournalEntry } from '@/lib/storage';

const Index = () => {
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const affirmation = useMemo(() =>
    AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)], []);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    // Simulate processing delay
    await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));
    const result = analyzeEmotion(text);
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      text: text.trim(),
      result,
    };
    saveEntry(entry);
    setAnalyzing(false);
    navigate('/results', { state: { entry } });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-accent/10 to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Affirmation */}
        <Card className="mb-8 border-none bg-gradient-to-r from-primary/10 to-accent/10 shadow-none">
          <CardContent className="py-4 px-6 text-center">
            <p className="text-sm text-muted-foreground italic leading-relaxed">{affirmation}</p>
          </CardContent>
        </Card>

        {/* Date */}
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground mb-1">Today's Entry</p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{today}</h1>
        </div>

        {/* Journal Input */}
        <Card className="shadow-lg border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4 text-muted-foreground">
              <PenLine className="h-4 w-4" />
              <span className="text-sm font-medium">How are you feeling today?</span>
            </div>
            <Textarea
              placeholder="Write freely about your day, your thoughts, your feelings... This is your safe space. ✨"
              className="min-h-[200px] text-base leading-relaxed resize-none border-none bg-muted/30 focus-visible:ring-primary/30 placeholder:text-muted-foreground/50"
              value={text}
              onChange={e => setText(e.target.value)}
              disabled={analyzing}
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-muted-foreground">
                {text.length > 0 ? `${text.split(/\s+/).filter(Boolean).length} words` : 'Start writing...'}
              </span>
              <Button
                onClick={handleAnalyze}
                disabled={!text.trim() || analyzing}
                className="gap-2 rounded-full px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                size="lg"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analyze My Emotions
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Your journal entries are stored locally on your device. Your privacy is our priority. 🔒
        </p>
      </div>
    </div>
  );
};

export default Index;

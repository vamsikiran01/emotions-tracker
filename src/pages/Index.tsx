import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, PenLine, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { analyzeEmotionWithAI, AFFIRMATIONS, EMOTION_WORDS_SET, EMOTION_META } from '@/lib/emotionEngine';
import type { EmotionType, EmotionResult } from '@/lib/emotionEngine';
import { saveEntry, uploadAudio, JournalEntry } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';
import { isEnglishWord } from '@/lib/englishWords';
import VoiceRecorder from '@/components/VoiceRecorder';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const audioBlobRef = useRef<Blob | null>(null);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };


  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const affirmation = useMemo(() =>
    AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)], []);

  const isValidEntry = (input: string): boolean => {
    const trimmed = input.trim();
    if (trimmed.length === 0) return false;
    const words = trimmed.split(/\s+/).filter(Boolean);
    const englishWords = words.filter(isEnglishWord);
    return englishWords.length >= Math.max(1, Math.ceil(words.length * 0.5));
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    if (!isValidEntry(text)) {
      toast({
        title: "Invalid entry",
        description: "Please enter a valid journal entry with meaningful text.",
        variant: "destructive",
      });
      return;
    }
    setAnalyzing(true);
    try {
      const words = text.trim().split(/\s+/).filter(Boolean);
      let result: EmotionResult;

      // Single word: check if it's an emotion word → analyze, otherwise → neutral
      if (words.length === 1) {
        const word = words[0].toLowerCase().replace(/[^a-z]/g, '');
        if (EMOTION_WORDS_SET.has(word)) {
          result = await analyzeEmotionWithAI(text);
        } else {
          // Return neutral for non-emotional single words
          result = {
            primaryEmotion: 'neutral' as EmotionType,
            confidence: 80,
            sentiment: 'Neutral',
            keywords: [],
            intensity: 'Low',
            insight: "You shared a simple thought. Not every moment carries a strong emotion — and that's perfectly fine. 😊",
            suggestions: [
              "📝 Try writing a bit more about how your day is going",
              "🚶 Take a moment to check in with yourself — how are you really feeling?",
              "☕ Enjoy this calm moment and let your thoughts flow freely",
            ],
            safetyAlert: false,
          };
        }
      } else {
        result = await analyzeEmotionWithAI(text);
      }
      // Upload audio if available
      let audioUrl: string | undefined;
      if (audioBlobRef.current) {
        const url = await uploadAudio(audioBlobRef.current);
        if (url) audioUrl = url;
        audioBlobRef.current = null;
      }

      const entry: JournalEntry = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        text: text.trim(),
        result,
        audioUrl,
      };
      await saveEntry(entry);
      navigate('/results', { state: { entry } });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-accent/10 to-secondary/20">
      <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-8 max-w-2xl">
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-4 gap-3">
              <span className="text-xs text-muted-foreground text-center sm:text-left">
                {text.length > 0 ? `${text.split(/\s+/).filter(Boolean).length} words` : 'Start writing...'}
              </span>
              <div className="flex items-center gap-2 justify-center sm:justify-end">
                <VoiceRecorder
                  onTranscript={(transcript) => setText(prev => prev ? `${prev} ${transcript}` : transcript)}
                  onRecordingComplete={(blob) => { audioBlobRef.current = blob; }}
                  onTranscribingChange={setTranscribing}
                  disabled={analyzing}
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={!text.trim() || analyzing || transcribing}
                  className="gap-2 rounded-full px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md min-h-[44px]"
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
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Your journal entries are securely stored in the cloud. 🔒
        </p>
      </div>

      {/* Floating logout button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="gap-2 rounded-full shadow-lg bg-background/90 backdrop-blur-sm border-border/50 text-destructive hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Index;

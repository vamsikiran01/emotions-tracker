import { useState, useEffect } from 'react';
import { PhoneCall, HeartHandshake, ShieldAlert, Sparkles, Wind } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CrisisSafetyDrawerProps {
  safetyMessage?: string;
}

export default function CrisisSafetyDrawer({ safetyMessage }: CrisisSafetyDrawerProps) {
  const [breathingStep, setBreathingStep] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [count, setCount] = useState(4);
  const [activeBreathing, setActiveBreathing] = useState(false);

  useEffect(() => {
    if (!activeBreathing) return;

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          if (breathingStep === 'inhale') {
            setBreathingStep('hold');
            return 7;
          } else if (breathingStep === 'hold') {
            setBreathingStep('exhale');
            return 8;
          } else {
            setBreathingStep('inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeBreathing, breathingStep]);

  const stepLabels = {
    inhale: 'Breathe In Slowly (4s)...',
    hold: 'Gently Hold (7s)...',
    exhale: 'Slowly Exhale (8s)...',
  };

  return (
    <Card className="border-2 border-destructive/40 bg-gradient-to-br from-destructive/10 via-background to-amber-500/5 shadow-xl animate-fade-slide-up overflow-hidden">
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Header alert */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-full bg-destructive/15 text-destructive shrink-0 mt-0.5">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-destructive">You Matter. Immediate Support is Available</h3>
            <p className="text-xs sm:text-sm text-foreground/90 mt-1 leading-relaxed">
              {safetyMessage || "We noticed phrases in your entry indicating deep distress or crisis. Please know you are not alone, and compassionate, free, confidential human support is available 24/7."}
            </p>
          </div>
        </div>

        {/* Hotlines Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          {/* India */}
          <div className="p-3 rounded-lg border border-border/70 bg-card/80 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                <span>🇮🇳 India: Tele-MANAS</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">National Mental Health Hotline (24/7 Free)</p>
            </div>
            <a
              href="tel:14416"
              className="mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 transition-colors"
            >
              <PhoneCall className="h-3.5 w-3.5" /> Call 14416
            </a>
          </div>

          {/* US / Canada */}
          <div className="p-3 rounded-lg border border-border/70 bg-card/80 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                <span>🇺🇸 US/CA: 988 Lifeline</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Suicide & Crisis Helpline (Call or Text)</p>
            </div>
            <a
              href="tel:988"
              className="mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 transition-colors"
            >
              <PhoneCall className="h-3.5 w-3.5" /> Call or Text 988
            </a>
          </div>

          {/* UK */}
          <div className="p-3 rounded-lg border border-border/70 bg-card/80 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                <span>🇬🇧 UK: Samaritans & 111</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">24/7 Free Support by Phone</p>
            </div>
            <a
              href="tel:116123"
              className="mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 transition-colors"
            >
              <PhoneCall className="h-3.5 w-3.5" /> Call 116 123
            </a>
          </div>
        </div>

        {/* 4-7-8 Breathing Grounding Exercise */}
        <div className="pt-2 border-t border-border/40">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Wind className="h-4 w-4 text-primary" /> Calming Grounding (4-7-8 Technique)
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveBreathing(!activeBreathing)}
              className="h-7 text-xs"
            >
              {activeBreathing ? 'Stop Exercise' : 'Start Guided Breath'}
            </Button>
          </div>

          {activeBreathing && (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center text-center space-y-2 animate-fade-slide-up">
              <div
                className={`h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-1000 ${
                  breathingStep === 'inhale'
                    ? 'scale-125 bg-primary/30 text-primary'
                    : breathingStep === 'hold'
                    ? 'scale-125 bg-amber-500/30 text-amber-600 dark:text-amber-400'
                    : 'scale-90 bg-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {count}
              </div>
              <p className="text-xs font-semibold text-foreground">{stepLabels[breathingStep]}</p>
              <p className="text-[11px] text-muted-foreground">Focus on the rhythm of your breath to bring your nervous system back to safety.</p>
            </div>
          )}
        </div>

        <p className="text-[11px] text-center text-muted-foreground pt-1 flex items-center justify-center gap-1">
          <HeartHandshake className="h-3.5 w-3.5 text-primary" /> You are worthy of care, kindness, and support. Please reach out to someone you trust today.
        </p>
      </CardContent>
    </Card>
  );
}

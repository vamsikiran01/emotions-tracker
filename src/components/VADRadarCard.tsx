import { Compass, Zap, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { type VADMetrics } from '@/lib/vadModel';

interface VADRadarCardProps {
  vad: VADMetrics;
}

export default function VADRadarCard({ vad }: VADRadarCardProps) {
  return (
    <Card className="shadow-md border-border/50 animate-fade-slide-up">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm sm:text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary" /> VAD Affective Dimensions
          </span>
          <span className="text-[11px] font-normal text-muted-foreground">Dimensional Model</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Valence */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <span>Valence</span>
              <span className="text-[10px] text-muted-foreground">(Pleasantness)</span>
            </span>
            <span className="font-semibold text-foreground">{vad.valence}% • {vad.valenceLabel}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500"
              style={{ width: `${vad.valence}%` }}
            />
          </div>
        </div>

        {/* Arousal */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Zap className="h-3 w-3 text-amber-500" />
              <span>Arousal</span>
              <span className="text-[10px] text-muted-foreground">(Physiological Energy)</span>
            </span>
            <span className="font-semibold text-foreground">{vad.arousal}% • {vad.arousalLabel}</span>
          </div>
          <Progress value={vad.arousal} className="h-2" />
        </div>

        {/* Dominance */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <ShieldCheck className="h-3 w-3 text-primary" />
              <span>Dominance</span>
              <span className="text-[10px] text-muted-foreground">(Perceived Agency)</span>
            </span>
            <span className="font-semibold text-foreground">{vad.dominance}% • {vad.dominanceLabel}</span>
          </div>
          <Progress value={vad.dominance} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

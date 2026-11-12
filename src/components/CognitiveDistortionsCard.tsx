import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type CognitiveDistortion } from '@/lib/cognitiveDistortions';

interface CognitiveDistortionsCardProps {
  distortions: CognitiveDistortion[];
}

export default function CognitiveDistortionsCard({ distortions }: CognitiveDistortionsCardProps) {
  if (distortions.length === 0) {
    return (
      <Card className="shadow-sm border-border/50 bg-emerald-500/5 animate-fade-slide-up">
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          <div className="text-xs sm:text-sm text-foreground">
            <p className="font-semibold text-emerald-700 dark:text-emerald-300">Balanced Thinking Pattern Observed</p>
            <p className="text-muted-foreground">No significant cognitive distortions (e.g. catastrophizing or black-and-white absolutes) detected in this entry.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const severityBadge = (sev: CognitiveDistortion['severity']) => {
    switch (sev) {
      case 'notable':
        return <Badge variant="destructive" className="text-[10px]">Notable Distortion</Badge>;
      case 'moderate':
        return <Badge variant="secondary" className="text-[10px] text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300">Moderate Pattern</Badge>;
      case 'mild':
      default:
        return <Badge variant="outline" className="text-[10px]">Mild Tendency</Badge>;
    }
  };

  return (
    <Card className="shadow-md border-border/50 animate-fade-slide-up">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm sm:text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" /> CBT Cognitive Distortion Analysis
          </span>
          <span className="text-[11px] font-normal text-muted-foreground">{distortions.length} identified</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {distortions.map((d) => (
          <div
            key={d.id}
            className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-2 text-xs sm:text-sm"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-semibold text-foreground">{d.name}</span>
              {severityBadge(d.severity)}
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">{d.description}</p>
            
            {/* Matched phrase tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-muted-foreground">Trigger cues:</span>
              {d.matchedPhrases.map((phrase, i) => (
                <code key={i} className="px-1.5 py-0.5 rounded bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 text-[11px] font-mono">
                  "{phrase}"
                </code>
              ))}
            </div>

            {/* CBT Reframe Prompt */}
            <div className="mt-2 pt-2 border-t border-border/40 flex items-start gap-1.5 text-xs text-primary font-medium">
              <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>CBT Thought Reframe: <span className="font-normal text-muted-foreground">{d.reframePrompt}</span></span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

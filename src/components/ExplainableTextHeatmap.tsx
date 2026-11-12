import { useState, useMemo } from 'react';
import { Sparkles, Eye, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ExplainableTextHeatmapProps {
  text: string;
}

interface TokenMeta {
  word: string;
  category: 'positive' | 'negative_mood' | 'anxiety_stress' | 'anger' | 'crisis' | 'neutral';
  label: string;
  weight: string;
}

const POSITIVE_WORDS = new Set([
  'happy', 'joy', 'excited', 'thrilled', 'wonderful', 'great', 'amazing', 'fantastic',
  'grateful', 'thankful', 'peaceful', 'calm', 'blessed', 'smile', 'enjoy', 'love',
  'proud', 'better', 'good', 'content', 'satisfied', 'optimistic', 'productive', 'awesome'
]);

const ANXIETY_STRESS_WORDS = new Set([
  'anxious', 'anxiety', 'worried', 'worry', 'stress', 'stressed', 'pressure', 'deadline',
  'nervous', 'panic', 'overwhelmed', 'overthinking', 'racing', 'restless', 'tense',
  'scared', 'afraid', 'fear', 'burnout', 'exhausted', 'drowning', 'hectic'
]);

const SAD_DEPRESSION_WORDS = new Set([
  'sad', 'sadness', 'depressed', 'depression', 'down', 'blue', 'empty', 'hopeless',
  'worthless', 'lonely', 'alone', 'numb', 'crying', 'tears', 'heartbroken', 'devastated',
  'miserable', 'tired', 'drained', 'void', 'pointless', 'meaningless', 'grief'
]);

const ANGER_WORDS = new Set([
  'angry', 'anger', 'mad', 'furious', 'rage', 'annoyed', 'irritated', 'hate',
  'frustrated', 'unfair', 'toxic', 'betrayed', 'hostile', 'disgusted', 'livid'
]);

const CRISIS_WORDS = new Set([
  'suicide', 'suicidal', 'die', 'kill', 'end', 'harm', 'cut', 'death', 'goodbye', 'burden'
]);

export default function ExplainableTextHeatmap({ text }: ExplainableTextHeatmapProps) {
  const [showHeatmap, setShowHeatmap] = useState(true);

  const tokens = useMemo(() => {
    // Regex splits by word boundaries while retaining whitespace
    const wordsAndSpaces = text.match(/\b[\w'-]+\b|[^\w\s]+|\s+/g) || [text];

    return wordsAndSpaces.map((segment): { text: string; isWord: boolean; meta?: TokenMeta } => {
      const trimmed = segment.trim().toLowerCase();
      if (!trimmed || !/^[\w'-]+$/.test(trimmed)) {
        return { text: segment, isWord: false };
      }

      let category: TokenMeta['category'] = 'neutral';
      let label = 'Neutral Baseline';
      let weight = 'Baseline';

      if (CRISIS_WORDS.has(trimmed)) {
        category = 'crisis';
        label = 'Crisis Marker';
        weight = 'High Priority';
      } else if (SAD_DEPRESSION_WORDS.has(trimmed)) {
        category = 'negative_mood';
        label = 'Depressive / Low Mood';
        weight = 'Weighted Negative';
      } else if (ANXIETY_STRESS_WORDS.has(trimmed)) {
        category = 'anxiety_stress';
        label = 'Anxiety / Stress Marker';
        weight = 'Weighted Negative';
      } else if (ANGER_WORDS.has(trimmed)) {
        category = 'anger';
        label = 'Anger / Agitation';
        weight = 'Weighted Negative';
      } else if (POSITIVE_WORDS.has(trimmed)) {
        category = 'positive';
        label = 'Positive / Emotional Lift';
        weight = 'Weighted Positive';
      }

      return {
        text: segment,
        isWord: true,
        meta: {
          word: segment,
          category,
          label,
          weight,
        },
      };
    });
  }, [text]);

  const categoryStyles: Record<TokenMeta['category'], string> = {
    positive: 'bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-b-2 border-emerald-500 font-medium px-0.5 rounded',
    anxiety_stress: 'bg-amber-100/90 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-b-2 border-amber-500 font-medium px-0.5 rounded',
    negative_mood: 'bg-blue-100/90 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-b-2 border-blue-500 font-medium px-0.5 rounded',
    anger: 'bg-rose-100/90 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-b-2 border-rose-500 font-medium px-0.5 rounded',
    crisis: 'bg-red-200 dark:bg-red-950 text-red-900 dark:text-red-100 border-b-2 border-red-600 font-semibold px-0.5 rounded animate-pulse',
    neutral: 'text-foreground',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Explainable AI (XAI) Word Sentiment Heatmap</span>
        </div>
        <button
          type="button"
          onClick={() => setShowHeatmap(!showHeatmap)}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Eye className="h-3.5 w-3.5" />
          {showHeatmap ? 'Hide Highlights' : 'Show Highlights'}
        </button>
      </div>

      {/* Legend */}
      {showHeatmap && (
        <div className="flex flex-wrap items-center gap-2 p-2 bg-muted/30 rounded-lg text-[11px] text-muted-foreground border border-border/40">
          <span className="font-semibold text-foreground flex items-center gap-1">
            <Info className="h-3 w-3" /> Legend:
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
            Positive Valence
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300">
            Low Mood / Sadness
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
            Anxiety / Overwhelm
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300">
            Anger / Frustration
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-200 dark:bg-red-950 text-red-800 dark:text-red-200">
            Crisis Indicator
          </span>
        </div>
      )}

      {/* Highlighted text canvas */}
      <div className="p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm text-sm leading-relaxed whitespace-pre-wrap">
        <TooltipProvider delayDuration={150}>
          {tokens.map((token, idx) => {
            if (!showHeatmap || !token.isWord || !token.meta || token.meta.category === 'neutral') {
              return <span key={idx}>{token.text}</span>;
            }

            return (
              <Tooltip key={idx}>
                <TooltipTrigger asChild>
                  <span className={`cursor-help transition-colors ${categoryStyles[token.meta.category]}`}>
                    {token.text}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs p-2 max-w-xs shadow-lg">
                  <p className="font-semibold text-foreground">{token.meta.word}</p>
                  <p className="text-muted-foreground">{token.meta.label}</p>
                  <Badge variant="outline" className="mt-1 text-[10px]">
                    Influence: {token.meta.weight}
                  </Badge>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}

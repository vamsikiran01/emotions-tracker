import { useMemo } from 'react';
import { Brain, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { processTextNLP } from '@/lib/nlpProcessor';
import type { NLPResult } from '@/lib/nlpProcessor';

interface NLPAnalysisCardProps {
  text: string;
}

const NLPAnalysisCard = ({ text }: NLPAnalysisCardProps) => {
  const nlpResult: NLPResult = useMemo(() => processTextNLP(text), [text]);

  return (
    <Card className="shadow-md border-border/50 animate-fade-slide-up stagger-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" /> NLP Text Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Token stats */}
        <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
          <div className="bg-muted/40 rounded-lg px-3 py-2">
            <span className="text-muted-foreground">Tokens: </span>
            <span className="font-semibold text-foreground">{nlpResult.totalTokens}</span>
          </div>
          <div className="bg-muted/40 rounded-lg px-3 py-2">
            <span className="text-muted-foreground">Unique: </span>
            <span className="font-semibold text-foreground">{nlpResult.uniqueTokens}</span>
          </div>
          <div className="bg-muted/40 rounded-lg px-3 py-2">
            <span className="text-muted-foreground">Vocabulary Richness: </span>
            <span className="font-semibold text-foreground">{nlpResult.vocabularyRichness}%</span>
          </div>
        </div>

        {/* TF-IDF Keywords */}
        {nlpResult.keywords.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Top Keywords (TF-IDF)</p>
            <div className="flex flex-wrap gap-1.5">
              {nlpResult.keywords.map((kw) => (
                <Badge key={kw.word} variant="secondary" className="text-xs">
                  {kw.word}
                  <span className="ml-1 opacity-60">{kw.score}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Bigrams / Key Phrases */}
        {nlpResult.bigrams.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Key Phrases Detected</p>
            <div className="flex flex-wrap gap-1.5">
              {nlpResult.bigrams.map((bg) => (
                <Badge key={bg} variant="outline" className="text-xs">
                  "{bg}"
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* POS Breakdown */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">POS Breakdown</p>
          <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
            <span className="bg-muted/40 rounded-lg px-3 py-1.5">
              <span className="text-muted-foreground">Nouns: </span>
              <span className="font-semibold text-foreground">{nlpResult.pos.nouns}</span>
            </span>
            <span className="bg-muted/40 rounded-lg px-3 py-1.5">
              <span className="text-muted-foreground">Verbs: </span>
              <span className="font-semibold text-foreground">{nlpResult.pos.verbs}</span>
            </span>
            <span className="bg-muted/40 rounded-lg px-3 py-1.5">
              <span className="text-muted-foreground">Adj: </span>
              <span className="font-semibold text-foreground">{nlpResult.pos.adjectives}</span>
            </span>
            <span className="bg-muted/40 rounded-lg px-3 py-1.5">
              <span className="text-muted-foreground">Adv: </span>
              <span className="font-semibold text-foreground">{nlpResult.pos.adverbs}</span>
            </span>
          </div>
        </div>

        {/* Negations */}
        {nlpResult.negations.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Negations Detected</p>
            <div className="flex flex-wrap gap-1.5">
              {nlpResult.negations.map((neg, i) => (
                <Badge key={i} variant="destructive" className="text-xs font-normal">
                  "{neg}"
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Dataset Keyword Matches */}
        {nlpResult.datasetMatches.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Database className="h-3 w-3" /> Dataset Keyword Matches
            </p>
            <div className="space-y-2">
              {nlpResult.datasetMatches.map((match) => (
                <div key={match.status}>
                  <Badge variant="default" className="text-xs mb-1">
                    {match.status}: {match.matchCount} match{match.matchCount !== 1 ? 'es' : ''}
                  </Badge>
                  <div className="flex flex-wrap gap-1 ml-1">
                    {match.matchedWords.map((word) => (
                      <Badge key={word} variant="outline" className="text-xs font-normal">
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NLPAnalysisCard;

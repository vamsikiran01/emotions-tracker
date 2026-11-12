import { useState } from 'react';
import { Layers, Database, ShieldCheck, Sparkles, Cpu, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export default function TechArchitectureModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs rounded-full border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary"
        >
          <Cpu className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">System Architecture</span>
          <span className="sm:hidden">Tech</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
              Capstone Research & Architecture
            </Badge>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2 pt-1">
            <Layers className="h-5 w-5 text-primary" />
            Emo Track: Technical Architecture
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            A production-grade, hybrid NLP & LLM affective computing architecture for longitudinal mental health journaling.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs sm:text-sm">
          {/* Dual-Engine Section */}
          <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" /> Hybrid Dual-Engine Inference Pipeline
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-card border border-border/50 space-y-1.5">
                <span className="font-semibold text-primary">1. Client-Side NLP Engine</span>
                <p className="text-muted-foreground leading-relaxed">
                  Uses <strong>Compromise.js</strong> for zero-latency tokenization, verb infinitives, singular nouns, and POS tagging. Computes single-document TF scores, negation pairing, and CBT cognitive distortions locally in the browser.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-card border border-border/50 space-y-1.5">
                <span className="font-semibold text-primary">2. Edge LLM Function Calling</span>
                <p className="text-muted-foreground leading-relaxed">
                  Supabase Deno Edge Functions invoke <strong>Google Gemini 3 Flash Preview</strong> at zero temperature with strict JSON schema tool-calling, delivering high clinical precision and empathetic reasoning.
                </p>
              </div>
            </div>
          </div>

          {/* Dataset Benchmark */}
          <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" /> 51,000+ Kaggle Clinical Benchmark
              </h4>
              <a
                href="https://www.kaggle.com/datasets/suchintikasarkar/sentiment-analysis-for-mental-health"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-primary hover:underline flex items-center gap-1"
              >
                Kaggle Dataset <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Aligned with the <em>"Sentiment Analysis for Mental Health"</em> benchmark across 7 diagnostic categories:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Normal', 'Depression', 'Suicidal', 'Anxiety', 'Stress', 'Bipolar', 'Personality Disorder'].map(label => (
                <Badge key={label} variant="secondary" className="text-[11px]">
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Security & RLS */}
          <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Privacy, Security & Data Isolation
            </h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground leading-relaxed">
              <li><strong>PostgreSQL Row Level Security (RLS):</strong> Every query is strictly isolated to the authenticated user ID (<code className="text-primary">auth.uid() = user_id</code>).</li>
              <li><strong>Secure Voice Buckets:</strong> Recorded audio is isolated by user folder in Supabase Storage and accessed only via short-lived signed URLs.</li>
              <li><strong>Zero Permanent Exposure:</strong> API credentials run in secure Deno Edge Functions, never leaked to the client browser.</li>
            </ul>
          </div>

          {/* Technology stack pill summary */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            {['React 18', 'TypeScript', 'Vite 5', 'Tailwind CSS', 'shadcn/ui', 'Supabase PostgREST 14.1', 'Google Gemini Flash', 'Compromise NLP', 'Web Audio API', 'PWA'].map(tech => (
              <span key={tech} className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[11px] font-medium">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

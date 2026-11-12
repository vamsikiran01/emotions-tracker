export interface CognitiveDistortion {
  id: string;
  name: string;
  description: string;
  reframePrompt: string;
  matchedPhrases: string[];
  severity: 'mild' | 'moderate' | 'notable';
}

interface DistortionRule {
  id: string;
  name: string;
  description: string;
  reframePrompt: string;
  severity: 'mild' | 'moderate' | 'notable';
  patterns: RegExp[];
}

const DISTORTION_RULES: DistortionRule[] = [
  {
    id: 'all_or_nothing',
    name: 'All-or-Nothing Thinking',
    description: 'Viewing situations in black-and-white absolutes rather than shades of grey.',
    reframePrompt: 'Notice words like "always", "never", or "completely". Are there exceptions or middle ground in this situation?',
    severity: 'moderate',
    patterns: [
      /\b(always|never|every\s*single\s*time|nothing\s*ever|nobody\s*cares|everyone\s*hates|complete\s*(failure|disaster)|totally\s*useless|100%\s*ruined)\b/gi,
    ],
  },
  {
    id: 'catastrophizing',
    name: 'Catastrophizing',
    description: 'Anticipating the worst possible outcome and magnifying its consequences.',
    reframePrompt: 'Ask yourself: What is the most realistic outcome, and what coping steps would you take if things went wrong?',
    severity: 'notable',
    patterns: [
      /\b(end\s*of\s*the\s*world|worst\s*(thing|day|nightmare)|ruined\s*forever|can't\s*survive\s*this|everything\s*is\s*lost|unbearable|hopeless\s*mess|ruined\s*my\s*life)\b/gi,
    ],
  },
  {
    id: 'overgeneralization',
    name: 'Overgeneralization',
    description: 'Extracting a global negative rule from a single isolated event.',
    reframePrompt: 'Remember that a single difficult event does not dictate your permanent pattern or future.',
    severity: 'mild',
    patterns: [
      /\b(i\s*always\s*mess\s*up|this\s*always\s*happens|never\s*going\s*to\s*work|every\s*time\s*i\s*try|pattern\s*never\s*changes)\b/gi,
    ],
  },
  {
    id: 'emotional_reasoning',
    name: 'Emotional Reasoning',
    description: 'Assuming that negative emotions necessarily reflect objective reality.',
    reframePrompt: 'Feelings are real, but they are not always facts. What objective evidence exists beside this feeling?',
    severity: 'moderate',
    patterns: [
      /\b(i\s*feel\s*(like\s*a\s*failure|useless|stupid|worthless|hopeless)\s*so|because\s*i\s*feel|feel\s*it\s*so\s*it\s*must\s*be)\b/gi,
    ],
  },
  {
    id: 'personalization',
    name: 'Personalization & Self-Blame',
    description: 'Holding yourself personally responsible for events outside your total control.',
    reframePrompt: 'Identify external factors and other influences beyond your direct control in this situation.',
    severity: 'moderate',
    patterns: [
      /\b(all\s*my\s*fault|i\s*ruined\s*it\s*for\s*everyone|blame\s*myself|because\s*of\s*me\s*everything|i'm\s*the\s*problem)\b/gi,
    ],
  },
  {
    id: 'mental_filter',
    name: 'Negative Mental Filter',
    description: 'Dwelling exclusively on the negatives while filtering out any positive or neutral aspects.',
    reframePrompt: 'Intentionally pause and identify at least one small positive or neutral aspect of today.',
    severity: 'mild',
    patterns: [
      /\b(nothing\s*went\s*right|only\s*bad\s*things|nothing\s*good\s*happens|ignoring\s*the\s*good|ruined\s*the\s*whole\s*day)\b/gi,
    ],
  },
];

export function detectCognitiveDistortions(text: string): CognitiveDistortion[] {
  if (!text || text.trim().length === 0) return [];
  const results: CognitiveDistortion[] = [];

  for (const rule of DISTORTION_RULES) {
    const matchedPhrases: string[] = [];
    for (const pattern of rule.patterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const m of matches) {
          const clean = m.trim().toLowerCase();
          if (!matchedPhrases.includes(clean)) {
            matchedPhrases.push(clean);
          }
        }
      }
    }

    if (matchedPhrases.length > 0) {
      results.push({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        reframePrompt: rule.reframePrompt,
        severity: rule.severity,
        matchedPhrases: matchedPhrases.slice(0, 3),
      });
    }
  }

  return results;
}

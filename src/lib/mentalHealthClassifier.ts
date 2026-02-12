export type MentalHealthStatus = 
  | 'Normal' 
  | 'Depression' 
  | 'Suicidal' 
  | 'Anxiety' 
  | 'Stress' 
  | 'Bipolar' 
  | 'Personality disorder';

export interface MentalHealthResult {
  status: MentalHealthStatus;
  confidence: number;
  explanation: string;
  sampleStatements: string[];
}

export const STATUS_META: Record<MentalHealthStatus, { emoji: string; color: string; label: string; description: string }> = {
  Normal: { emoji: '🟢', color: 'hsl(142, 55%, 49%)', label: 'Normal', description: 'No significant mental health concerns detected' },
  Depression: { emoji: '🔵', color: 'hsl(220, 60%, 55%)', label: 'Depression', description: 'Patterns consistent with depressive symptoms' },
  Suicidal: { emoji: '🔴', color: 'hsl(0, 72%, 50%)', label: 'Suicidal Ideation', description: 'Language suggesting self-harm or suicidal thoughts detected' },
  Anxiety: { emoji: '🟡', color: 'hsl(45, 85%, 50%)', label: 'Anxiety', description: 'Patterns consistent with anxiety symptoms' },
  Stress: { emoji: '🟠', color: 'hsl(25, 70%, 55%)', label: 'Stress', description: 'Signs of elevated stress or burnout' },
  Bipolar: { emoji: '🟣', color: 'hsl(280, 50%, 55%)', label: 'Bipolar', description: 'Mixed emotional patterns with rapid shifts' },
  'Personality disorder': { emoji: '🔶', color: 'hsl(35, 80%, 50%)', label: 'Personality Disorder', description: 'Patterns suggesting personality-related concerns' },
};

const STATUS_KEYWORDS: Record<MentalHealthStatus, { words: string[]; weight: number }[]> = {
  Normal: [
    { words: ['fine', 'good', 'okay', 'well', 'normal', 'happy', 'great', 'wonderful', 'enjoying', 'content', 'satisfied', 'peaceful', 'calm', 'relaxed', 'balanced', 'grateful', 'blessed', 'positive', 'productive', 'comfortable'], weight: 1.0 },
    { words: ['routine', 'usual', 'regular', 'typical', 'average', 'steady', 'stable', 'managed'], weight: 0.5 },
  ],
  Depression: [
    { words: ['depressed', 'depression', 'hopeless', 'worthless', 'empty', 'numb', 'meaningless', 'pointless', 'dark', 'darkness', 'void', 'hollow', 'miserable', 'despair', 'lonely', 'isolated', 'withdrawn', 'apathy', 'unmotivated', 'exhausted', 'drained', 'fatigue', 'insomnia', 'oversleep', 'appetite', 'weight gain', 'weight loss', 'crying', 'tearful', 'guilt', 'ashamed', 'burden', 'failure', 'useless'], weight: 1.0 },
    { words: ['sad', 'unhappy', 'down', 'low', 'blue', 'gloomy', 'melancholy', 'heavy', 'tired', 'cant concentrate', 'no energy', 'no motivation', 'lost interest', 'dont care', 'nothing matters'], weight: 0.7 },
  ],
  Suicidal: [
    { words: ['suicide', 'suicidal', 'kill myself', 'end my life', 'want to die', 'better off dead', 'no reason to live', 'ending it', 'overdose', 'jump off', 'hang myself', 'slit', 'self harm', 'self-harm', 'cut myself', 'hurt myself', 'not worth living', 'give up on life', 'final goodbye', 'last note', 'farewell'], weight: 1.5 },
    { words: ['dont want to live', "don't want to live", 'no point in living', 'nothing left', 'no hope', 'cant go on', 'cant take it anymore', 'end the pain', 'permanent solution', 'planning to die'], weight: 1.2 },
  ],
  Anxiety: [
    { words: ['anxious', 'anxiety', 'worried', 'worrying', 'panic', 'panic attack', 'nervous', 'restless', 'uneasy', 'apprehensive', 'dread', 'phobia', 'obsessive', 'compulsive', 'intrusive thoughts', 'racing thoughts', 'overthinking', 'hyperventilate', 'heart racing', 'sweating', 'trembling', 'shaking', 'dizzy', 'chest tight', 'cant breathe', 'suffocating'], weight: 1.0 },
    { words: ['what if', 'fear', 'afraid', 'scared', 'tense', 'on edge', 'jumpy', 'startled', 'vigilant', 'paranoid', 'irrational', 'catastrophize', 'worst case'], weight: 0.7 },
  ],
  Stress: [
    { words: ['stressed', 'stress', 'overwhelmed', 'overworked', 'burnout', 'burnt out', 'exhausted', 'pressure', 'deadline', 'workload', 'too much', 'cant handle', 'breaking point', 'snapping', 'tension', 'headache', 'migraine', 'insomnia', 'cant sleep', 'grinding', 'hustle', 'demanding', 'overloaded'], weight: 1.0 },
    { words: ['busy', 'hectic', 'chaotic', 'juggling', 'struggling', 'coping', 'managing', 'surviving', 'drowning', 'suffocating', 'trapped', 'stuck', 'frustrated', 'irritable', 'snappy'], weight: 0.6 },
  ],
  Bipolar: [
    { words: ['bipolar', 'manic', 'mania', 'hypomania', 'mood swings', 'mood swing', 'rapid cycling', 'highs and lows', 'ups and downs', 'euphoria', 'grandiose', 'impulsive', 'reckless', 'sleepless', 'racing thoughts', 'irritable', 'agitated', 'depressive episode', 'manic episode', 'mixed episode', 'lithium', 'mood stabilizer'], weight: 1.2 },
    { words: ['unstable', 'unpredictable', 'erratic', 'extreme', 'intense', 'fluctuating', 'volatile', 'swinging', 'roller coaster', 'one moment', 'next moment'], weight: 0.6 },
  ],
  'Personality disorder': [
    { words: ['personality disorder', 'borderline', 'bpd', 'narcissist', 'narcissistic', 'antisocial', 'avoidant', 'dependent', 'histrionic', 'schizoid', 'paranoid personality', 'splitting', 'idealize', 'devalue', 'abandonment', 'fear of abandonment', 'identity disturbance', 'dissociation', 'dissociative', 'emotional dysregulation', 'impulsive behavior'], weight: 1.2 },
    { words: ['unstable relationships', 'intense emotions', 'emptiness', 'self-image', 'identity crisis', 'black and white thinking', 'all or nothing', 'manipulative', 'controlling', 'codependent', 'attachment issues', 'toxic pattern', 'self-destructive'], weight: 0.7 },
  ],
};

const SAMPLE_STATEMENTS: Record<MentalHealthStatus, string[]> = {
  Normal: [
    "Had a productive day at work and enjoyed dinner with family.",
    "Feeling good about my progress on personal goals this week.",
    "Went for a walk in the park, weather was beautiful today.",
  ],
  Depression: [
    "I feel so empty inside, like nothing brings me joy anymore.",
    "I can't get out of bed. Everything feels pointless and I'm so tired of pretending to be okay.",
    "I've lost interest in everything I used to love. The days just blur together.",
  ],
  Suicidal: [
    "I don't see the point in continuing. The world would be better without me.",
    "I've been thinking about ending it all. I just can't take the pain anymore.",
    "Nobody would miss me if I were gone. I'm just a burden to everyone.",
  ],
  Anxiety: [
    "My heart won't stop racing and I keep thinking something terrible is about to happen.",
    "I can't stop worrying about everything. My mind won't quiet down.",
    "I had another panic attack today. I thought I was dying.",
  ],
  Stress: [
    "The workload is crushing me. I haven't slept properly in weeks.",
    "I feel like I'm juggling too many things and about to drop everything.",
    "The pressure from work and home is becoming unbearable.",
  ],
  Bipolar: [
    "One day I feel on top of the world, the next I can't get out of bed.",
    "My mood swings are getting worse. I went from euphoric to devastated in hours.",
    "During my manic phases I feel invincible, but the crashes are devastating.",
  ],
  'Personality disorder': [
    "I push everyone away and then hate myself for being alone.",
    "My emotions are so intense that I feel out of control most of the time.",
    "I can't maintain stable relationships. I either idealize people or despise them.",
  ],
};

export function classifyMentalHealth(text: string): MentalHealthResult {
  const lower = text.toLowerCase();
  const tokens = lower.replace(/[^\w\s'-]/g, ' ').split(/\s+/).filter(w => w.length > 1);

  const scores: Record<MentalHealthStatus, number> = {
    Normal: 0,
    Depression: 0,
    Suicidal: 0,
    Anxiety: 0,
    Stress: 0,
    Bipolar: 0,
    'Personality disorder': 0,
  };

  for (const [status, groups] of Object.entries(STATUS_KEYWORDS) as [MentalHealthStatus, typeof STATUS_KEYWORDS[MentalHealthStatus]][]) {
    for (const group of groups) {
      for (const word of group.words) {
        const matches = word.includes(' ')
          ? (lower.includes(word) ? 1 : 0)
          : tokens.filter(t => t === word || t.startsWith(word)).length;
        if (matches > 0) {
          scores[status] += matches * group.weight;
        }
      }
    }
  }

  // Default to Normal if no strong signals
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  if (totalScore < 1) {
    scores.Normal += 2;
  }

  const sorted = (Object.entries(scores) as [MentalHealthStatus, number][]).sort((a, b) => b[1] - a[1]);
  const status = sorted[0][0];
  const maxScore = sorted[0][1];

  const rawConfidence = Math.min(maxScore / (totalScore || 1), 1);
  const confidence = Math.round(Math.max(45, Math.min(95, rawConfidence * 100 + (Math.random() * 8 - 4))));

  const meta = STATUS_META[status];
  const explanation = meta.description;
  const sampleStatements = SAMPLE_STATEMENTS[status];

  return {
    status,
    confidence,
    explanation,
    sampleStatements,
  };
}

// Mapping from dataset status to app emotion types
export const STATUS_TO_EMOTION: Record<MentalHealthStatus, string> = {
  Normal: 'happy',
  Depression: 'sad',
  Suicidal: 'sad',
  Anxiety: 'anxious',
  Stress: 'anxious',
  Bipolar: 'sad',
  'Personality disorder': 'fear',
};

export type EmotionType = 'happy' | 'sad' | 'angry' | 'fear' | 'surprise' | 'love' | 'anxious' | 'neutral';
export type SentimentType = 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
export type IntensityLevel = 'Low' | 'Medium' | 'High';

import { classifyMentalHealth, type MentalHealthResult } from './mentalHealthClassifier';
import { processTextNLP } from './nlpProcessor';
import { supabase } from '@/integrations/supabase/client';

export interface EmotionResult {
  primaryEmotion: EmotionType;
  confidence: number;
  sentiment: SentimentType;
  keywords: string[];
  intensity: IntensityLevel;
  insight: string;
  suggestions: string[];
  safetyAlert: boolean;
  safetyMessage?: string;
  mentalHealthStatus?: MentalHealthResult;
}

export const EMOTION_META: Record<EmotionType, { emoji: string; color: string; label: string }> = {
  happy: { emoji: '😊', color: 'var(--emotion-happy)', label: 'Happy' },
  sad: { emoji: '😢', color: 'var(--emotion-sad)', label: 'Sad' },
  angry: { emoji: '😡', color: 'var(--emotion-angry)', label: 'Angry' },
  fear: { emoji: '😨', color: 'var(--emotion-fear)', label: 'Fear' },
  surprise: { emoji: '😲', color: 'var(--emotion-surprise)', label: 'Surprise' },
  love: { emoji: '❤️', color: 'var(--emotion-love)', label: 'Love' },
  anxious: { emoji: '😰', color: 'var(--emotion-anxious)', label: 'Anxious' },
  neutral: { emoji: '😐', color: 'var(--emotion-neutral)', label: 'Neutral' },
};

const KEYWORD_MAP: Record<EmotionType, { words: string[]; weight: number }[]> = {
  happy: [
    { words: ['happy', 'joy', 'excited', 'thrilled', 'wonderful', 'great', 'amazing', 'fantastic', 'delighted', 'cheerful', 'glad', 'blessed', 'grateful', 'thankful', 'celebrate', 'laugh', 'smile', 'fun', 'enjoy', 'pleased', 'ecstatic', 'elated', 'blissful', 'content', 'satisfied', 'optimistic', 'positive', 'bright', 'sunshine', 'vibrant'], weight: 1.0 },
    { words: ['good', 'nice', 'well', 'fine', 'okay', 'better', 'awesome', 'cool', 'sweet', 'yay'], weight: 0.6 },
  ],
  sad: [
    { words: ['sad', 'depressed', 'unhappy', 'miserable', 'heartbroken', 'devastated', 'grief', 'mourning', 'loss', 'cry', 'crying', 'tears', 'lonely', 'alone', 'empty', 'hopeless', 'despair', 'sorrow', 'melancholy', 'gloomy', 'down', 'blue', 'broken', 'hurt', 'pain', 'suffering', 'tired', 'exhausted', 'drained', 'numb', 'difficult', 'accident', 'shook', 'wrong', 'recover', 'worse', 'bad day', 'tough', 'hard day', 'rough', 'terrible day', 'awful day', 'struggling', 'blood', 'scolded', 'unappreciated', 'ignored', 'rejected', 'criticized', 'unloved', 'unseen', 'unheard', 'worthless', 'invisible', 'forgotten', 'die', 'dying', 'dead', 'death', 'disturbed', 'distressed', 'tormented', 'agony', 'anguish'], weight: 1.0 },
    { words: ['miss', 'missing', 'wish', 'regret', 'sorry', 'disappointed', 'unfortunate', 'heavy', 'wasn\'t a good day', 'not a good day', 'hope tomorrow', 'rest and recover', 'no one cares', "doesn't matter", 'not enough', 'never enough', 'taken for granted', 'wasted effort'], weight: 0.6 },
  ],
  angry: [
    { words: ['angry', 'furious', 'rage', 'mad', 'annoyed', 'irritated', 'frustrated', 'hate', 'disgusted', 'outraged', 'livid', 'hostile', 'aggressive', 'bitter', 'resentful', 'enraged', 'infuriated', 'seething', 'fuming'], weight: 1.0 },
    { words: ['unfair', 'stupid', 'ridiculous', 'terrible', 'worst', 'awful', 'toxic', 'betrayed', 'scolded', 'criticized', 'mocked', 'ridiculed', 'dismissed'], weight: 0.6 },
  ],
  fear: [
    { words: ['afraid', 'scared', 'terrified', 'frightened', 'panic', 'horror', 'dread', 'phobia', 'nightmare', 'alarmed', 'petrified', 'trembling', 'shaking', 'haunted', 'threatened', 'uneasy', 'shook', 'shocking'], weight: 1.0 },
    { words: ['danger', 'risky', 'uncertain', 'unknown', 'dark', 'creepy', 'eerie', 'unsafe', 'not in our control', 'went wrong', 'things went wrong'], weight: 0.6 },
  ],
  surprise: [
    { words: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'unexpected', 'unbelievable', 'incredible', 'wow', 'whoa', 'speechless', 'bewildered', 'startled'], weight: 1.0 },
    { words: ['suddenly', 'never expected', 'out of nowhere', 'plot twist', 'jaw dropped', 'so quickly', 'one moment'], weight: 0.6 },
  ],
  love: [
    { words: ['love', 'adore', 'cherish', 'affection', 'romance', 'passionate', 'intimate', 'devotion', 'sweetheart', 'darling', 'beloved', 'crush', 'soulmate', 'heart', 'caring', 'tender', 'warmth', 'embrace', 'kiss', 'hug'], weight: 1.0 },
    { words: ['appreciate', 'admire', 'fond', 'close', 'bond', 'connection', 'special', 'treasure'], weight: 0.6 },
  ],
  anxious: [
    { words: ['anxious', 'anxiety', 'worried', 'nervous', 'stress', 'stressed', 'tense', 'restless', 'uneasy', 'overwhelmed', 'overthinking', 'racing thoughts', 'cant sleep', 'insomnia', 'pressure', 'burden', 'suffocating', 'panic attack', 'chest tight', 'breathing', 'replaying'], weight: 1.0 },
    { words: ['what if', 'concern', 'doubt', 'uncertain', 'deadline', 'too much', 'cant handle', 'struggling', 'keep replaying'], weight: 0.6 },
  ],
  neutral: [],
};

// Flat set of all emotion-related words for quick lookup
export const EMOTION_WORDS_SET: Set<string> = new Set(
  (Object.entries(KEYWORD_MAP) as [EmotionType, { words: string[]; weight: number }[]][])
    .filter(([key]) => key !== 'neutral')
    .flatMap(([, groups]) => groups.flatMap(g => g.words.filter(w => !w.includes(' '))))
);

const SAFETY_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die', 'dont want to live',
  "don't want to live", 'self harm', 'self-harm', 'cut myself', 'hurt myself',
  'no reason to live', 'better off dead', 'ending it all', 'give up on life',
  'nothing left', 'no point in living', 'worthless', 'no hope',
];

const INSIGHTS: Record<EmotionType, string[]> = {
  happy: [
    "Your entry radiates positivity and joy. The language you've used suggests a deep sense of fulfillment and contentment in your current experiences.",
    "There's a beautiful sense of gratitude and happiness flowing through your words. You seem to be in a wonderful emotional space right now.",
    "Your writing reflects genuine happiness and enthusiasm. These positive emotions are worth savoring and remembering.",
  ],
  sad: [
    "Your entry reflects emotional exhaustion and feelings of isolation. The language suggests mental fatigue and a need for emotional support.",
    "There's a deep sense of sadness woven through your words. It's completely okay to feel this way, and acknowledging it is a brave first step.",
    "Your writing conveys a heaviness of heart. Remember that these feelings are temporary and reaching out for support is a sign of strength.",
  ],
  angry: [
    "Your words carry strong feelings of frustration and anger. These emotions are valid and recognizing them is important for processing them healthily.",
    "There's significant emotional intensity in your entry. The anger you're feeling likely stems from unmet needs or boundaries being crossed.",
    "Your writing reflects deep frustration. It's important to acknowledge these feelings while finding constructive ways to channel this energy.",
  ],
  fear: [
    "Your entry reveals underlying fears and anxiety about uncertain situations. These feelings are natural and acknowledging them takes courage.",
    "There's a sense of vulnerability in your words. Fear is a protective emotion, and understanding its source can help you feel more grounded.",
    "Your writing suggests you're navigating some frightening territory. Remember that facing fears, even just in writing, is incredibly brave.",
  ],
  surprise: [
    "Your entry captures a moment of genuine surprise and wonder. These unexpected experiences often become our most memorable moments.",
    "There's an exciting sense of the unexpected in your words. Surprise can be a powerful catalyst for new perspectives and growth.",
    "Your writing reflects astonishment at recent events. Embracing the unexpected with curiosity can lead to wonderful discoveries.",
  ],
  love: [
    "Your entry overflows with warmth and deep affection. The love you're expressing enriches both your life and those around you.",
    "There's a beautiful tenderness in your words. Love in all its forms is one of the most healing emotions we can experience.",
    "Your writing radiates genuine care and connection. These feelings of love are precious and worth nurturing.",
  ],
  anxious: [
    "Your entry reveals significant worry and mental tension. The anxious thoughts you're experiencing can feel overwhelming, but they are manageable.",
    "There's a restless energy in your words that suggests your mind is racing. Anxiety often amplifies our concerns beyond their actual scope.",
    "Your writing reflects a state of heightened worry. Remember that anxiety, while uncomfortable, is your mind trying to protect you.",
  ],
  neutral: [
    "Your entry seems calm and grounded. Sometimes just checking in with yourself is enough.",
    "There's a steady, balanced tone in what you've shared. Not every moment needs to be intense — this is okay.",
    "Your words reflect a neutral state of mind. This can be a good foundation for reflection and self-awareness.",
  ],
};

const SUGGESTIONS: Record<EmotionType, string[]> = {
  happy: [
    "📝 Try gratitude journaling — write down 3 things you're thankful for today",
    "🎉 Celebrate your small wins and share your joy with someone you care about",
    "📸 Capture this moment — take a photo or write a detailed memory to revisit later",
    "🌟 Use this positive energy to set a new goal or start something you've been putting off",
  ],
  sad: [
    "🫂 Reach out to someone you trust — sharing your feelings can lighten the burden",
    "🛁 Practice gentle self-care: take a warm bath, make your favorite tea, or wrap up in a cozy blanket",
    "🚶 A short walk outside, even just 10 minutes, can help shift your perspective",
    "✍️ Write a letter to yourself with the same compassion you'd show a close friend",
  ],
  angry: [
    "🧘 Try the 4-7-8 breathing technique: inhale for 4 seconds, hold for 7, exhale for 8",
    "🚶 Take a brisk walk or do some physical exercise to channel the energy constructively",
    "📝 Write down what triggered your anger — naming it can help diminish its power",
    "🎵 Listen to calming music or sounds of nature for 10 minutes",
  ],
  fear: [
    "🌿 Try the 5-4-3-2-1 grounding exercise: name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste",
    "💭 Challenge your fears by asking: 'What evidence do I have? What's the most likely outcome?'",
    "🫂 Share your concerns with someone you trust — fears often shrink when spoken aloud",
    "📖 Remind yourself of past challenges you've overcome successfully",
  ],
  surprise: [
    "📝 Journal about how this surprise made you feel and what you learned from it",
    "🧘 Take a moment to sit with the feeling before reacting — mindful pauses create clarity",
    "💬 Share your experience with someone — talking about surprises helps us process them",
    "🌟 Consider how this unexpected event might open new doors or possibilities",
  ],
  love: [
    "💌 Express your feelings — write a heartfelt note to someone you love",
    "🤗 Practice showing appreciation through small acts of kindness today",
    "📝 Reflect on what love means to you and how it enriches your daily life",
    "🌷 Nurture this feeling by planning a meaningful gesture for someone special",
  ],
  anxious: [
    "🫁 Practice the 4-7-8 breathing technique: inhale 4s, hold 7s, exhale 8s — repeat 4 times",
    "📋 Break overwhelming tasks into tiny, manageable steps — tackle just the first one",
    "🧊 Try the ice cube technique: hold an ice cube to engage your senses and ground yourself",
    "🚫 Limit news and social media for the rest of today — give your mind a break",
  ],
  neutral: [
    "📝 Take a moment to reflect — write down one thing you're grateful for today",
    "🚶 Go for a short walk and observe what's around you with fresh eyes",
    "☕ Enjoy a quiet moment with your favorite drink — just be present",
    "🎵 Put on some music you enjoy and let yourself relax",
  ],
};

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^\w\s'-]/g, ' ').split(/\s+/).filter(w => w.length > 1);
}

function detectSafety(text: string): { alert: boolean; message?: string } {
  const lower = text.toLowerCase();
  const found = SAFETY_KEYWORDS.some(kw => lower.includes(kw));
  if (found) {
    return {
      alert: true,
      message: "We noticed some words in your entry that suggest you may be going through a very difficult time. Please know that you are not alone, and your feelings matter. We gently encourage you to reach out to someone you trust — a friend, family member, or a professional who can offer support. You deserve care and compassion, especially right now. 💙",
    };
  }
  return { alert: false };
}

export function analyzeEmotion(text: string): EmotionResult {
  const tokens = tokenize(text);
  const lower = text.toLowerCase();
  const scores: Record<EmotionType, number> = {
    happy: 0, sad: 0, angry: 0, fear: 0, surprise: 0, love: 0, anxious: 0, neutral: 0,
  };

  // Emoji/symbol detection
  const emojiMap: { emoji: string; emotion: EmotionType; boost: number }[] = [
    { emoji: '💔', emotion: 'sad', boost: 2 },
    { emoji: '😢', emotion: 'sad', boost: 1.5 },
    { emoji: '😭', emotion: 'sad', boost: 2 },
    { emoji: '💀', emotion: 'sad', boost: 1 },
    { emoji: '😡', emotion: 'angry', boost: 2 },
    { emoji: '🤬', emotion: 'angry', boost: 2 },
    { emoji: '😨', emotion: 'fear', boost: 2 },
    { emoji: '😰', emotion: 'anxious', boost: 2 },
    { emoji: '❤️', emotion: 'love', boost: 2 },
    { emoji: '😊', emotion: 'happy', boost: 1.5 },
  ];
  for (const { emoji, emotion, boost } of emojiMap) {
    if (text.includes(emoji)) {
      scores[emotion] += boost;
    }
  }
  const matchedKeywords: Record<EmotionType, string[]> = {
    happy: [], sad: [], angry: [], fear: [], surprise: [], love: [], anxious: [], neutral: [],
  };

  for (const [emotion, groups] of Object.entries(KEYWORD_MAP) as [EmotionType, typeof KEYWORD_MAP[EmotionType]][]) {
    for (const group of groups) {
      for (const word of group.words) {
        const matches = word.includes(' ')
          ? (lower.includes(word) ? 1 : 0)
          : tokens.filter(t => t === word || t.startsWith(word)).length;
        if (matches > 0) {
          scores[emotion] += matches * group.weight;
          if (!matchedKeywords[emotion].includes(word)) {
            matchedKeywords[emotion].push(word);
          }
        }
      }
    }
  }

  // Safety check — if crisis language detected, bias toward sad
  const safety = detectSafety(text);
  if (safety.alert) {
    scores.sad += 3;
  }

  // Default to neutral if no strong signals
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  if (totalScore < 1) {
    scores.neutral += 2;
  }

  // Find primary emotion
  const sorted = (Object.entries(scores) as [EmotionType, number][]).sort((a, b) => b[1] - a[1]);
  const primaryEmotion = sorted[0][0];
  const maxScore = sorted[0][1];

  // Confidence (normalized with some randomness for realism)
  const rawConfidence = Math.min(maxScore / (totalScore || 1), 1);
  const confidence = Math.round(Math.max(55, Math.min(98, rawConfidence * 100 + (Math.random() * 10 - 5))));

  // Keywords — top 3 from primary emotion, fallback to tokens
  let keywords = matchedKeywords[primaryEmotion].slice(0, 3);
  if (keywords.length < 3) {
    const extraWords = tokens.filter(t => t.length > 3 && !keywords.includes(t));
    keywords = [...keywords, ...extraWords.slice(0, 3 - keywords.length)];
  }

  // Sentiment
  const posEmotions: EmotionType[] = ['happy', 'love', 'surprise'];
  const negEmotions: EmotionType[] = ['sad', 'angry', 'fear', 'anxious'];
  const posScore = posEmotions.reduce((s, e) => s + scores[e], 0);
  const negScore = negEmotions.reduce((s, e) => s + scores[e], 0);
  let sentiment: SentimentType = 'Neutral';
  if (posScore > 0 && negScore > 0 && Math.abs(posScore - negScore) < 2) sentiment = 'Mixed';
  else if (posScore > negScore) sentiment = 'Positive';
  else if (negScore > posScore) sentiment = 'Negative';

  // Intensity
  let intensity: IntensityLevel = 'Low';
  if (maxScore >= 5) intensity = 'High';
  else if (maxScore >= 2) intensity = 'Medium';

  // Insight
  const insightOptions = INSIGHTS[primaryEmotion];
  const insight = insightOptions[Math.floor(Math.random() * insightOptions.length)];

  // Suggestions — pick 2-3
  const allSuggestions = SUGGESTIONS[primaryEmotion];
  const shuffled = [...allSuggestions].sort(() => Math.random() - 0.5);
  const suggestions = shuffled.slice(0, 3);

  // Safety already computed above

  // Mental health classification
  const mentalHealthStatus = classifyMentalHealth(text);

  return {
    primaryEmotion,
    confidence,
    sentiment,
    keywords,
    intensity,
    insight,
    suggestions,
    safetyAlert: safety.alert,
    safetyMessage: safety.message,
    mentalHealthStatus,
  };
}

export async function analyzeEmotionWithAI(text: string): Promise<EmotionResult> {
  try {
    // Check cache: if the same text was already analyzed, return the stored result
    const normalizedText = text.trim();
    const { data: cached } = await supabase
      .from('journal_entries')
      .select('result')
      .eq('text', normalizedText)
      .limit(1)
      .maybeSingle();

    if (cached?.result) {
      const cachedResult = cached.result as unknown as EmotionResult;
      if (cachedResult.primaryEmotion) {
        console.log('Returning cached emotion result for identical text');
        return cachedResult;
      }
    }

    // Run local NLP dataset matching to provide context for Gemini
    const nlpResult = processTextNLP(normalizedText);
    const datasetContext = nlpResult.datasetMatches.length > 0
      ? nlpResult.datasetMatches.slice(0, 5).map(m =>
          `${m.status}: matched words [${m.matchedWords.slice(0, 5).join(', ')}] (${m.matchCount} matches)`
        ).join('\n')
      : null;

    const { data, error } = await supabase.functions.invoke('analyze-emotion', {
      body: { text: normalizedText, datasetContext },
    });

    if (error) throw error;
    if (!data || !data.primaryEmotion) throw new Error('Invalid AI response');

    const validEmotions: EmotionType[] = ['happy', 'sad', 'angry', 'fear', 'surprise', 'love', 'anxious', 'neutral'];
    if (!validEmotions.includes(data.primaryEmotion)) throw new Error('Invalid emotion type');

    return {
      primaryEmotion: data.primaryEmotion as EmotionType,
      confidence: Math.max(55, Math.min(98, data.confidence ?? 75)),
      sentiment: data.sentiment as SentimentType,
      keywords: [],
      intensity: data.intensity as IntensityLevel,
      insight: data.insight ?? '',
      suggestions: Array.isArray(data.suggestions) ? data.suggestions.slice(0, 3) : [],
      safetyAlert: data.safetyAlert ?? false,
      safetyMessage: data.safetyMessage,
      mentalHealthStatus: data.mentalHealthClassification ? {
        status: data.mentalHealthClassification as MentalHealthResult['status'],
        confidence: data.mentalHealthConfidence ?? 70,
        explanation: data.insight ?? '',
        sampleStatements: [],
      } : undefined,
    };
  } catch (err) {
    console.warn('AI analysis failed, falling back to keyword engine:', err);
    return analyzeEmotion(text);
  }
}

export const AFFIRMATIONS = [
  "You are worthy of love and kindness, especially from yourself. 🌸",
  "Every emotion you feel is valid. You're doing better than you think. 💙",
  "Today is a fresh page in your story. Write it with compassion. ✨",
  "Your feelings are your compass — trust them to guide you. 🧭",
  "You don't have to be perfect. You just have to be you. 🌿",
  "Small steps forward are still steps forward. Be proud of yourself. 🦋",
  "You are stronger than your toughest days. Keep going. 💪",
  "It's okay to rest. You can't pour from an empty cup. ☕",
  "The world is better because you're in it. Never forget that. 🌍",
  "Your mental health matters. Taking time for yourself is never selfish. 🫶",
  "Be gentle with yourself. Growth takes time and patience. 🌱",
  "You are allowed to set boundaries and protect your peace. 🕊️",
];

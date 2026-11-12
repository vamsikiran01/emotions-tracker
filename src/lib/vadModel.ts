import type { EmotionType, SentimentType, IntensityLevel } from './emotionEngine';

export interface VADMetrics {
  valence: number;   // 0 - 100 (Unpleasant -> Pleasant)
  arousal: number;   // 0 - 100 (Calm/Deactivated -> High Activation)
  dominance: number; // 0 - 100 (Powerless/Overwhelmed -> In Control/Empowered)
  valenceLabel: string;
  arousalLabel: string;
  dominanceLabel: string;
}

export function calculateVADMetrics(params: {
  emotion: EmotionType;
  sentiment: SentimentType;
  intensity: IntensityLevel;
  confidence: number;
  text: string;
}): VADMetrics {
  const { emotion, sentiment, intensity, text } = params;

  // 1. Valence (Baseline based on sentiment & emotion)
  let valence = 50;
  if (sentiment === 'Positive') valence = 75;
  else if (sentiment === 'Negative') valence = 25;
  else if (sentiment === 'Mixed') valence = 50;

  switch (emotion) {
    case 'happy':
    case 'love':
      valence = Math.min(95, valence + 15);
      break;
    case 'surprise':
      valence = Math.min(85, valence + 5);
      break;
    case 'anxious':
    case 'stress':
      valence = Math.max(20, valence - 10);
      break;
    case 'sad':
    case 'bipolar':
      valence = Math.max(15, valence - 15);
      break;
    case 'angry':
      valence = Math.max(15, valence - 12);
      break;
    case 'depression':
    case 'suicidal':
      valence = Math.max(5, valence - 25);
      break;
    default:
      break;
  }

  // 2. Arousal (Activation)
  let arousal = 50;
  if (intensity === 'High') arousal = 80;
  else if (intensity === 'Medium') arousal = 55;
  else arousal = 30;

  if (['angry', 'fear', 'anxious', 'stress', 'surprise'].includes(emotion)) {
    arousal = Math.min(95, arousal + 15);
  } else if (['depression', 'sad', 'neutral'].includes(emotion)) {
    arousal = Math.max(15, arousal - 20);
  }

  // Factor exclamation marks or question marks
  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount > 1) arousal = Math.min(98, arousal + 8);

  // 3. Dominance (Agency & Perceived Control)
  let dominance = 50;
  const lower = text.toLowerCase();
  const agencyPositive = ['i can', 'i will', 'i choose', 'i decided', 'i am doing', 'i solved', 'manage'];
  const agencyNegative = ['can\'t cope', 'no control', 'trapped', 'helpless', 'drowning', 'stuck', 'forced', 'overwhelmed'];

  const posMatches = agencyPositive.filter(p => lower.includes(p)).length;
  const negMatches = agencyNegative.filter(p => lower.includes(p)).length;

  if (['happy', 'love'].includes(emotion)) dominance = 70;
  if (['angry'].includes(emotion)) dominance = 60; // Anger often carries active externalization
  if (['anxious', 'fear', 'stress'].includes(emotion)) dominance = 35;
  if (['depression', 'suicidal'].includes(emotion)) dominance = 15;

  dominance = Math.max(10, Math.min(95, dominance + (posMatches * 8) - (negMatches * 10)));

  // Labels
  const valenceLabel = valence >= 65 ? 'Positive Valence' : valence <= 35 ? 'Negative Valence' : 'Neutral Valence';
  const arousalLabel = arousal >= 65 ? 'High Activation' : arousal <= 35 ? 'Low Activation / Lethargic' : 'Moderate Energy';
  const dominanceLabel = dominance >= 60 ? 'Empowered / In Control' : dominance <= 40 ? 'Overwhelmed / Low Agency' : 'Balanced Agency';

  return {
    valence: Math.round(valence),
    arousal: Math.round(arousal),
    dominance: Math.round(dominance),
    valenceLabel,
    arousalLabel,
    dominanceLabel,
  };
}

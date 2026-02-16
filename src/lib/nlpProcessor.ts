import nlp from 'compromise';

// ── Stopwords ──────────────────────────────────────────────
const STOPWORDS = new Set([
  'i','me','my','myself','we','our','ours','ourselves','you','your','yours',
  'yourself','yourselves','he','him','his','himself','she','her','hers',
  'herself','it','its','itself','they','them','their','theirs','themselves',
  'what','which','who','whom','this','that','these','those','am','is','are',
  'was','were','be','been','being','have','has','had','having','do','does',
  'did','doing','a','an','the','and','but','if','or','because','as','until',
  'while','of','at','by','for','with','about','against','between','through',
  'during','before','after','above','below','to','from','up','down','in',
  'out','on','off','over','under','again','further','then','once','here',
  'there','when','where','why','how','all','both','each','few','more','most',
  'other','some','such','no','nor','not','only','own','same','so','than',
  'too','very','s','t','can','will','just','don','should','now','d','ll',
  'm','o','re','ve','y','ain','aren','couldn','didn','doesn','hadn','hasn',
  'haven','isn','ma','mightn','mustn','needn','shan','shouldn','wasn',
  'weren','won','wouldn','really','also','get','got','like','thing','things',
  'lot','much','even','still','way','would','could','going','went','come',
  'came','made','make','back','well','around','say','said','know','knew',
  'think','thought','feel','felt','want','wanted','need','needed','try',
  'tried','go','gone','take','took','see','saw','look','looked',
]);

// ── Negation words ─────────────────────────────────────────
const NEGATION_WORDS = new Set([
  'not','no','never','neither','nobody','nothing','nowhere','nor',
  "don't","doesn't","didn't","won't","wouldn't","can't","cannot",
  "couldn't","shouldn't","isn't","aren't","wasn't","weren't",
  "haven't","hasn't","hadn't","mustn't",
]);

// ── Mental-health relevant bigrams ─────────────────────────
const RELEVANT_BIGRAMS = new Set([
  'panic attack','self harm','self esteem','mental health','social anxiety',
  'racing thoughts','sleep deprivation','mood swings','eating disorder',
  'substance abuse','suicidal thoughts','emotional distress','body image',
  'obsessive compulsive','post traumatic','bipolar disorder','major depression',
  'anxiety disorder','stress management','coping mechanism','burn out',
  'nervous breakdown','anger management','trust issues','abandonment issues',
]);

// ── Types ──────────────────────────────────────────────────
export interface DatasetMatch {
  status: string;
  matchedWords: string[];
  matchCount: number;
}

export interface NLPResult {
  totalTokens: number;
  uniqueTokens: number;
  vocabularyRichness: number;        // 0–100
  keywords: { word: string; score: number }[];
  bigrams: string[];
  negations: string[];
  pos: { nouns: number; verbs: number; adjectives: number; adverbs: number };
  lemmatizedTokens: string[];
  datasetMatches: DatasetMatch[];
}

// ── Dataset keyword loader ────────────────────────────────
function loadDatasetKeywords(): Record<string, string[]> | null {
  try {
    const raw = localStorage.getItem('mental-health-custom-keywords');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Remove _meta key, keep only status → keywords entries
    const result: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (key !== '_meta' && Array.isArray(value)) {
        result[key] = value;
      }
    }
    return Object.keys(result).length > 0 ? result : null;
  } catch {
    return null;
  }
}

// ── Main processor ─────────────────────────────────────────
export function processTextNLP(text: string): NLPResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = nlp(text) as any;

  // 1. Tokenisation + lemmatisation via compromise
  const terms = doc.terms().json() as Array<{ text: string; tags: string[] }>;
  const lemmatizedDoc = doc.clone();
  lemmatizedDoc.verbs().toInfinitive();
  lemmatizedDoc.nouns().toSingular();
  const lemmatized: string[] = lemmatizedDoc
    .text()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  // Build cleaned token list (lowercase, alpha-only, no stopwords)
  const allTokens = terms.map(t => t.text.toLowerCase().replace(/[^a-z'-]/g, '')).filter(w => w.length > 1);
  const filtered = allTokens.filter(w => !STOPWORDS.has(w));

  const totalTokens = allTokens.length;
  const uniqueSet = new Set(filtered);
  const uniqueTokens = uniqueSet.size;
  const vocabularyRichness = totalTokens > 0 ? Math.round((uniqueTokens / totalTokens) * 100) : 0;

  // 2. TF-IDF keyword scoring (TF only — single-document)
  const freq: Record<string, number> = {};
  for (const w of filtered) freq[w] = (freq[w] || 0) + 1;
  const maxFreq = Math.max(...Object.values(freq), 1);
  const scored = Object.entries(freq)
    .map(([word, count]) => ({ word, score: Math.round((count / maxFreq) * 100) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  // 3. Bigram detection
  const lowerText = text.toLowerCase();
  const detectedBigrams = [...RELEVANT_BIGRAMS].filter(bg => lowerText.includes(bg));

  // 4. Negation detection — find "negation + word" pairs
  const negations: string[] = [];
  for (let i = 0; i < allTokens.length - 1; i++) {
    const token = allTokens[i];
    // Check for contraction negations or standalone negation words
    if (NEGATION_WORDS.has(token) || NEGATION_WORDS.has(token.replace("'", "'"))) {
      const next = allTokens[i + 1];
      if (next && !STOPWORDS.has(next)) {
        negations.push(`${token} ${next}`);
      }
    }
  }

  // 5. POS counts via compromise tags
  const nouns = doc.nouns().length;
  const verbs = doc.verbs().length;
  const adjectives = doc.adjectives().length;
  const adverbs = doc.adverbs().length;

  // 6. Dataset keyword matching
  let datasetMatches: DatasetMatch[] = [];
  const datasetKeywords = loadDatasetKeywords();
  if (datasetKeywords) {
    const tokenSet = new Set(filtered);
    const matches: DatasetMatch[] = [];
    for (const [status, keywords] of Object.entries(datasetKeywords)) {
      const matchedWords = keywords.filter(kw => tokenSet.has(kw));
      if (matchedWords.length > 0) {
        matches.push({ status, matchedWords, matchCount: matchedWords.length });
      }
    }
    datasetMatches = matches.sort((a, b) => b.matchCount - a.matchCount);
  }

  return {
    totalTokens,
    uniqueTokens,
    vocabularyRichness,
    keywords: scored,
    bigrams: detectedBigrams,
    negations,
    pos: { nouns, verbs, adjectives, adverbs },
    lemmatizedTokens: lemmatized.length > 0 ? lemmatized : filtered,
    datasetMatches,
  };
}

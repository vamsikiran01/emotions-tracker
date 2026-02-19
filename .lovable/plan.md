

# Integrate Dataset Keywords as Reference Context for Gemini AI

## What This Does

When you write a journal entry, the app will first scan your text against the 51,000+ entry mental health dataset (already stored in your browser). It will then pass any matched keywords and their categories to Gemini as **additional reference context** -- not as a command, but as a hint. Gemini remains the decision-maker and can agree with or override the dataset signals based on the full meaning of your text.

This means:
- For your book review about "The Art of Being Alone", Gemini sees the full emotional context (love, appreciation, recommendation) and makes its own judgment -- the dataset won't push it toward "Depression" just because the word "alone" or "trauma" appears
- For a genuinely distressed entry, the dataset matches (e.g., 5 Depression keywords, 3 Anxiety keywords) give Gemini clinical grounding to make a more informed classification

## How It Works

1. **Client side** (`src/lib/emotionEngine.ts`): Before calling the backend, run the NLP dataset matching locally. Send the top dataset matches alongside the journal text to the edge function.

2. **Backend** (`supabase/functions/analyze-emotion/index.ts`): Update the system prompt to tell Gemini: "You may receive dataset keyword matches as supplementary context. Use them as a soft reference to inform your analysis, but always prioritize the full meaning and emotional tone of the text. The dataset is a supporting signal, not a directive."

3. **Gemini's prompt will receive something like**:
   ```
   Journal Entry: "There's a book called 'The art of being alone'... I just loved this book..."
   
   Dataset Reference (supplementary context, not directive):
   - Depression: matched words [alone, trauma, obstacles] (3 matches)
   - Stress: matched words [overcome, facing] (2 matches)
   ```
   Gemini sees the dataset flagged Depression keywords, but reads the full text and recognizes this is a positive, loving review -- so it correctly picks "love".

## What Does NOT Change

- NLP Analysis card on the Results page -- still works independently
- The NLP processor itself -- untouched
- Dashboard, voice recorder, UI -- all untouched
- Database schema -- no changes
- Cache layer -- still works (same text returns cached result)
- Keyword fallback engine -- still works if AI is unavailable

## Technical Details

### File 1: `src/lib/emotionEngine.ts`

In the `analyzeEmotionWithAI` function, before calling the edge function:

```typescript
// Import processTextNLP
import { processTextNLP } from './nlpProcessor';

// Inside analyzeEmotionWithAI, before the edge function call:
const nlpResult = processTextNLP(normalizedText);
const datasetContext = nlpResult.datasetMatches.length > 0
  ? nlpResult.datasetMatches.slice(0, 5).map(m => 
      `${m.status}: matched words [${m.matchedWords.slice(0, 5).join(', ')}] (${m.matchCount} matches)`
    ).join('\n')
  : null;

// Pass dataset context to the edge function
const { data, error } = await supabase.functions.invoke('analyze-emotion', {
  body: { text: normalizedText, datasetContext },
});
```

### File 2: `supabase/functions/analyze-emotion/index.ts`

1. Extract `datasetContext` from the request body alongside `text`
2. If dataset context exists, append it to the user message sent to Gemini:

```typescript
const { text, datasetContext } = await req.json();

// Build user message with optional dataset reference
let userMessage = text;
if (datasetContext) {
  userMessage += `\n\n---\nDataset Reference (supplementary context from a 51,000+ entry mental health dataset — use as a soft reference only, always prioritize the full emotional meaning and tone of the journal text above):\n${datasetContext}`;
}
```

3. Add a line to the system prompt reinforcing Gemini's authority:

```
- You may receive dataset keyword matches as supplementary context appended to the user's text. These are pattern matches from a mental health dataset and should be treated as a soft reference signal only. ALWAYS prioritize the full meaning, tone, and emotional context of the journal entry over dataset keyword matches. The dataset is a supporting partner, not the decision-maker.
```

This ensures Gemini has the upper hand while the dataset serves as a reference partner -- exactly as requested.


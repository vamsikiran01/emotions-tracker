

# Integrate Dataset Keywords into NLP Analysis

## Goal

Connect the 51,000+ entry Kaggle dataset (already uploaded and processed via the Dataset Upload page) to the NLP analysis layer. The dataset keywords stored in localStorage will be read by the NLP processor and matched against journal text, showing which mental health categories the user's words align with.

## What Changes (Only 2 files, additive only)

### 1. `src/lib/nlpProcessor.ts` -- add dataset keyword matching

- Add a helper function `loadDatasetKeywords()` that reads from `localStorage` key `mental-health-custom-keywords` and returns the keyword map (e.g., `{ Depression: ["hopeless", "empty", ...], Anxiety: ["worried", "nervous", ...] }`)
- Add a new field to `NLPResult`:
  ```
  datasetMatches: { status: string; matchedWords: string[]; matchCount: number }[]
  ```
- In `processTextNLP()`, after existing analysis, check the user's tokens against each status category's keywords from the dataset
- Return the top matching categories with their matched words
- If no dataset is loaded, `datasetMatches` will be an empty array (graceful fallback)

### 2. `src/components/NLPAnalysisCard.tsx` -- display dataset matches

- Add a new section at the bottom of the card titled "Dataset Keyword Matches"
- For each matched category, show the status name (e.g., "Depression", "Anxiety") as a badge with the count of matched words
- Show the actual matched words as smaller badges underneath
- If no dataset is uploaded, this section simply won't render (no error, no empty state)

## What Does NOT Change

- `src/pages/DatasetUpload.tsx` -- untouched
- `src/pages/Results.tsx` -- untouched
- `src/lib/emotionEngine.ts` -- untouched
- `src/lib/mentalHealthClassifier.ts` -- untouched
- Edge functions -- untouched
- VoiceRecorder -- untouched
- Dashboard -- untouched
- Index page -- untouched
- Database -- untouched

## How It Works

```text
User uploads CSV on Dataset page
  -> Keywords extracted per mental health status
  -> Saved to localStorage

User writes journal entry
  -> NLP processor runs (existing behavior unchanged)
  -> NEW: processor reads dataset keywords from localStorage
  -> NEW: matches user's tokens against each category
  -> NEW: returns datasetMatches alongside existing NLP results

NLP Analysis card renders
  -> Existing sections (tokens, TF-IDF, bigrams, POS, negations) unchanged
  -> NEW: "Dataset Keyword Matches" section appended at bottom
  -> Shows which mental health categories the text aligns with
```

## Example Output in the Card

The NLP Analysis card will show an additional section:

```text
Dataset Keyword Matches (from 51,074 entries)
  [Depression: 4 matches]  hopeless, empty, worthless, numb
  [Anxiety: 3 matches]     worried, nervous, overthinking
  [Stress: 2 matches]      overwhelmed, pressure
```

No database changes. No edge function changes. No config changes. Only 2 existing files modified with additive code.

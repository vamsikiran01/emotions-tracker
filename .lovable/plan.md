

# Linking the Kaggle Mental Health Dataset

## The Challenge

The Kaggle "Sentiment Analysis for Mental Health" dataset by suchintikasarkar has **53,043 rows** with two columns:
- `statement` — text from social media / mental health discussions
- `status` — one of 7 labels: **Normal, Depression, Suicidal, Anxiety, Stress, Bipolar, Personality disorder**

Your app currently classifies into 8 emotion categories: happy, sad, angry, fear, surprise, love, neutral, anxious. These don't map 1:1 to the dataset labels, so we need a bridging strategy.

## Approach: Dataset-Enhanced Keyword Engine

Since this is a frontend-only app (no backend/Python), we cannot run a real ML model in the browser. Instead, we will:

1. **Add a new classification layer** that maps journal text to the dataset's 7 mental health categories alongside the existing emotion detection
2. **Build enriched keyword dictionaries** extracted from the dataset's most frequent and distinctive words per category
3. **Display a "Mental Health Insight" card** on the Results page showing the dataset-aligned classification

## What Changes

### 1. New file: `src/lib/mentalHealthClassifier.ts`
- Define the 7 mental health status types from the dataset
- Create comprehensive keyword dictionaries per status, derived from common patterns in the dataset (e.g., Depression: "hopeless", "empty", "worthless"; Anxiety: "worried", "panic", "overwhelming")
- A `classifyMentalHealth()` function that runs alongside `analyzeEmotion()`
- Mapping between dataset statuses and our emotion types (e.g., Depression maps to sad, Anxiety maps to anxious, Normal maps to neutral)
- Include metadata: emoji, color, description for each status
- Add a confidence score and relevant explanation

### 2. New file: `src/data/datasetSamples.json`
- A curated set of ~200-300 representative sample statements from each of the 7 categories (you would paste these from the CSV)
- Used as reference examples shown in a "Similar entries from dataset" feature
- Small enough to bundle in the frontend (~50KB)

### 3. Update: `src/lib/emotionEngine.ts`
- Add a `datasetStatus` field to the `EmotionResult` interface
- Call the mental health classifier within `analyzeEmotion()` and include the result

### 4. Update: `src/lib/storage.ts`
- Update the `JournalEntry` type to store the mental health classification result

### 5. Update: `src/pages/Results.tsx`
- Add a new **"Mental Health Pattern (Dataset-Aligned)"** card below the existing emotion card
- Shows the detected mental health status with its label, confidence, and a brief explanation
- Display 2-3 similar sample statements from the dataset for context
- Clearly label this as "Based on patterns from the Kaggle Mental Health Dataset"

### 6. Update: `src/pages/Dashboard.tsx`
- Add a secondary chart showing mental health status distribution over time
- Show a "Mental Health Pattern" summary alongside the weekly dominant emotion

### 7. CSV Upload Feature (Optional but Recommended)
- Add a settings/upload area where users can upload the actual Kaggle CSV
- Parse it client-side to dynamically build better keyword maps
- This lets users "link" their own copy of the dataset without us bundling 30MB

## Status-to-Emotion Mapping

```text
Dataset Status          ->  App Emotion
----------------------------------------------
Normal                  ->  neutral
Depression              ->  sad
Anxiety                 ->  anxious
Stress                  ->  anxious / angry
Suicidal                ->  sad (+ safety alert)
Bipolar                 ->  mixed (sad / happy)
Personality disorder    ->  fear / anxious
```

## Implementation Order

1. Create `mentalHealthClassifier.ts` with keyword dictionaries and classification logic
2. Create `datasetSamples.json` with curated sample statements
3. Update `emotionEngine.ts` to integrate the new classifier
4. Update `storage.ts` types
5. Update `Results.tsx` with the new Mental Health Pattern card
6. Update `Dashboard.tsx` with secondary distribution chart
7. Add CSV upload feature for custom dataset linking

## Technical Notes
- The dataset is 30MB CSV, too large to bundle -- we use extracted keyword patterns and a small sample set instead
- All processing remains client-side for privacy
- The CSV upload feature parses files in-browser using the FileReader API
- No new dependencies required (CSV parsing done with basic string splitting)


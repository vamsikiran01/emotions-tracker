

# Remove "Neutral" from Emotion Categories

## Overview
Remove "neutral" as an emotion result. When no strong emotion is detected, the classifier will default to the closest low-intensity match instead of labeling it "neutral."

## Changes

### 1. `src/lib/emotionEngine.ts`
- Remove `'neutral'` from the `EmotionType` union type (leaving 7 emotions: happy, sad, angry, fear, surprise, love, anxious)
- Remove the `neutral` entry from `EMOTION_META`
- Remove the `neutral` keyword group from `KEYWORD_MAP`
- Remove `neutral` insights and suggestions arrays
- Remove `neutral` from the `scores` and `matchedKeywords` initialization objects
- Change the fallback logic: instead of boosting `neutral` when no strong signal is found, boost `happy` with a small score (since low-signal text is more likely calm/content than truly empty)
- Keep `SentimentType: 'Neutral'` as-is since sentiment neutral is different from the emotion category

### 2. `src/lib/storage.ts`
- Remove `neutral` from the `colorMap` in `getEmotionDistribution()`

### 3. `src/lib/mentalHealthClassifier.ts`
- Change `STATUS_TO_EMOTION` mapping for `Normal` from `'neutral'` to `'happy'` (Normal status maps to calm/content)

### 4. `src/pages/Results.tsx`
- No structural changes needed; the sentiment badge "Neutral" stays (it refers to sentiment, not emotion)
- Any existing entries stored with "neutral" will still render but won't appear for new analyses

## Notes
- Existing journal entries saved with "neutral" in localStorage will still display but the emotion won't be assigned to new entries going forward
- The `SentimentType` "Neutral" is kept since it describes sentiment polarity, not the emotion category


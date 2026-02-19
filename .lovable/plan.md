

# Add 5 New Emotions: Depression, Suicidal, Stress, Bipolar, Personality Disorder

## Overview

Currently the app detects **8 primary emotions** (happy, sad, angry, fear, surprise, love, anxious, neutral). The 5 new categories (Depression, Suicidal, Stress, Bipolar, Personality Disorder) currently exist **only as mental health classifications** -- they appear in the "Mental Health Pattern Distribution" chart but are NOT treated as primary emotions.

This plan promotes them to **full primary emotions**, meaning they will:
- Appear as the detected emotion on the Results page (with emoji, color strip, label)
- Show in the Dashboard's Emotion Distribution chart
- Be returned by Gemini AI as valid `primaryEmotion` values
- Have their own insights, suggestions, keywords, and safety logic

---

## What Changes

### 1. `src/lib/emotionEngine.ts` -- Add 5 new emotion types and metadata

- Expand `EmotionType` to include: `depression`, `suicidal`, `stress`, `bipolar`, `personality_disorder`
- Add entries to `EMOTION_META` with the requested colors and appropriate emojis
- Add keyword groups to `KEYWORD_MAP` (reusing existing keywords from `mentalHealthClassifier.ts`)
- Add insight messages to `INSIGHTS` for each new emotion
- Add suggestion messages to `SUGGESTIONS` for each new emotion
- Add `suicidal` keywords to `SAFETY_KEYWORDS` detection (already partially covered)
- Update `EMOTION_WORDS_SET` (automatic since it reads from `KEYWORD_MAP`)

**New color mapping for the 5 additions:**

| Emotion              | Color          | HSL Value              |
|----------------------|----------------|------------------------|
| depression           | Yellow         | hsl(50, 80%, 50%)      |
| suicidal             | Maroon         | hsl(0, 60%, 30%)       |
| stress               | Dark Green     | hsl(140, 50%, 30%)     |
| bipolar              | Navy Blue      | hsl(220, 70%, 30%)     |
| personality_disorder | Beige          | hsl(40, 40%, 70%)      |

### 2. `supabase/functions/analyze-emotion/index.ts` -- Update Gemini prompt and tool schema

- Add the 5 new values to the `primaryEmotion` enum in the tool call schema
- Update the system prompt to instruct Gemini that it can now return these as primary emotions
- Provide guidance on when to use them vs. the original 8 (e.g., use "depression" when text shows persistent hopelessness, not just momentary sadness)

### 3. `src/index.css` -- Add CSS custom properties

- Add `--emotion-depression`, `--emotion-suicidal`, `--emotion-stress`, `--emotion-bipolar`, `--emotion-personality-disorder` variables in both light and dark themes

### 4. `src/lib/storage.ts` -- Update `getEmotionDistribution()`

- Add the 5 new emotions to the `colorMap` so they appear correctly in the Dashboard bar chart

### 5. `src/pages/Results.tsx` -- No structural changes needed

The Results page already reads from `EMOTION_META` dynamically, so it will automatically display the new emotions once they are added to the engine. No code changes required here.

### 6. `src/pages/Dashboard.tsx` -- No structural changes needed

Same as Results -- it reads `EMOTION_META` dynamically. The new emotions will appear automatically in entry cards and charts.

### 7. `src/lib/emotionEngine.ts` -- Update `analyzeEmotionWithAI()` response handler

- Add the 5 new values to the `validEmotions` array so AI responses with these emotions are accepted instead of falling back to the keyword engine

---

## How Accuracy is Ensured

1. **Gemini AI is the primary decision-maker** -- the system prompt will clearly distinguish when to use clinical emotions (depression, suicidal, etc.) vs. basic emotions (sad, anxious, etc.)
2. **Dataset cross-referencing** -- the existing NLP pipeline already matches against the 51,000+ entry mental health dataset and passes context to Gemini. This context includes Depression/Suicidal/Stress/Bipolar/Personality Disorder labels, giving Gemini real clinical reference data
3. **Local keyword fallback** -- if Gemini fails, the local keyword engine (using the same keywords from `mentalHealthClassifier.ts`) provides a backup classification
4. **Safety net** -- suicidal content will always trigger the safety alert regardless of which emotion is detected

## What Does NOT Change

- The Mental Health Pattern Distribution chart on the Dashboard -- it will continue to work independently using `mentalHealthClassifier.ts`
- The NLP Analysis card on the Results page -- untouched
- Database schema -- the `result` column is JSONB and already accepts any emotion string
- Authentication, storage, or other backend logic

---

## Technical Details

**EmotionType expansion:**
```typescript
// Before:
export type EmotionType = 'happy' | 'sad' | 'angry' | 'fear' | 'surprise' | 'love' | 'anxious' | 'neutral';

// After:
export type EmotionType = 'happy' | 'sad' | 'angry' | 'fear' | 'surprise' | 'love' | 'anxious' | 'neutral' | 'depression' | 'suicidal' | 'stress' | 'bipolar' | 'personality_disorder';
```

**Gemini tool schema update:**
```typescript
primaryEmotion: {
  type: "string",
  enum: ["happy", "sad", "angry", "fear", "surprise", "love", "anxious",
         "depression", "suicidal", "stress", "bipolar", "personality_disorder"]
}
```

**Gemini prompt guidance (added to system prompt):**
- Use "depression" when text shows persistent hopelessness, loss of meaning, chronic emptiness -- beyond temporary sadness
- Use "suicidal" when text contains self-harm ideation, wanting to end life, or feeling like a burden (always triggers safety alert)
- Use "stress" when text focuses on overwhelm, burnout, pressure, workload -- distinct from general anxiety
- Use "bipolar" when text describes extreme mood swings, manic-depressive cycles, or rapid emotional shifts
- Use "personality_disorder" when text shows identity confusion, intense fear of abandonment, splitting behavior, or chronic relationship instability


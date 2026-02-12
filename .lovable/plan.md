

# Plan: Replace Keyword-Based Engine with AI-Powered Emotion Analysis

## Overview
Replace the current keyword-matching emotion engine with a real AI model (Gemini Flash) via a backend function. This will eliminate false detections like classifying suicidal text as "happy."

## How It Will Work

1. User writes a journal entry and clicks "Analyze My Emotions"
2. The app calls a backend function (`analyze-emotion`)
3. The backend function sends the text to **Gemini 2.5 Flash** with a structured prompt
4. The AI returns accurate emotion, sentiment, intensity, safety alerts, insights, and suggestions
5. Results are displayed exactly as they are now -- no UI changes needed

## Changes

### 1. New Backend Function: `supabase/functions/analyze-emotion/index.ts`
- Accepts `{ text: string }` via POST
- Sends the journal text to **Gemini 2.5 Flash** (available via Lovable AI -- no API key needed)
- Uses a carefully crafted system prompt that instructs the AI to:
  - Classify into one of the 7 emotions: happy, sad, angry, fear, surprise, love, anxious
  - Detect sentiment (Positive/Negative/Neutral/Mixed) and intensity (Low/Medium/High)
  - Flag safety alerts for crisis/self-harm language with a supportive message
  - Provide a personalized insight and 3 actionable suggestions
  - Classify mental health status (Normal, Depression, Suicidal, Anxiety, Stress, Bipolar, Personality Disorder)
- Returns a structured JSON response matching the existing `EmotionResult` interface

### 2. Update `src/lib/emotionEngine.ts`
- Add a new `analyzeEmotionWithAI(text: string)` async function that calls the backend function
- Keep the existing `analyzeEmotion()` as a fallback if the AI call fails
- The function will parse the AI's JSON response and map it to the existing `EmotionResult` type

### 3. Update `src/pages/Index.tsx`
- Change `handleAnalyze` to call the new async `analyzeEmotionWithAI()` instead of the synchronous `analyzeEmotion()`
- Remove the artificial delay (`setTimeout`) since the AI call has natural latency
- Fall back to keyword engine if the AI call fails

### 4. Update `src/pages/Results.tsx`
- Change `handleSaveEdit` to use the async AI function for re-analysis

## What Stays the Same
- All UI components, styling, and animations remain unchanged
- The `EmotionResult` interface and `EMOTION_META` constants stay the same
- Storage, dashboard, and all other features work identically
- Safety alert display logic remains the same

## Technical Details

The backend function will use the Lovable AI gateway:

```text
POST https://mhmhgnkuburefllvnirp.supabase.co/functions/v1/analyze-emotion
Body: { "text": "user journal entry" }
Response: { EmotionResult JSON }
```

The AI prompt will enforce a strict JSON schema to ensure consistent, parseable output matching the existing `EmotionResult` type. The safety detection will be handled by the AI model, which understands context and nuance far better than keyword matching -- so "i'm feeling tried and disturbed i want to die" will correctly return **Sad** with a **safety alert**, not Happy.


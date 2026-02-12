

# Plan: Simplify AI Language to Everyday Words

## What Changes
Update the AI system prompt in the backend function to generate results using simple, daily-life language instead of complex or clinical wording.

## Changes

### Update `supabase/functions/analyze-emotion/index.ts`
Modify the `SYSTEM_PROMPT` to add clear language guidelines:

**Current prompt says:**
> "insight: A warm, empathetic 1-2 sentence insight about their emotional state. Be specific to what they wrote."
> "suggestions: exactly 3 actionable, personalized suggestions with emoji prefixes"

**Updated prompt will say:**
- Write insights like you're talking to a close friend -- use simple, everyday words anyone would understand
- Avoid formal, clinical, or complex vocabulary (e.g., say "out of the blue" not "unanticipated", say "feeling low" not "emotional exhaustion", say "tough day" not "adversity")
- Use relatable, real-life phrases like: "suddenly", "unexpectedly", "out of nowhere" for surprise; "scared", "freaked out", "shook" for fear; "feeling down", "rough day", "heavy heart" for sadness
- Suggestions should sound like friendly advice, not therapy instructions (e.g., "Take a walk and clear your head" not "Engage in ambulatory mindfulness practice")
- Keep everything conversational and warm -- like a caring friend, not a textbook

No UI or other file changes needed -- this is purely a prompt tweak in the backend function.


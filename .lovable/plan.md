

# Plan: Rename "Sentira" to "Emo Track" and Update Logo

## What Changes
1. Replace the name "Sentira" with "Emo Track" everywhere it appears
2. Replace the `BookHeart` (love/heart icon) with a sentiment-analysis-related icon like `BrainCircuit` from Lucide (a brain with circuit lines -- represents AI-powered emotion analysis)

## Files to Update

### 1. `src/components/Header.tsx`
- Change `BookHeart` import to `BrainCircuit`
- Replace icon usage
- Change text from "Sentira" to "Emo Track"

### 2. `src/pages/Login.tsx`
- Change `BookHeart` import to `BrainCircuit`
- Replace icon usage
- Change text from "Sentira" to "Emo Track"
- Update subtitle text

### 3. `index.html`
- Update all `<title>`, `<meta>` tags from "Sentira" to "Emo Track"

### 4. `vite.config.ts`
- Update PWA manifest name and short_name to "Emo Track"

### 5. `src/pages/Install.tsx`
- Replace all "Sentira" text with "Emo Track"

### 6. `supabase/functions/analyze-emotion/index.ts`
- Update app name reference in the system prompt

### 7. `supabase/functions/send-login-alert/index.ts`
- Update email sender name and content

### 8. `supabase/functions/send-notifications/index.ts`
- Update email sender name and content

## Technical Details

The `BrainCircuit` icon from Lucide represents AI/neural analysis, which fits perfectly for a sentiment analysis app. No new dependencies needed -- it's already available in the installed `lucide-react` package.


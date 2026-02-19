

# Fix Dashboard Re-analyze + Update Emotion Colors

## Problem 1: Dashboard Shows Old Results After Re-analyze

The Dashboard's inline edit (line 62 of Dashboard.tsx) calls `analyzeEmotion()` -- the **local keyword-based** analyzer -- instead of `analyzeEmotionWithAI()` which is the **AI-powered** one used on the Results page. This means:
- The re-analyzed result differs from what the AI would produce
- The dashboard shows incorrect/stale emotion data after editing

## Problem 2: Emotion Colors Don't Match Requested Colors

Colors need to be updated to:
1. Happy -- light green
2. Sad -- orange
3. Angry -- red
4. Fear -- purple
5. Neutral -- gray
6. Love -- pink
7. Anxious -- brown
8. Surprise -- blue

---

## What Changes

### File 1: `src/pages/Dashboard.tsx`
- Change import from `analyzeEmotion` to `analyzeEmotionWithAI`
- Make `handleEditSave` async and call `analyzeEmotionWithAI(trimmed)` instead of `analyzeEmotion(trimmed)`
- Add a loading state for the inline edit save button (spinner while AI processes)

### File 2: `src/lib/emotionEngine.ts`
- Update `EMOTION_META` color values:
  - happy: light green
  - sad: orange
  - angry: red
  - fear: purple
  - neutral: gray
  - love: pink
  - anxious: brown
  - surprise: blue

### File 3: `src/lib/storage.ts`
- Update the `colorMap` inside `getEmotionDistribution()` to match the same new colors (used for the bar chart)

### File 4: `src/index.css`
- Update the CSS custom properties (`--emotion-happy`, `--emotion-sad`, etc.) for both light and dark themes to match the new color scheme

---

## What Does NOT Change

- Results page logic -- already uses `analyzeEmotionWithAI`, untouched
- Backend, database, edge functions -- no changes
- NLP Analysis card -- untouched

## Technical Details

**Dashboard fix -- switch to AI analysis:**
```typescript
// Before (line 62):
const newResult = analyzeEmotion(trimmed);

// After:
const newResult = await analyzeEmotionWithAI(trimmed);
```

**New color mapping (applied consistently across all files):**

| Emotion  | HSL Value              | Visual  |
|----------|------------------------|---------|
| happy    | hsl(120, 50%, 55%)     | Light green |
| sad      | hsl(30, 85%, 55%)      | Orange  |
| angry    | hsl(0, 75%, 50%)       | Red     |
| fear     | hsl(270, 55%, 55%)     | Purple  |
| neutral  | hsl(0, 0%, 55%)        | Gray    |
| love     | hsl(330, 70%, 65%)     | Pink    |
| anxious  | hsl(30, 40%, 40%)      | Brown   |
| surprise | hsl(210, 70%, 55%)     | Blue    |


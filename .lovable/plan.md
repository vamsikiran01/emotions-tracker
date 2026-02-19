

# Fix "Personality Disorder" Label in Emotion Distribution Chart

## Problem
The `personality_disorder` emotion shows up as "Personality_disorder" on the chart's X-axis because the label formatter only capitalizes the first letter and keeps the underscore. The label also needs proper spacing between all emotion names.

## Changes

### 1. `src/lib/storage.ts` -- Fix label formatting (line 140)

Replace the simple capitalize logic with a proper formatter that:
- Splits on underscores
- Capitalizes each word
- Joins with a space

So `personality_disorder` becomes `Personality Disorder` instead of `Personality_disorder`.

```text
Before: emotion.charAt(0).toUpperCase() + emotion.slice(1)
After:  emotion.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
```

### 2. `src/pages/Dashboard.tsx` -- Improve X-axis label rendering (line 188)

Update the XAxis component to:
- Use a custom tick renderer that splits long labels (like "Personality Disorder") into two lines
- Add angle or wrapping so all 13 emotion names fit without overlapping
- Increase the chart bottom margin slightly for the two-line label
- Add interval={0} to ensure all labels are shown

The custom tick will render "Personality Disorder" as:
```
Personality
Disorder
```

All other single-word labels remain on one line. A small gap between ticks is maintained by setting a proper tick margin.

### Files Modified
- `src/lib/storage.ts` -- 1 line change (label formatter)
- `src/pages/Dashboard.tsx` -- Update XAxis config with custom tick renderer and chart margins

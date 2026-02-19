

# Fix Mobile Chart Labels and Unify Colors Across Charts

## Problems

1. **Mobile label overlap**: With 13 emotions, the X-axis labels in the Emotion Distribution chart overlap and become unreadable on small screens (as shown in your screenshot).
2. **Inconsistent colors**: The Mental Health Pattern Distribution chart uses different colors (e.g., Depression = blue) than the Emotion Distribution chart (Depression = yellow). Both charts should use the same color scheme you requested.

## Solution

### 1. Make X-axis labels responsive (`src/pages/Dashboard.tsx`)

**On mobile (below 768px):**
- Rotate labels to 45 degrees so they don't overlap
- Use smaller font size (8px)
- Increase chart height and bottom margin to accommodate angled labels

**On desktop:**
- Keep the current horizontal layout with multi-line splitting for long names

This will be done using the existing `useIsMobile()` hook from `src/hooks/use-mobile.tsx`.

### 2. Apply the same fix to Mental Health chart (`src/pages/Dashboard.tsx`)

The Mental Health chart's X-axis also needs the same responsive treatment — angled labels on mobile, horizontal on desktop.

### 3. Unify colors in Mental Health chart (`src/lib/mentalHealthClassifier.ts`)

Update `STATUS_META` colors to match the emotion colors you specified:

| Category             | Current Color (Mental Health) | New Color (Unified)     |
|----------------------|-------------------------------|-------------------------|
| Depression           | Blue hsl(220, 60%, 55%)       | Yellow hsl(50, 80%, 50%)  |
| Suicidal             | Red hsl(0, 72%, 50%)          | Maroon hsl(0, 60%, 30%)   |
| Stress               | Orange hsl(25, 70%, 55%)      | Dark Green hsl(140, 50%, 30%) |
| Bipolar              | Purple hsl(280, 50%, 55%)     | Navy Blue hsl(220, 70%, 30%) |
| Personality Disorder | Orange hsl(35, 80%, 50%)      | Beige hsl(40, 40%, 70%)   |
| Normal               | Green (unchanged)             | Green (unchanged)        |
| Anxiety              | Yellow (unchanged)            | Yellow (unchanged)       |

## Files Modified

- **`src/pages/Dashboard.tsx`** — Import `useIsMobile`, apply responsive tick rendering to both charts (angled on mobile, horizontal on desktop), adjust chart heights/margins
- **`src/lib/mentalHealthClassifier.ts`** — Update 5 color values in `STATUS_META` to match the emotion color scheme

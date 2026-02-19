
# Add Loading State to "Save & Re-analyze" Button

## Problem

The "Save & Re-analyze" button in the edit section on the Results page has no loading indicator. When clicked, it freezes with no feedback while waiting for the AI response -- unlike the "Analyze My Emotions" button on the journal entry page, which shows a spinner and "Analyzing..." text.

## Solution

Add a `reanalyzing` state to the Results page and mirror the same loading pattern used on the Index page: show a spinning loader icon with "Analyzing..." text, and disable the textarea and buttons while processing.

## What Changes

**File: `src/pages/Results.tsx`**

1. Import `Loader2` from `lucide-react` (already imports other icons from there)
2. Add a `reanalyzing` state: `const [reanalyzing, setReanalyzing] = useState(false);`
3. Wrap the `handleSaveEdit` logic with `setReanalyzing(true)` / `setReanalyzing(false)` (in a try/finally block)
4. Update the "Save & Re-analyze" button to show spinner + "Analyzing..." when `reanalyzing` is true
5. Disable the textarea and Cancel button while re-analyzing

## What It Looks Like

- **Before click**: Button shows `Save & Re-analyze` with a save icon
- **During analysis**: Button shows spinning loader + `Analyzing...`, textarea is disabled, Cancel button is disabled
- **After completion**: Results update as usual

## What Does NOT Change

- No backend changes
- No edge function changes
- No database changes
- Analysis logic stays the same
- Index page untouched

## Technical Details

**State addition:**
```typescript
const [reanalyzing, setReanalyzing] = useState(false);
```

**In handleSaveEdit, wrap with try/finally:**
```typescript
const handleSaveEdit = async () => {
  // ... validation stays the same ...
  setReanalyzing(true);
  try {
    // ... existing analysis logic ...
  } finally {
    setReanalyzing(false);
  }
};
```

**Button update:**
```tsx
<Button size="sm" onClick={handleSaveEdit} disabled={!editText.trim() || reanalyzing} className="gap-1">
  {reanalyzing ? (
    <>
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      Analyzing...
    </>
  ) : (
    <>
      <Save className="h-3.5 w-3.5" />
      Save & Re-analyze
    </>
  )}
</Button>
```

**Textarea and Cancel button disabled during analysis:**
```tsx
<Textarea disabled={reanalyzing} ... />
<Button variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={reanalyzing} ...>
```


# Add "View Full Results" Button to Dashboard Past Entries

## What This Does

Each past entry in the Dashboard will get a new "View" button (an eye icon) alongside the existing Edit and Delete buttons. Clicking it navigates to the Results page showing the complete analysis for that entry -- the same view you see after submitting a new journal entry: primary emotion card, confidence bar, AI insight, personalized suggestions, and the NLP Analysis card.

## How It Works

The Results page already accepts a journal entry via React Router's `location.state`. So the Dashboard just needs to navigate to `/results` and pass the entry data -- no new pages or components needed.

## What Changes

**File: `src/pages/Dashboard.tsx`**

1. Import `useNavigate` from `react-router-dom` and `Eye` icon from `lucide-react`
2. Add `const navigate = useNavigate()` inside the component
3. Add a "View" button (Eye icon) next to the Edit and Delete buttons for each entry
4. On click, navigate to `/results` passing the entry as state: `navigate('/results', { state: { entry } })`

## What Does NOT Change

- Results page -- already handles displaying a full entry, untouched
- NLP Analysis card -- untouched
- Edit/Delete functionality on Dashboard -- stays the same
- Backend, database, edge functions -- no changes

## Technical Details

**New button added to each entry's action buttons (alongside Edit and Delete):**

```tsx
<Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary"
  onClick={() => navigate('/results', { state: { entry } })}
  title="View full results">
  <Eye className="h-3.5 w-3.5" />
</Button>
```

This reuses the existing Results page exactly as-is, including the "Write Another Entry" back button, edit/delete options, AI Insight, Suggestions, and NLP Analysis card.



# Fix Remaining Error-Level Security Issue

## Problem
The security scan found that `journal_entries` (and also `user_roles`) have RLS enabled but not **forced**. Without `FORCE ROW LEVEL SECURITY`, the table owner role can bypass all RLS policies, potentially exposing private journal data.

## Solution
Run a single database migration to force RLS on both tables:

```sql
ALTER TABLE public.journal_entries FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;
```

This ensures RLS policies are enforced for **all** roles, including the table owner.

## Technical Details

- `ENABLE ROW LEVEL SECURITY` -- already set on both tables, enforces policies for non-owner roles
- `FORCE ROW LEVEL SECURITY` -- additionally enforces policies for the table owner role
- No application code changes are needed
- No impact on existing functionality since all queries already go through the `anon` or `authenticated` roles (not the table owner)

After the migration, the `journal_entries_public_exposure` finding will be marked as resolved, and a follow-up scan can confirm zero error-level issues remain.


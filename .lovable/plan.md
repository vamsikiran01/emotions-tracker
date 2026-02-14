
# Fix: Dashboard Not Showing Data + Published URL

## Root Cause
The dashboard and other routes are not wrapped with the `ProtectedRoute` component. This means users can visit `/dashboard` without being logged in. Since the database requires authentication (`auth.uid() = user_id`) to return data, an unauthenticated user sees nothing.

The `ProtectedRoute` component already exists in `src/components/ProtectedRoute.tsx` -- it just needs to be used.

## Changes

### 1. Protect Routes in `src/App.tsx`
Wrap the Journal (`/`), Results (`/results`), and Dashboard (`/dashboard`) routes with `ProtectedRoute` so users must be logged in to access them. Add the `/login` route.

```
/ --> ProtectedRoute --> Index
/results --> ProtectedRoute --> Results
/dashboard --> ProtectedRoute --> Dashboard
/login --> Login (public)
```

This single change ensures:
- Users are redirected to `/login` if not authenticated
- Once logged in, `auth.uid()` is available, so RLS policies return the correct data
- The published URL will also work because the same auth flow applies

### 2. No Database Changes Needed
The RLS policies are already correct and PERMISSIVE. The issue is purely that the app doesn't enforce login before accessing the dashboard.

## Technical Details
- Import `ProtectedRoute` and `Login` in `App.tsx`
- Wrap the three main routes with `<ProtectedRoute>`
- Add `<Route path="/login" element={<Login />} />`
- No other files need changes

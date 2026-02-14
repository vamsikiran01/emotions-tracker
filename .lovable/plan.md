

# Fix Authentication, Microphone, and Fresh Start

## Problems Identified

1. **Existing users can't sign up again** -- There are 3 existing accounts in the database blocking re-registration with those emails
2. **Login fails for some accounts** -- Stale sessions (the auth logs show "Session not found" errors) are causing 401 errors
3. **send-login-alert edge function returns 401** -- This fires on every sign-in and fails because the session token is sometimes stale, causing a visible error/blank screen
4. **Microphone button doesn't work on mobile PWA** -- The `audio/webm` MIME type is not supported on iOS/Safari; also `navigator.permissions.query('microphone')` throws on mobile browsers, potentially blocking the flow

## Plan

### 1. Clear All Existing Auth Users (Database)

Delete all 3 existing user accounts from the database so the app starts fresh. New visitors will need to create an account first.

- Delete all rows from `journal_entries` (they reference users being removed)
- Delete all rows from `user_roles`
- Delete all users from `auth.users`

### 2. Fix the send-login-alert 401 Error

The edge function call in `useAuth.ts` fires during `onAuthStateChange` with `SIGNED_IN`, but the token can be stale or the function fails, causing a visible error. Fix:

- Make the login alert call **non-blocking and silent** -- wrap it so errors are fully swallowed and never cause a blank screen
- Add the required `apikey` header to the fetch call (the edge function needs it)

### 3. Fix Login Page Error Handling

Update `Login.tsx` to show clearer error messages:

- For "User already registered" on signup: show "This email already has an account. Try signing in instead."
- For "Invalid login credentials": show "Incorrect email or password."

### 4. Fix Microphone on Mobile (iOS/Android PWA)

Two issues prevent microphone from working on mobile:

- **MIME type**: `audio/webm` is not supported on iOS Safari. Use `MediaRecorder.isTypeSupported()` to pick a supported format (`audio/webm` or `audio/mp4`)
- **permissions.query**: Calling `navigator.permissions.query({ name: 'microphone' })` throws on some mobile browsers. The current catch block handles this, but the error can still block the flow. Simplify by removing the permissions pre-check entirely and just calling `getUserMedia` directly (the browser will prompt for permission)
- **SpeechRecognition**: Not available on all mobile browsers. Make it optional -- if unavailable, still allow audio recording without live transcription

### 5. Remove Any Remaining Branding Issues

Verify the Header and all pages only show "Emo Track" with no external branding.

---

## Technical Details

### Files to modify:
- **`src/hooks/useAuth.ts`** -- Fix login alert call (add apikey header, fully silence errors)
- **`src/pages/Login.tsx`** -- Better error messages for duplicate signup and wrong credentials
- **`src/components/VoiceRecorder.tsx`** -- Fix mobile MIME type detection, remove permissions.query pre-check, make SpeechRecognition optional

### Database operations:
- Delete from `journal_entries`, `user_roles`, and `auth.users` to start fresh

### No schema or migration changes needed.


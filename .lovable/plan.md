

# Fix Mobile Speech-to-Text Transcription

## Problem

The previous fix disabled `SpeechRecognition` entirely on mobile devices to prevent intrusive browser popups. This solved the popup issue but also removed the speech-to-text functionality -- so spoken words no longer appear in the journal box on mobile.

## Solution

Re-enable `SpeechRecognition` on all platforms (including mobile), but wrap it defensively so that:

1. All errors are silently caught -- no popups, no toasts, no console errors
2. If the API is unavailable or blocked, audio recording still works (just without live transcription)
3. Add an `onend` auto-restart handler so recognition doesn't stop after brief pauses in speech
4. Use a ref flag (`isListeningRef`) to track whether the user intends to keep recording, so auto-restart only happens while actively recording

## What Changes

**File: `src/components/VoiceRecorder.tsx`**

- Remove the `isMobile` check that skips `SpeechRecognition` on mobile
- Add an `isListeningRef` to track active recording state
- Add `recognition.onend` handler that auto-restarts recognition if still recording (critical for mobile where recognition stops after silence)
- Keep all error handlers silent (empty callbacks) to prevent any popups
- Wrap `recognition.start()` in a try/catch to handle cases where the API exists but fails to start
- On stop, set `isListeningRef.current = false` before calling `recognition.stop()` so auto-restart doesn't fire

## Technical Details

```text
Current flow (broken on mobile):
  Click mic -> MediaRecorder starts -> SpeechRecognition SKIPPED on mobile -> no text

Fixed flow:
  Click mic -> MediaRecorder starts -> SpeechRecognition starts (all platforms)
    -> onresult: append transcript to journal
    -> onend: auto-restart if still listening
    -> onerror: silently ignored
    -> stop button: set isListeningRef=false, stop recognition
```

Key code pattern for the `onend` handler:
- `recognition.onend = () => { if (isListeningRef.current) { try { recognition.start(); } catch {} } }`
- This ensures continuous transcription on mobile where the browser may stop recognition after a few seconds of silence

No database changes, no edge function changes, no other files affected.

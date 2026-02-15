

# Remove Browser Speech Recognition Popup on Mobile

## Problem

The browser's native `SpeechRecognition` API triggers a system-level popup on mobile ("Speech Recognition and Synthesis from Google cannot record now as C..."). This popup cannot be suppressed from code because it comes from the Android system, not our app. Since the server-side transcription fallback is already working perfectly on mobile, we should skip `SpeechRecognition` entirely on mobile devices.

## Solution

Add a simple mobile detection check before attempting `SpeechRecognition`. On mobile devices, skip it entirely and let the server-side Gemini transcription handle everything. On desktop, keep the browser API as it works well there.

## What Changes

**File: `src/components/VoiceRecorder.tsx`**

- Add a mobile detection helper (using `navigator.userAgent` to check for Android/iPhone/iPad)
- Wrap the `SpeechRecognition` block (lines 117-150) in a condition: only attempt it if NOT on mobile
- On mobile, the flow becomes: MediaRecorder captures audio, on stop the server fallback always runs (since `hasTranscriptRef` will remain false)
- No other files change

```text
Desktop flow (unchanged):
  Click mic -> MediaRecorder + SpeechRecognition -> text appears live

Mobile flow (fixed):
  Click mic -> MediaRecorder only (no SpeechRecognition, no popup)
  Click stop -> server-side Gemini transcription -> text appears in journal box
```

No database changes, no edge function changes.

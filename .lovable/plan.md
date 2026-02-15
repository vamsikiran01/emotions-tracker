

# Fix Mobile Speech-to-Text: Server-Side Transcription Fallback

## Problem

The browser's native `SpeechRecognition` API is fundamentally unreliable on mobile browsers (especially in PWA/webview contexts). Despite multiple attempts to make it work with silent error handling and auto-restart, it still fails to produce transcription text on many mobile devices. This is a known limitation of the Web Speech API on mobile -- it is not a code bug we can fix.

## Solution: Server-Side Audio Transcription

Instead of relying solely on the browser's `SpeechRecognition` API, we add a **server-side fallback**. When the user stops recording, if no transcript was captured by the browser API, we send the recorded audio to a backend function that uses Gemini (via Lovable AI) to transcribe it. This approach works on every device because it only depends on `MediaRecorder`, which already works on mobile.

```text
Flow:
  User clicks mic -> MediaRecorder starts + SpeechRecognition tries (best effort)
  User clicks stop ->
    IF browser captured transcript -> use it (already in journal box)
    IF no transcript -> send audio blob to backend -> get text back -> put in journal box
```

## What Changes

### 1. New Backend Function: `supabase/functions/transcribe-audio/index.ts`

- Receives an audio file via FormData
- Converts it to base64
- Sends it to Gemini Flash via the Lovable AI gateway with a prompt like "Transcribe this audio exactly"
- Returns the transcription text
- Uses the existing `LOVABLE_API_KEY` (no new API keys needed)

### 2. Updated Component: `src/components/VoiceRecorder.tsx`

- Keep the existing `SpeechRecognition` attempt (it works on desktop, might work on some mobile browsers)
- Track whether any transcript was received via a ref (`hasTranscriptRef`)
- On stop: if `hasTranscriptRef` is false and an audio blob exists, call the new `transcribe-audio` backend function
- Pass the returned text to `onTranscript`
- Show a brief loading state while server transcription is in progress

### 3. Updated Page: `src/pages/Index.tsx`

- Minor update to handle the async nature of the fallback transcription (the analyze button should wait if transcription is still loading)

## Technical Details

**Backend function pattern:**
- Accept multipart FormData with the audio file
- Read it as ArrayBuffer, convert to base64
- Send to Gemini with audio content type in the message
- Parse and return the transcription

**Client-side changes:**
- Add `hasTranscriptRef` to track if browser speech recognition produced any output
- Add `transcribing` state for the loading indicator during server-side transcription
- On `mediaRecorder.onstop`, check if fallback is needed and call the edge function
- The `onTranscript` callback fills the journal box the same way it does today

**No new API keys required** -- uses the existing Lovable AI integration with Gemini Flash, which supports audio input.

**No database changes needed.**


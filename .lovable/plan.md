

# Voice Input Feature for Emo Track

## Overview
Add a microphone button to the journal page that lets you speak your journal entry. Your voice will be converted to text in real-time and displayed in the journal text area. The audio recording will also be saved and viewable in the dashboard.

**Important note:** Python cannot be used in this project -- the platform only supports TypeScript/JavaScript. However, we achieve everything using:
- **Web Speech API** (built into the browser, free, no API key) for real-time speech-to-text
- **MediaRecorder API** (built into the browser) to record the audio
- **Lovable Cloud Storage** to save audio files
- **TypeScript** for all code

---

## What You'll Get

1. **Mic button** on the journal page (bottom-right of the text area) -- tap to start/stop recording
2. **Live transcription** -- your speech appears as text in the journal box in real-time
3. **Audio saved** -- the recorded audio file is uploaded to cloud storage and linked to the journal entry
4. **Audio playback in Dashboard** -- each past entry that has a voice recording shows a play button to listen back

---

## Technical Plan

### 1. Database Changes
- Add an `audio_url` column (nullable text) to the `journal_entries` table to store the link to the audio file
- Create a storage bucket called `journal-audio` (public) for audio files
- Add RLS policies for public read/write on the storage bucket

### 2. New Component: `VoiceRecorder`
A reusable React component (`src/components/VoiceRecorder.tsx`) that:
- Uses the **Web Speech API** (`webkitSpeechRecognition`) for speech-to-text transcription
- Uses the **MediaRecorder API** to capture the audio as a `.webm` file
- Shows a mic icon button -- toggles between idle (mic icon) and recording (red pulsing stop icon)
- Calls `onTranscript(text)` to append recognized speech to the journal textarea
- Calls `onRecordingComplete(blob)` when recording stops, providing the audio blob

### 3. Update Journal Page (`src/pages/Index.tsx`)
- Import and render `VoiceRecorder` next to the Analyze button
- When voice text arrives, append it to the existing text state
- When recording completes, upload the audio blob to cloud storage
- Save the resulting `audio_url` in the journal entry

### 4. Update Storage Layer (`src/lib/storage.ts`)
- Add `audioUrl` optional field to the `JournalEntry` interface
- Update `saveEntry` to include the `audio_url` column
- Update `getEntries` to map the `audio_url` field
- Add a helper function `uploadAudio(blob)` that uploads to the `journal-audio` bucket and returns the public URL

### 5. Update Dashboard (`src/pages/Dashboard.tsx`)
- For entries that have an `audioUrl`, show a small play/pause button
- Use an HTML `<audio>` element to play back the recording inline

### Technologies Used
- **Web Speech API** -- browser-native speech recognition (TypeScript)
- **MediaRecorder API** -- browser-native audio recording (TypeScript)
- **Lovable Cloud Storage** -- file storage for audio blobs
- **React + TypeScript** -- UI components
- **No Python, no external APIs, no API keys required**


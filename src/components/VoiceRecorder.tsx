import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  onRecordingComplete: (blob: Blob) => void;
  onTranscribingChange?: (transcribing: boolean) => void;
  disabled?: boolean;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

function getSupportedMimeType(): string {
  const types = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav', ''];
  for (const t of types) {
    if (t === '' || MediaRecorder.isTypeSupported(t)) return t;
  }
  return '';
}

const VoiceRecorder = ({ onTranscript, onRecordingComplete, onTranscribingChange, disabled }: VoiceRecorderProps) => {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const isListeningRef = useRef(false);
  const hasTranscriptRef = useRef(false);
  const mimeTypeRef = useRef('');

  const setTranscribingState = (val: boolean) => {
    setTranscribing(val);
    onTranscribingChange?.(val);
  };

  const transcribeViaServer = useCallback(async (blob: Blob) => {
    setTranscribingState(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({ title: 'Not logged in', description: 'Please log in to use voice transcription.', variant: 'destructive' });
        return;
      }

      const formData = new FormData();
      const ext = blob.type.includes('mp4') ? 'mp4' : blob.type.includes('wav') ? 'wav' : 'webm';
      formData.append('audio', blob, `recording.${ext}`);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-audio`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error('Transcription error:', err);
        toast({ title: 'Transcription failed', description: err.error || 'Could not transcribe audio. Try typing instead.', variant: 'destructive' });
        return;
      }

      const { transcript } = await response.json();
      if (transcript) {
        onTranscript(transcript);
      } else {
        toast({ title: 'No speech detected', description: 'Could not detect any speech in the recording. Try speaking louder or closer to the mic.', variant: 'destructive' });
      }
    } catch (err) {
      console.error('Server transcription error:', err);
      toast({ title: 'Transcription error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setTranscribingState(false);
    }
  }, [onTranscript, onTranscribingChange]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType;
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      chunksRef.current = [];
      hasTranscriptRef.current = false;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        onRecordingComplete(blob);
        stream.getTracks().forEach(t => t.stop());

        // If browser speech recognition didn't capture anything, use server fallback
        if (!hasTranscriptRef.current && blob.size > 0) {
          transcribeViaServer(blob);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      // Try browser speech recognition (best effort, desktop only)
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!isMobile && SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript + ' ';
              }
            }
            if (finalTranscript.trim()) {
              hasTranscriptRef.current = true;
              onTranscript(finalTranscript.trim());
            }
          };

          recognition.onerror = () => { /* silent */ };

          recognition.onend = () => {
            if (isListeningRef.current) {
              try { recognition.start(); } catch { /* silent */ }
            }
          };

          isListeningRef.current = true;
          recognition.start();
          recognitionRef.current = recognition;
        } catch {
          // Speech recognition unavailable, server fallback will handle it
        }
      }

      setRecording(true);
    } catch (err: any) {
      console.error('Mic access error:', err);
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        toast({
          title: 'Microphone access blocked',
          description: 'Please allow microphone access in your browser or device settings, then try again.',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Microphone error', description: 'Could not access microphone. Please check your device settings.', variant: 'destructive' });
      }
    }
  }, [onTranscript, onRecordingComplete, transcribeViaServer]);

  const stopRecording = useCallback(() => {
    isListeningRef.current = false;
    try { recognitionRef.current?.stop(); } catch {}
    recognitionRef.current = null;
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setRecording(false);
  }, []);

  const toggle = () => {
    if (recording) stopRecording();
    else startRecording();
  };

  return (
    <Button
      type="button"
      variant={recording ? 'destructive' : transcribing ? 'secondary' : 'outline'}
      size="icon"
      onClick={toggle}
      disabled={disabled || transcribing}
      className={`rounded-full min-h-[44px] min-w-[44px] ${recording ? 'animate-pulse' : ''}`}
      title={transcribing ? 'Transcribing...' : recording ? 'Stop recording' : 'Start voice input'}
    >
      {transcribing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : recording ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
};

export default VoiceRecorder;

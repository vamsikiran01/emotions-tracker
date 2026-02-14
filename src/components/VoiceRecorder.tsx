import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  onRecordingComplete: (blob: Blob) => void;
  disabled?: boolean;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

const VoiceRecorder = ({ onTranscript, onRecordingComplete, disabled }: VoiceRecorderProps) => {
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: 'Not supported', description: 'Speech recognition is not supported in this browser. Try Chrome.', variant: 'destructive' });
      return;
    }

    try {
      // Start media recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      // Start speech recognition
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
          onTranscript(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'aborted') {
          toast({ title: 'Voice error', description: `Speech recognition error: ${event.error}`, variant: 'destructive' });
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setRecording(true);
    } catch (err) {
      console.error('Mic access error:', err);
      toast({ title: 'Microphone access denied', description: 'Please allow microphone access to use voice input.', variant: 'destructive' });
    }
  }, [onTranscript, onRecordingComplete]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
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
      variant={recording ? 'destructive' : 'outline'}
      size="icon"
      onClick={toggle}
      disabled={disabled}
      className={`rounded-full min-h-[44px] min-w-[44px] ${recording ? 'animate-pulse' : ''}`}
      title={recording ? 'Stop recording' : 'Start voice input'}
    >
      {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
};

export default VoiceRecorder;

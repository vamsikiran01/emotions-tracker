import { useState, useRef, useCallback, useEffect } from 'react';
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
  const [recordSeconds, setRecordSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef('');

  // Audio visualization refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const setTranscribingState = (val: boolean) => {
    setTranscribing(val);
    onTranscribingChange?.(val);
  };

  // Timer effect
  useEffect(() => {
    if (recording) {
      setRecordSeconds(0);
      timerRef.current = window.setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recording]);

  const drawWaveform = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = 3;
      const gap = 2;
      const totalBars = Math.floor(canvas.width / (barWidth + gap));
      const step = Math.floor(bufferLength / totalBars) || 1;

      for (let i = 0; i < totalBars; i++) {
        const val = dataArray[i * step] || 0;
        const percent = val / 255;
        const barHeight = Math.max(3, percent * (canvas.height - 4));
        const x = i * (barWidth + gap);
        const y = (canvas.height - barHeight) / 2;

        ctx.fillStyle = percent > 0.4 ? 'rgba(124, 58, 237, 0.9)' : 'rgba(124, 58, 237, 0.4)';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
    };

    render();
  }, []);

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
        toast({ title: 'Voice transcribed ✨', description: 'Your speech was accurately converted to text.' });
      } else {
        toast({ title: 'No speech detected', description: 'Could not detect any speech in the recording. Try speaking closer to the mic.', variant: 'destructive' });
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

      // Setup Web Audio Analyser Node
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 128;
          source.connect(analyser);
          audioContextRef.current = audioCtx;
          analyserRef.current = analyser;
          setTimeout(drawWaveform, 50);
        }
      } catch (e) {
        console.warn('AudioContext visualization not supported:', e);
      }

      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType;
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        onRecordingComplete(blob);
        stream.getTracks().forEach((t) => t.stop());

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
        }

        if (blob.size > 0) {
          transcribeViaServer(blob);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
    } catch (err: any) {
      console.error('Mic access error:', err);
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        toast({
          title: 'Microphone access blocked',
          description: 'Please allow microphone access in your browser settings, then try again.',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Microphone error', description: 'Could not access microphone. Please check your device settings.', variant: 'destructive' });
      }
    }
  }, [onTranscript, onRecordingComplete, transcribeViaServer, drawWaveform]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setRecording(false);
  }, []);

  const toggle = () => {
    if (recording) stopRecording();
    else startRecording();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Live recording waveform & timer */}
      {recording && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/30 animate-fade-slide-up">
          <span className="h-2 w-2 rounded-full bg-destructive animate-ping" />
          <span className="text-xs font-mono font-semibold text-destructive">{formatTime(recordSeconds)}</span>
          <canvas ref={canvasRef} width={70} height={20} className="w-[70px] h-[20px]" />
        </div>
      )}

      <Button
        type="button"
        variant={recording ? 'destructive' : transcribing ? 'secondary' : 'outline'}
        size="icon"
        onClick={toggle}
        disabled={disabled || transcribing}
        className={`rounded-full min-h-[44px] min-w-[44px] transition-all shadow-sm ${
          recording ? 'animate-pulse ring-4 ring-destructive/20' : ''
        }`}
        title={transcribing ? 'Transcribing...' : recording ? 'Stop recording' : 'Start voice input'}
      >
        {transcribing ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : recording ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4 text-primary" />
        )}
      </Button>
    </div>
  );
};

export default VoiceRecorder;

import { useCallback, useEffect, useRef, useState } from 'react';

export type VoicePlaybackStatus = 'idle' | 'loading' | 'playing' | 'ready' | 'unavailable';

export function useVoicePlayback() {
  const [status, setStatus] = useState<VoicePlaybackStatus>('idle');
  const [error, setError] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const sourceKeyRef = useRef('');

  const releaseAudio = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setStatus(audioRef.current ? 'ready' : 'idle');
  }, []);

  const reset = useCallback(() => {
    releaseAudio();
    sourceKeyRef.current = '';
    setStatus('idle');
    setError('');
  }, [releaseAudio]);

  const play = useCallback(async (
    sourceKey: string,
    createAudio: () => Promise<Blob>,
    fallbackMessage = 'Voice is temporarily unavailable.'
  ) => {
    if (audioRef.current && sourceKeyRef.current === sourceKey && status === 'playing') {
      stop();
      return;
    }

    setError('');

    try {
      if (!audioRef.current || sourceKeyRef.current !== sourceKey) {
        releaseAudio();
        sourceKeyRef.current = sourceKey;
        setStatus('loading');

        const audioBlob = await createAudio();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioUrlRef.current = audioUrl;
        audioRef.current = audio;
        audio.onended = () => setStatus('ready');
        audio.onerror = () => {
          setStatus('unavailable');
          setError(fallbackMessage);
        };
      }

      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      setStatus('playing');
    } catch (playbackError) {
      setStatus('unavailable');
      setError(playbackError instanceof Error ? playbackError.message : fallbackMessage);
    }
  }, [releaseAudio, status, stop]);

  useEffect(() => releaseAudio, [releaseAudio]);

  return { status, error, play, stop, reset };
}

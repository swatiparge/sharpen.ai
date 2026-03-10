'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseRecorderReturn {
    isRecording: boolean;
    isPaused: boolean;
    elapsed: number; // seconds
    waveformData: number[]; // 0-255 amplitude values
    start: () => Promise<void>;
    pause: () => void;
    resume: () => void;
    stop: () => Promise<Blob>;
    error: string;
}

export function useRecorder(): UseRecorderReturn {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [waveformData, setWaveformData] = useState<number[]>(new Array(32).fill(0));
    const [error, setError] = useState('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const animFrameRef = useRef<number>(0);
    const resolveStopRef = useRef<((blob: Blob) => void) | null>(null);

    // Update waveform via analyser
    const updateWaveform = useCallback(() => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);

        // Sample 32 bars from the frequency data
        const bars: number[] = [];
        const step = Math.floor(data.length / 32);
        for (let i = 0; i < 32; i++) {
            bars.push(data[i * step] || 0);
        }
        setWaveformData(bars);
        animFrameRef.current = requestAnimationFrame(updateWaveform);
    }, []);

    const start = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? 'audio/webm;codecs=opus'
                    : 'audio/webm',
            });

            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach((t) => t.stop());
                cancelAnimationFrame(animFrameRef.current);
                if (resolveStopRef.current) {
                    resolveStopRef.current(blob);
                    resolveStopRef.current = null;
                }
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start(1000); // collect chunks every second

            setIsRecording(true);
            setIsPaused(false);
            setElapsed(0);
            setError('');

            // Start timer
            timerRef.current = setInterval(() => {
                setElapsed((prev) => prev + 1);
            }, 1000);

            // Start waveform animation
            updateWaveform();
        } catch (err: any) {
            setError(err.message || 'Microphone access denied');
        }
    }, [updateWaveform]);

    const pause = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            if (timerRef.current) clearInterval(timerRef.current);
            cancelAnimationFrame(animFrameRef.current);
        }
    }, []);

    const resume = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'paused') {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
            timerRef.current = setInterval(() => {
                setElapsed((prev) => prev + 1);
            }, 1000);
            updateWaveform();
        }
    }, [updateWaveform]);

    const stop = useCallback((): Promise<Blob> => {
        return new Promise((resolve) => {
            if (timerRef.current) clearInterval(timerRef.current);
            cancelAnimationFrame(animFrameRef.current);

            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                resolveStopRef.current = resolve;
                mediaRecorderRef.current.stop();
            } else {
                resolve(new Blob(chunksRef.current, { type: 'audio/webm' }));
            }

            audioContextRef.current?.close();
            setIsRecording(false);
            setIsPaused(false);
        });
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            cancelAnimationFrame(animFrameRef.current);
            audioContextRef.current?.close();
            if (mediaRecorderRef.current?.state !== 'inactive') {
                mediaRecorderRef.current?.stop();
            }
        };
    }, []);

    return { isRecording, isPaused, elapsed, waveformData, start, pause, resume, stop, error };
}

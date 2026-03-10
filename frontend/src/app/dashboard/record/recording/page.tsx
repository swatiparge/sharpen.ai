'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useAuth } from '@/lib/auth';
import { useRecorder } from '@/hooks/useRecorder';

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

export default function RecordingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading recording...</div>}>
            <RecordingContent />
        </Suspense>
    );
}

function RecordingContent() {
    const { token } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const interviewName = searchParams.get('name') || 'Interview';
    const round = searchParams.get('round') || 'TECHNICAL';

    const { isRecording, isPaused, elapsed, waveformData, start, pause, resume, stop, error } = useRecorder();
    const [started, setStarted] = useState(false);

    useEffect(() => {
        if (!started) {
            start().then(() => setStarted(true));
        }
    }, [started, start]);

    const handleStopFinish = async () => {
        const blob = await stop();
        // Store blob in sessionStorage as base64 for review page
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                sessionStorage.setItem('recording_blob', reader.result);
                sessionStorage.setItem('recording_name', interviewName);
                sessionStorage.setItem('recording_round', round);
                sessionStorage.setItem('recording_company', searchParams.get('company') || '');
                sessionStorage.setItem('recording_duration', elapsed.toString());
                router.push('/dashboard/record/review');
            }
        };
        reader.readAsDataURL(blob);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
            {/* Interview badge */}
            <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5 mb-8">
                <span className="text-sm text-gray-600">{interviewName}</span>
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">{round.replace(/_/g, ' ')} Round</span>
            </div>

            {/* Timer */}
            <div className="text-8xl font-black text-gray-900 tabular-nums tracking-tight mb-2">
                {formatTime(elapsed)}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 mb-10">
                {isPaused ? (
                    <span className="text-sm text-yellow-600">⏸ Paused</span>
                ) : (
                    <>
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-sm text-gray-500">Recording Audio</span>
                    </>
                )}
            </div>

            {/* Waveform visualization */}
            <div className="flex items-end gap-1 h-20 mb-10">
                {waveformData.map((value, i) => (
                    <div
                        key={i}
                        className="w-1.5 bg-gray-400 rounded-full transition-all duration-75"
                        style={{
                            height: `${Math.max(4, (value / 255) * 80)}px`,
                            opacity: isPaused ? 0.3 : 0.5 + (value / 255) * 0.5,
                        }}
                    />
                ))}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6 max-w-md text-center">
                    {error}
                </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-4">
                <button
                    onClick={isPaused ? resume : pause}
                    className="inline-flex items-center gap-2 px-8 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    {isPaused ? (
                        <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            Resume
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                            </svg>
                            Pause
                        </>
                    )}
                </button>

                <button
                    onClick={handleStopFinish}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-brand-700 text-white rounded-xl text-sm font-semibold hover:bg-brand-800 transition-colors"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="6" width="12" height="12" rx="1" />
                    </svg>
                    Stop & Finish
                </button>
            </div>

            {/* Footer */}
            <p className="text-xs text-gray-400 mt-8 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                Your data is being captured and will be analyzed once you finish.
            </p>
        </div>
    );
}

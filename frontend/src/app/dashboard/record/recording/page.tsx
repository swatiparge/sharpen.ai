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
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0B1221] flex flex-col items-center justify-center px-6 font-sans selection:bg-brand-purple/30 relative overflow-hidden transition-colors duration-500">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-purple/5 blur-[120px] rounded-full pointer-events-none animate-pulse" />
            
            {/* Interview badge */}
            <div className="z-10 inline-flex items-center gap-3 bg-white dark:bg-white/5 backdrop-blur-md rounded-2xl px-6 py-2.5 mb-16 border border-gray-100 dark:border-white/10 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="w-2 h-2 rounded-full bg-brand-purple shadow-sm animate-pulse" />
                <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-[0.2em]">{interviewName}</span>
                <div className="w-1 h-1 rounded-full bg-gray-200 dark:bg-white/10" />
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{round.replace(/_/g, ' ')} Session</span>
            </div>

            {/* Timer */}
            <div className="z-10 text-[10rem] md:text-[12rem] font-bold text-gray-900 dark:text-white tabular-nums tracking-tighter mb-4 leading-none animate-in zoom-in duration-1000">
                {formatTime(elapsed)}
            </div>

            {/* Status */}
            <div className="z-10 flex items-center gap-3 mb-16 px-6 py-2 rounded-full glass-dark border border-white/5 transition-all duration-500">
                {isPaused ? (
                    <div className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                        Paused
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-brand-purple uppercase tracking-[0.3em]">
                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-sm" />
                        Live Capturing
                    </div>
                )}
            </div>

            {/* Waveform visualization */}
            <div className="z-10 flex items-end gap-1.5 h-32 mb-20 pointer-events-none">
                {waveformData.map((value, i) => (
                    <div
                        key={i}
                        className={`w-2 rounded-full transition-all duration-75 ${isPaused ? 'bg-gray-200 dark:bg-white/10' : 'bg-brand-purple opacity-40 shadow-sm'}`}
                        style={{
                            height: `${Math.max(8, (value / 255) * 120)}px`,
                            opacity: isPaused ? 0.2 : 0.4 + (value / 255) * 0.6,
                        }}
                    />
                ))}
            </div>

            {error && (
                <div className="z-10 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold rounded-2xl px-6 py-4 mb-8 max-w-md text-center animate-in shake">
                    {error}
                </div>
            )}

            {/* Controls */}
            <div className="z-10 flex items-center gap-6">
                <button
                    onClick={isPaused ? resume : pause}
                    className="group relative inline-flex items-center gap-3 px-10 py-5 glass-dark rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] border border-white/10 hover:bg-white/10 transition-all active:scale-95 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    {isPaused ? (
                        <>
                            <svg className="w-5 h-5 text-brand-purple" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            Resume Session
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                            </svg>
                            Pause Buffer
                        </>
                    )}
                </button>

                <button
                    onClick={handleStopFinish}
                    className="inline-flex items-center gap-3 px-12 py-5 bg-brand-purple text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-brand-purple/20 hover:brightness-110 active:scale-95 transition-all"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="6" width="12" height="12" rx="1" />
                    </svg>
                    Finalize Analysis
                </button>
            </div>

            {/* Footer */}
            <div className="z-10 mt-16 flex flex-col items-center gap-4">
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 bg-white dark:bg-white/5 px-6 py-2 rounded-full border border-gray-100 dark:border-white/5 backdrop-blur-md">
                    <svg className="w-4 h-4 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    Autonomous End-to-End Encryption Enabled
                </p>
                <div className="flex gap-4 text-[9px] font-black text-gray-700 uppercase tracking-widest">
                    <span>Low Latency Capture</span>
                    <span>•</span>
                    <span>Lossless Audio Encoding</span>
                </div>
            </div>
        </div>
    );
}

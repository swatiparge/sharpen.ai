'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { createInterview, getMediaUploadUrl, uploadFileToS3, triggerAnalysis } from '@/lib/api';

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

export default function ReviewRecordingPage() {
    const { token } = useAuth();
    const router = useRouter();

    const [audioUrl, setAudioUrl] = useState<string>('');
    const [interviewName, setInterviewName] = useState('');
    const [round, setRound] = useState('');
    const [company, setCompany] = useState('');
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const blobData = sessionStorage.getItem('recording_blob');
        const name = sessionStorage.getItem('recording_name') || 'Interview';
        const rnd = sessionStorage.getItem('recording_round') || 'TECHNICAL';
        const comp = sessionStorage.getItem('recording_company') || '';
        const dur = parseInt(sessionStorage.getItem('recording_duration') || '0');

        if (!blobData) {
            router.replace('/dashboard/record');
            return;
        }

        setAudioUrl(blobData);
        setInterviewName(name);
        setRound(rnd);
        setCompany(comp);
        setDuration(dur);
    }, [router]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleDiscard = () => {
        sessionStorage.removeItem('recording_blob');
        router.push('/dashboard/record');
    };

    const handleConfirm = async () => {
        if (!token) return;
        setUploading(true);
        setError('');

        try {
            // Convert base64 data URL back to blob
            const response = await fetch(audioUrl);
            const blob = await response.blob();

            // 1. Create interview
            const interview = await createInterview(token, {
                name: interviewName,
                company: company || undefined,
                round,
                interview_type: 'RECORDED',
            });

            // 2. Get upload URL
            const { upload_url } = await getMediaUploadUrl(
                token, interview.id, 'AUDIO', 'audio/webm'
            );

            // 3. Upload
            await uploadFileToS3(upload_url, blob);

            // 4. Trigger analysis
            await triggerAnalysis(token, interview.id);

            // Cleanup
            sessionStorage.removeItem('recording_blob');

            // 5. Navigate to analysis
            router.push(`/dashboard/record/analyzing/${interview.id}`);
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    if (!audioUrl) return null;

    const audioDuration = audioRef.current?.duration || duration;

    return (
        <div className="min-h-screen bg-white">
            <main className="max-w-3xl mx-auto px-6 py-16">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Review your recording</h1>
                <p className="text-gray-500 mb-10">
                    Please listen to a snippet of your recording to ensure audio quality before analysis.
                </p>

                {/* Interview info card */}
                <div className="border border-gray-200 rounded-xl p-5 mb-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Interview Name</p>
                            <p className="text-lg font-bold text-gray-900">{interviewName}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Duration</p>
                            <p className="text-lg font-bold text-gray-900">{formatTime(duration)}</p>
                        </div>
                    </div>
                </div>

                {/* Audio player */}
                <div className="border border-gray-200 rounded-xl p-6 mb-8">
                    <audio
                        ref={audioRef}
                        src={audioUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={() => setIsPlaying(false)}
                        preload="metadata"
                    />

                    {/* Waveform placeholder (static bars) */}
                    <div className="flex items-end gap-0.5 h-16 mb-4">
                        {Array.from({ length: 60 }).map((_, i) => {
                            const height = Math.sin(i * 0.3) * 30 + 20 + Math.random() * 15;
                            const progress = audioDuration ? currentTime / audioDuration : 0;
                            const isBeforeCursor = i / 60 <= progress;
                            return (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-sm transition-colors ${isBeforeCursor ? 'bg-gray-800' : 'bg-gray-300'}`}
                                    style={{ height: `${height}px` }}
                                />
                            );
                        })}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={togglePlay}
                            className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-700 transition-colors flex-shrink-0"
                        >
                            {isPlaying ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            )}
                        </button>

                        <span className="text-sm font-mono text-gray-600 w-24">
                            {formatTime(Math.floor(currentTime))} / {formatTime(Math.floor(audioDuration || duration))}
                        </span>

                        <input
                            type="range"
                            min={0}
                            max={audioDuration || duration}
                            step={0.1}
                            value={currentTime}
                            onChange={handleSeek}
                            className="flex-1 h-1 accent-gray-900"
                        />

                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                            </svg>
                            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-center gap-6">
                    <button
                        onClick={handleDiscard}
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        Discard and re-record
                    </button>

                    <button
                        onClick={handleConfirm}
                        disabled={uploading}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-brand-700 text-white font-semibold text-sm rounded-lg hover:bg-brand-800 disabled:opacity-60 transition-colors"
                    >
                        {uploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                Confirm & analyze
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>

                <p className="text-xs text-gray-400 text-center mt-6">
                    ⓘ Analysis usually takes 3-5 minutes depending on duration.
                </p>
            </main>

            {/* Footer */}
            <footer className="text-center py-6 text-xs text-gray-400">
                © {new Date().getFullYear()} swadhyaya.ai. All rights reserved. Professional technical assessment platform.
            </footer>
        </div>
    );
}

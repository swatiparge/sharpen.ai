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
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0B1221] font-sans selection:bg-brand-purple/30 transition-colors duration-500">
            <main className="max-w-4xl mx-auto px-6 py-20">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight font-serif italic">Review Session</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-base font-medium max-w-2xl leading-relaxed">
                        Verify your audio quality and session details before initializing the deep-learning analysis engine.
                    </p>
                </div>

                {/* Interview info card */}
                <div className="bg-white dark:bg-[#0F172A]/40 border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 md:p-12 mb-10 relative overflow-hidden group shadow-soft">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/5 via-transparent to-brand-purple/5 opacity-40 group-hover:opacity-100 transition-opacity duration-700"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <p className="text-[10px] font-bold text-brand-purple uppercase tracking-[0.3em] mb-3">Session Identity</p>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{interviewName}</h2>
                            <div className="flex items-center gap-3 mt-3">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-white/5 px-3 py-1 rounded-lg border border-gray-100 dark:border-white/5">{round.replace(/_/g, ' ')} Round</span>
                                {company && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-white/10" />
                                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{company}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-2">Duration</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{formatTime(duration)}</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-brand-purple/5 border border-brand-purple/10 flex items-center justify-center text-brand-purple shadow-sm">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audio player */}
                <div className="bg-white dark:bg-[#0F172A]/40 border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 md:p-12 mb-12 shadow-soft relative overflow-hidden transition-all duration-500">
                    <audio
                        ref={audioRef}
                        src={audioUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={() => setIsPlaying(false)}
                        preload="metadata"
                    />

                    {/* Waveform placeholder (static bars) */}
                    <div className="flex items-end gap-1 h-24 mb-10 overflow-hidden">
                        {Array.from({ length: 120 }).map((_, i) => {
                            const height = Math.sin(i * 0.15) * 40 + 30 + Math.random() * 20;
                            const progress = audioDuration ? currentTime / audioDuration : 0;
                            const isBeforeCursor = i / 120 <= progress;
                            return (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-full transition-all duration-300 ${isBeforeCursor ? 'bg-brand-purple shadow-sm' : 'bg-gray-100 dark:bg-white/5'}`}
                                    style={{ height: `${height}px`, opacity: isBeforeCursor ? 0.8 : 0.3 }}
                                />
                            );
                        })}
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={togglePlay}
                                className="w-16 h-16 rounded-2xl bg-brand-purple text-white flex items-center justify-center hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-brand-purple/20 flex-shrink-0"
                            >
                                {isPlaying ? (
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </button>

                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                                        {formatTime(Math.floor(currentTime))}
                                    </span>
                                    <span className="text-[10px] font-bold text-brand-purple uppercase tracking-widest font-mono">
                                        {formatTime(Math.floor(audioDuration || duration))}
                                    </span>
                                </div>
                                <div className="relative group/slider">
                                    <input
                                        type="range"
                                        min={0}
                                        max={audioDuration || duration}
                                        step={0.1}
                                        value={currentTime}
                                        onChange={handleSeek}
                                        className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-brand-purple group-hover/slider:h-2 transition-all"
                                    />
                                    <div 
                                        className="absolute top-0 left-0 h-1.5 bg-brand-purple rounded-full pointer-events-none group-hover/slider:h-2 transition-all shadow-sm"
                                        style={{ width: `${(currentTime / (audioDuration || duration)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-6 text-gray-600">
                              <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                                </svg>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Master Volume</span>
                             </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold rounded-2xl px-8 py-5 mb-10 text-center animate-in shake">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button
                        onClick={handleDiscard}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-gray-50 dark:bg-white/5 rounded-2xl text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] border border-gray-100 dark:border-white/5 hover:border-rose-500/30 hover:text-rose-500 transition-all active:scale-95 group"
                    >
                        <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        Discard Recording
                    </button>

                    <button
                        onClick={handleConfirm}
                        disabled={uploading}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-4 px-12 py-5 bg-brand-purple text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-brand-purple/20 disabled:opacity-40"
                    >
                        {uploading ? (
                            <>
                                <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                                Transmitting...
                            </>
                        ) : (
                            <>
                                Initialize Analysis
                                <svg className="w-5 h-5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-12 flex flex-col items-center gap-6">
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                         <span className="w-1.5 h-1.5 rounded-full bg-brand-purple shadow-sm" />
                        Processing Estimated: 180 Seconds
                    </p>
                    
                    <footer className="text-[10px] font-black text-gray-800 uppercase tracking-widest border-t border-white/5 pt-8 w-full text-center">
                        © {new Date().getFullYear()} sharpen.ai • High Precision Performance Analytics
                    </footer>
                </div>
            </main>
        </div>
    );
}

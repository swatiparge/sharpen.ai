'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { createInterview, getMediaUploadUrl, uploadFileToS3, triggerAnalysis } from '@/lib/api';

const ROUNDS = [
    { label: 'Technical', value: 'TECHNICAL' },
    { label: 'Behavioral', value: 'BEHAVIORAL' },
    { label: 'System Design', value: 'SYSTEM_DESIGN' },
    { label: 'Screen', value: 'SCREEN' },
    { label: 'Other', value: 'OTHER' },
];

export default function SetupRecordingPage() {
    const { user, token } = useAuth();
    const router = useRouter();

    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [round, setRound] = useState('TECHNICAL');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const allowed = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a', 'audio/webm', 'audio/mp3'];
        if (!allowed.includes(file.type)) {
            setError('Supported formats: MP3, WAV, M4A');
            return;
        }
        setAudioFile(file);
        setError('');
    };

    const handleUploadAndAnalyze = async () => {
        if (!name.trim()) { setError('Interview name is required'); return; }
        if (!audioFile || !token) return;

        setUploading(true);
        setError('');
        try {
            // 1. Create interview
            const interview = await createInterview(token, {
                name: name.trim(),
                company: company.trim() || undefined,
                round,
                interview_type: 'RECORDED',
            });

            // 2. Get upload URL
            const { upload_url } = await getMediaUploadUrl(
                token, interview.id, 'AUDIO', audioFile.type
            );

            // 3. Upload to S3
            await uploadFileToS3(upload_url, audioFile);

            // 4. Trigger analysis
            await triggerAnalysis(token, interview.id);

            // 5. Navigate to analysis page
            router.push(`/dashboard/record/analyzing/${interview.id}`);
        } catch (err: any) {
            setError(err.message || 'Failed to upload');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0B1221] font-sans selection:bg-brand-purple/30 transition-colors duration-500">
            <main className="max-w-3xl mx-auto px-8 py-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="mb-16 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-purple/[0.08] border border-brand-purple/20 text-[10px] font-bold text-brand-purple uppercase tracking-[0.2em] mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse" />
                        AI Analysis Engine
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight font-serif italic">Intelligence Upload</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-base max-w-xl mx-auto leading-relaxed">
                        Securely upload your session. Our AI will dissect your performance across 8 high-signal competencies.
                    </p>
                </div>

                {error && (
                    <div className="bg-rose-500/5 border border-rose-500/10 text-rose-500 text-[13px] font-bold rounded-2xl px-6 py-4 mb-10 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {error}
                    </div>
                )}

                <div className="bg-white dark:bg-[#0F172A]/40 rounded-[3rem] p-10 md:p-14 border border-gray-100 dark:border-white/5 shadow-soft relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-brand-purple opacity-20" />
                    
                    {/* Interview Details */}
                    <section className="mb-12 relative z-10">
                        <div className="flex items-center gap-4 mb-10">
                            <h2 className="text-[10px] font-bold text-gray-400 dark:text-gray-600 tracking-[0.4em] uppercase">Session Metadata</h2>
                            <div className="h-px flex-1 bg-gray-100 dark:bg-white/5" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2 group">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 group-focus-within:text-brand-purple transition-colors">Interview Position</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Staff Design Engineer"
                                    className="w-full bg-gray-50/50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 transition-all font-medium shadow-sm"
                                />
                            </div>

                            <div className="space-y-2 group">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 group-focus-within:text-brand-purple transition-colors">
                                    Target Company <span className="text-gray-400 dark:text-gray-600 italic lowercase ml-2">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    placeholder="e.g. OpenAI"
                                    className="w-full bg-gray-50/50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 transition-all font-medium shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-8 space-y-2 group">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 group-focus-within:text-brand-purple transition-colors">Interview Round</label>
                            <div className="relative">
                                <select
                                    value={round}
                                    onChange={(e) => setRound(e.target.value)}
                                    className="w-full bg-gray-50/50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-4 text-gray-900 dark:text-white focus:outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 transition-all font-medium appearance-none cursor-pointer shadow-sm"
                                >
                                    {ROUNDS.map((r) => <option key={r.value} value={r.value} className="bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white">{r.label}</option>)}
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Upload audio file */}
                    <section className="mb-12 relative z-10">
                        <div className="flex items-center gap-4 mb-10">
                            <h2 className="text-[10px] font-bold text-gray-400 dark:text-gray-600 tracking-[0.4em] uppercase">Audio Payload</h2>
                            <div className="h-px flex-1 bg-gray-100 dark:bg-white/5" />
                        </div>

                        <div
                            onClick={() => !uploading && fileInputRef.current?.click()}
                            className={`relative border-2 border-dashed rounded-[3rem] p-10 text-center transition-all duration-500 group/upload overflow-hidden ${audioFile
                                ? 'border-brand-purple/30 bg-brand-purple/[0.02]'
                                : 'border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] hover:border-brand-purple/30 hover:bg-brand-purple/[0.01] cursor-pointer'
                                }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".mp3,.wav,.m4a,.webm"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            {audioFile ? (
                                <div className="relative z-10 animate-in zoom-in-95 duration-500">
                                    <div className="w-20 h-20 bg-brand-purple text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="text-gray-900 dark:text-white font-bold text-xl mb-2">Ready for analysis</div>
                                    <div className="text-brand-purple font-bold text-sm tracking-tight">{audioFile.name}</div>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase tracking-widest mt-6 group-hover/upload:text-brand-purple transition-colors">Click to replace</p>
                                </div>
                            ) : (
                                <div className="relative z-10 group-hover/upload:scale-[1.02] transition-transform duration-500">
                                    <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 rounded-[2rem] flex items-center justify-center mx-auto mb-8 transition-colors group-hover/upload:text-brand-purple group-hover/upload:border-brand-purple/20">
                                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-900 dark:text-white font-bold text-xl mb-2 group-hover/upload:text-brand-purple transition-colors">
                                        Drop your recording here
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                                        MP3, WAV, or M4A format supported
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Actions */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 pt-10 border-t border-gray-100 dark:border-white/5">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="text-[11px] font-bold text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white uppercase tracking-[0.2em] transition-all flex items-center gap-2 group/back"
                        >
                            <svg className="w-4 h-4 transition-transform group-hover/back:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                            Cancel
                        </button>

                        <button
                            onClick={handleUploadAndAnalyze}
                            disabled={uploading || !name.trim() || !audioFile}
                            className={`min-w-[240px] px-10 py-4 rounded-[1.25rem] font-bold text-[13px] uppercase tracking-widest transition-all duration-500 relative flex items-center justify-center gap-3 overflow-hidden ${uploading || !name.trim() || !audioFile
                                ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : 'bg-brand-purple text-white shadow-sm hover:brightness-110 active:scale-95'
                                }`}
                        >
                            {uploading ? (
                                <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Initiate Analysis</span>
                                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="mt-12 flex items-center justify-center gap-2 text-gray-400 dark:text-gray-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110.1 21a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0113.9 3a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Enterprise-grade Privacy Enforced</span>
                </div>
            </main>
        </div>
    );
}

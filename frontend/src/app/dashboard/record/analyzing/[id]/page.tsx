'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getInterview, triggerAnalysis } from '@/lib/api';

const PIPELINE_STEPS = [
    {
        key: 'processing',
        label: 'Processing Audio',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
        ),
    },
    {
        key: 'extracting',
        label: 'Extracting Signals',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
            </svg>
        ),
    },
    {
        key: 'scoring',
        label: 'Scoring Performance',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
        ),
    },
    {
        key: 'finalizing',
        label: 'Finalizing Feedback',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
        ),
    },
];

const PRO_TIPS = [
    {
        title: 'What is Structural Thinking?',
        body: 'Breaking down complex problems into smaller, manageable components (like the MECE framework) is highly valued by interviewers as it demonstrates clarity and logic.',
        cta: 'Learn Frameworks',
    },
    {
        title: 'Why STAR Method Works',
        body: 'Structuring behavioral answers using Situation, Task, Action, Result ensures you cover all key points and demonstrate measurable impact.',
        cta: 'Practice STAR',
    },
    {
        title: 'Active Listening Signals',
        body: 'Paraphrasing questions before answering shows interviewers you understand the problem. This reduces misunderstandings and builds rapport.',
        cta: 'View Tips',
    },
];

export default function AnalyzingPage() {
    const { token } = useAuth();
    const router = useRouter();
    const params = useParams();
    const interviewId = params.id as string;

    const [activeStep, setActiveStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [tipIndex, setTipIndex] = useState(0);
    const [status, setStatus] = useState('ANALYZING');
    const [failureReason, setFailureReason] = useState<string | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);

    // Simulate progress movement while waiting
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 95) return prev; // cap at 95 until done
                const step = Math.floor(prev / 25);
                setActiveStep(step);
                return prev + Math.random() * 2;
            });
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    // Rotate tips
    useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % PRO_TIPS.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    // Poll backend for actual status
    const pollStatus = useCallback(async () => {
        if (!token || !interviewId) return;
        try {
            const interview = await getInterview(token, interviewId);
            setStatus(interview.status);
            if (interview.status === 'DONE' || interview.status === 'COMPLETED' || interview.status === 'ANALYZED') {
                setProgress(100);
                setActiveStep(4);
                setTimeout(() => {
                    router.push(`/dashboard/interviews/${interviewId}`);
                }, 500);
            } else if (interview.status === 'FAILED') {
                setProgress(0); // will show error
                setFailureReason(interview.failure_reason || 'Something went wrong. Please try again.');
            }
        } catch {
            // ignore polling errors
        }
    }, [token, interviewId, router]);

    useEffect(() => {
        if (!token || !interviewId) return;
        
        const interval = setInterval(pollStatus, 3000);
        pollStatus(); // immediate first poll
        return () => clearInterval(interval);
    }, [token, interviewId, pollStatus]);
    const handleRetry = async () => {
        if (!token || !interviewId) return;
        setIsRetrying(true);
        try {
            await triggerAnalysis(token, interviewId);
            setStatus('ANALYZING');
            setFailureReason(null);
            setProgress(0);
            setActiveStep(0);
        } catch (err: any) {
            setFailureReason(err.message || 'Failed to restart analysis');
        } finally {
            setIsRetrying(false);
        }
    };

    const currentTip = PRO_TIPS[tipIndex];

    return (
        <div className="min-h-screen bg-white dark:bg-[#0A0E14] flex flex-col selection:bg-brand-purple/30">
            <main className="flex-1 max-w-7xl mx-auto px-8 py-20 w-full animate-in fade-in duration-1000">
                <div className="mb-16">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <div className="px-4 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                            Live Pipeline
                        </div>
                        <div className="px-4 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                            SECURE INSTANCE: #{interviewId.slice(0, 8)}
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight font-serif italic">Intelligence Synthesis</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg leading-relaxed max-w-2xl">Processing high-fidelity signals. Our AI core is dissecting your professional narrative.</p>
                </div>

                {/* Pipeline steps */}
                {status !== 'FAILED' && (
                    <div className="flex items-center justify-between mb-20 relative px-4">
                        <div className="absolute top-6 left-12 right-12 h-px bg-gray-100 dark:bg-white/5 z-0" />
                        {PIPELINE_STEPS.map((step, i) => {
                            const isActive = i === activeStep;
                            const isDone = i < activeStep;
                            return (
                                <div key={step.key} className="flex flex-col items-center flex-1 relative z-10 group">
                                    <div
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 border-2 ${isActive
                                            ? 'bg-brand-purple text-white border-brand-purple scale-110'
                                            : isDone
                                                ? 'bg-white dark:bg-midnight-900 text-brand-purple border-gray-100 dark:border-white/10'
                                                : 'bg-gray-50 dark:bg-white/5 text-gray-300 dark:text-gray-700 border-transparent group-hover:bg-gray-100 dark:group-hover:bg-white/10'
                                            }`}
                                    >
                                        {isDone ? (
                                            <svg className="w-6 h-6 animate-in zoom-in-50 duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                        ) : (
                                            <div className={isActive ? 'animate-pulse' : ''}>{step.icon}</div>
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                                        {step.label}
                                    </span>
                                    <div className="mt-2 h-1 overflow-hidden w-12 rounded-full bg-gray-100 dark:bg-white/5">
                                        <div className={`h-full transition-all duration-1000 ${isDone ? 'w-full bg-brand-purple' : isActive ? 'w-1/2 bg-brand-purple animate-pulse' : 'w-0'}`} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Content grid */}
                <div className={`grid grid-cols-1 gap-10 ${status === 'FAILED' ? '' : 'lg:grid-cols-5'}`}>
                    {/* Main progress area */}
                    <div className={`${status === 'FAILED' ? 'max-w-4xl mx-auto w-full' : 'lg:col-span-3'} bg-white dark:bg-[#0F172A]/40 rounded-[3.5rem] border border-gray-100 dark:border-white/5 p-12 md:p-16 shadow-soft relative overflow-hidden group`}>
                         <div className="absolute top-0 left-0 w-full h-1 bg-brand-purple opacity-20" />
                         
                        <div className="flex flex-col items-center relative z-10">
                            {/* Spinner or Error Icon */}
                            {status === 'FAILED' ? (
                                <div className="w-24 h-24 rounded-[2.5rem] bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mb-10 shadow-sm">
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="relative mb-12">
                                    <div className="w-28 h-28 rounded-full border-4 border-gray-100 dark:border-white/5 border-t-brand-purple animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-brand-purple/10 animate-pulse flex items-center justify-center">
                                            <div className="w-4 h-4 rounded-full bg-brand-purple shadow-sm" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight text-center">
                                {status === 'FAILED'
                                    ? 'Analysis Terminated'
                                    : activeStep === 0
                                        ? 'Transcription Engine Active'
                                        : activeStep === 1
                                            ? 'Signal Extraction Underway'
                                            : activeStep === 2
                                                ? 'Scoring Competency Matrix'
                                                : 'Generating High-Fidelity Insights'}
                            </h2>
                            <p className={`text-lg text-center max-w-xl mb-12 font-medium leading-relaxed ${status === 'FAILED' ? 'text-rose-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                {status === 'FAILED'
                                    ? (failureReason || 'An error occurred during state transition. Please try again.')
                                    : 'Our specialized models are evaluating tone, logic depth, and linguistic precision. This phase ensures maximum analytical clarity.'}
                            </p>

                            {status === 'FAILED' && (
                                <button
                                    onClick={handleRetry}
                                    disabled={isRetrying}
                                    className="px-10 py-5 bg-brand-purple text-white font-bold rounded-2xl hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-3 shadow-sm active:scale-95"
                                >
                                    {isRetrying ? (
                                        <>
                                            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                            Re-Initiating...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                            </svg>
                                            Try Again
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Progress bar — hidden on failure */}
                            {status !== 'FAILED' && (
                                <div className="w-full max-w-lg mt-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em]">Processing Density</span>
                                        <span className="text-[10px] font-bold text-brand-purple tracking-widest">{Math.round(progress)}%</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-gray-100 dark:border-white/5">
                                        <div
                                            className="h-full bg-brand-purple rounded-full transition-all duration-1000"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Side panel — pro tips (hide on failure) */}
                    {status !== 'FAILED' && (
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white dark:bg-[#0F172A]/40 rounded-[3rem] border border-gray-100 dark:border-white/5 p-10 overflow-hidden relative group/tip shadow-soft">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 blur-[60px] rounded-full opacity-60 transition-opacity" />
                                
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-purple mb-8 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-brand-purple animate-pulse" />
                                    Neural Insight
                                </p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight">{currentTip.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-10">{currentTip.body}</p>
                                <button className="w-full py-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all transform active:scale-95 group/btn flex items-center justify-center gap-2 shadow-sm">
                                    {currentTip.cta}
                                    <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                            </div>

                            <div className="bg-gray-50/50 dark:bg-[#0F172A]/20 rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8">
                                <h3 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-brand-purple shadow-sm border border-gray-100 dark:border-white/10">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                        </svg>
                                    </div>
                                    Analysis Process
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
                                    Our core models analyze linguistic structural logic and sentiment drift in real-time. We extract high-signal markers of your professional narrative.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="px-12 py-8 flex items-center justify-between text-[11px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#0A0E14]">
                <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    ENCRYPTED COMPUTE CLUSTER ACTIVE
                </span>
                <div className="flex gap-8">
                    <button className="hover:text-gray-900 dark:hover:text-white transition-colors">Emergency Support</button>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="hover:text-rose-500 transition-colors"
                    >
                        Terminate Pipeline
                    </button>
                </div>
            </footer>
        </div>
    );
}

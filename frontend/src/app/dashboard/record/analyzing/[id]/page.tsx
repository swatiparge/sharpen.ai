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
                    router.push(`/dashboard`); // TODO: navigate to results page
                }, 1500);
            } else if (interview.status === 'FAILED') {
                setProgress(0); // will show error
                setFailureReason(interview.failure_reason || 'Something went wrong. Please try again.');
            }
        } catch {
            // ignore polling errors
        }
    }, [token, interviewId, router]);

    useEffect(() => {
        const interval = setInterval(pollStatus, 10000);
        pollStatus(); // immediate first poll
        return () => clearInterval(interval);
    }, [pollStatus]);
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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Analyzing your recording</h1>
                <p className="text-gray-500 mb-10">Processing high-fidelity insights for your session.</p>

                {/* Pipeline steps */}
                {status !== 'FAILED' && (
                    <div className="flex items-center justify-between mb-12">
                        {PIPELINE_STEPS.map((step, i) => {
                            const isActive = i === activeStep;
                            const isDone = i < activeStep;
                            return (
                                <div key={step.key} className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${isActive
                                            ? 'bg-brand-700 text-white shadow-lg'
                                            : isDone
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-gray-100 text-gray-400'
                                            }`}
                                    >
                                        {isDone ? (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                        ) : (
                                            step.icon
                                        )}
                                    </div>
                                    <span className={`text-xs font-semibold ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {step.label}
                                    </span>
                                    <span className={`text-xs mt-0.5 ${isActive ? 'text-brand-700 font-medium' : 'text-gray-400'}`}>
                                        {isDone ? 'Done' : isActive ? 'Active' : 'Pending'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Content grid */}
                <div className={`grid grid-cols-1 gap-8 ${status === 'FAILED' ? '' : 'lg:grid-cols-5'}`}>
                    {/* Main progress area */}
                    <div className={`${status === 'FAILED' ? 'max-w-3xl mx-auto w-full' : 'lg:col-span-3'} bg-white rounded-xl border border-gray-200 p-8`}>
                        <div className="flex flex-col items-center">
                            {/* Spinner or Error Icon */}
                            {status === 'FAILED' ? (
                                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
                                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-brand-700 animate-spin mb-6" />
                            )}

                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                {status === 'FAILED'
                                    ? 'Analysis failed'
                                    : activeStep === 0
                                        ? 'Transcribing audio into structured data…'
                                        : activeStep === 1
                                            ? 'Extracting vocal and linguistic signals…'
                                            : activeStep === 2
                                                ? 'Scoring your performance metrics…'
                                                : 'Finalizing your feedback report…'}
                            </h2>
                            <p className={`text-sm text-center max-w-md mb-8 ${status === 'FAILED' ? 'text-red-500' : 'text-gray-500'}`}>
                                {status === 'FAILED'
                                    ? (failureReason || 'Something went wrong. Please try again or check the backend logs.')
                                    : 'This usually takes 1-2 minutes depending on the duration. We are identifying speaker changes and linguistic patterns.'}
                            </p>

                            {status === 'FAILED' && (
                                <button
                                    onClick={handleRetry}
                                    disabled={isRetrying}
                                    className="mb-8 px-6 py-2 bg-brand-700 text-white font-semibold rounded-lg hover:bg-brand-800 disabled:opacity-60 transition-colors flex items-center gap-2"
                                >
                                    {isRetrying ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Retrying...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                            </svg>
                                            Retry Analysis
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Progress bar — hidden on failure */}
                            {status !== 'FAILED' && (
                                <div className="w-full">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Overall Progress</span>
                                        <span className="text-xs font-bold text-gray-500">{Math.round(progress)}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-brand-700 rounded-full transition-all duration-1000"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Side panel — pro tips (hide on failure) */}
                    {status !== 'FAILED' && (
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-brand-700 rounded-xl p-6 text-white">
                                <p className="text-xs font-semibold uppercase tracking-wider text-blue-200 mb-3 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-400" />
                                    Interviewing Pro-Tip
                                </p>
                                <h3 className="text-lg font-bold mb-2">{currentTip.title}</h3>
                                <p className="text-sm text-blue-100 leading-relaxed mb-4">{currentTip.body}</p>
                                <button className="w-full py-2 bg-white/15 rounded-lg text-sm font-semibold hover:bg-white/25 transition-colors uppercase tracking-wider">
                                    {currentTip.cta}
                                </button>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                    </svg>
                                    Why the wait?
                                </h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Our AI models analyze tone, sentiment, and structural logic in real-time. We don&apos;t just transcribe; we evaluate the core signals of your professional performance.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="px-6 py-4 flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    Securely processing on encrypted instances
                </span>
                <div className="flex gap-4">
                    <button className="hover:text-gray-600 uppercase tracking-wider font-medium">Support</button>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="hover:text-gray-600 uppercase tracking-wider font-medium"
                    >
                        Cancel Analysis
                    </button>
                </div>
            </footer>
        </div>
    );
}

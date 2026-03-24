'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import CoreSkillMetrics from './components/CoreSkillMetrics';
import FeedbackSection from './components/FeedbackSection';

interface InterviewData {
    id: string;
    name: string;
    company: string | null;
    round: string | null;
    interview_type: string;
    interviewed_at: string;
    status: string;
    overall_score: number | null;
    badge_label: string | null;
    summary_text: string | null;
    top_strengths: { title: string; description: string }[] | null;
    key_improvement_areas: { title: string; description: string }[] | null;
    metrics: {
        id: string;
        metric_name: string;
        score: number;
        explanation_summary: string;
    }[];
}

export default function InterviewResultsPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { user, token } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<InterviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user || !token) return;
        let timeoutId: NodeJS.Timeout;

        const fetchResults = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interviews/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to load interview');
                const json = await res.json();
                setData(json);

                // If still analyzing, poll again in 3 seconds
                if (json.status === 'ANALYZING') {
                    timeoutId = setTimeout(fetchResults, 3000);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();

        return () => clearTimeout(timeoutId);
    }, [id, user, token]);

    if (loading || data?.status === 'ANALYZING') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-8 text-center px-6 animate-in fade-in duration-1000 bg-[#FDFCFB] dark:bg-[#0B1221]">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-brand-purple/5 border-t-brand-purple animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-brand-purple">
                        <svg className="w-10 h-10 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                </div>
                <div className="space-y-4 max-w-sm">
                    <h2 className="text-3xl font-medium text-gray-900 dark:text-white tracking-tight">
                        Analyzing <span className="font-serif italic text-brand-purple text-4xl">performance</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">We are grading your answers against 8 core competencies. This usually takes about 30 seconds...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#FDFCFB] dark:bg-[#0B1221] min-h-screen p-6">
                <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-[2rem] flex items-center justify-center mb-8 border border-rose-500/20">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Interview Not Found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-10 text-center max-w-xs font-medium">{error || 'The interview record could not be retrieved.'}</p>
                <button 
                    onClick={() => router.push('/dashboard')}
                    className="px-8 py-4 bg-white/5 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all active:scale-95 shadow-sm"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    if (data.status === 'FAILED') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-8 bg-[#FDFCFB] dark:bg-[#0B1221] text-center px-6">
                 <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-[2.5rem] flex items-center justify-center border border-rose-500/20">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div className="space-y-4 max-w-md">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Analysis Failed</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">There was a problem generating your analysis. Our systems might be experiencing heavy load from the core intelligence engine.</p>
                </div>
                <button 
                    onClick={() => router.push('/dashboard')}
                    className="mt-6 bg-brand-purple hover:bg-brand-purple-light text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-brand-purple/20 active:scale-95"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    const formattedDate = new Date(data.interviewed_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <main className="flex-1 bg-[#FDFCFB] dark:bg-[#0B1221] p-6 md:p-10 transition-colors duration-300 selection:bg-brand-purple/10">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* HERO SECTION */}
                <div className="bg-white dark:bg-[#0F172A]/40 rounded-[2.5rem] p-8 md:p-10 border border-gray-100 dark:border-white/5 shadow-soft flex flex-col md:flex-row justify-between items-center gap-10 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-brand-purple opacity-30" />
                    
                    <div className="flex-1 space-y-6 relative z-10 w-full">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="px-3 py-1 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-brand-purple" />
                                {data.interview_type || 'Interview'} Result
                            </div>
                            <div className="px-3 py-1 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                {formattedDate}
                            </div>
                        </div>
                        
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight mb-4">
                                <span className="font-serif italic text-brand-purple block mb-1">{data.badge_label?.split('.')[0] || "Analysis"}</span>
                                <span className="opacity-90">{data.badge_label?.split('.')[1] || "Complete."}</span>
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-base font-medium max-w-2xl leading-relaxed">
                                {data.summary_text || "Your performance shows technical proficiency. Review your detailed metrics below."}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {data.company && (
                                <div className="flex items-center gap-2">
                                    <span className="text-brand-purple">CO:</span> <span className="text-gray-600 dark:text-gray-300">{data.company}</span>
                                </div>
                            )}
                            {data.name && (
                                <div className="flex items-center gap-2">
                                    <span className="text-brand-purple">ROLE:</span> <span className="text-gray-600 dark:text-gray-300">{data.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-shrink-0 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center justify-center min-w-[200px] shadow-sm relative group/score transition-all duration-500 hover:border-brand-purple/20">
                        <span className="text-gray-400 text-[9px] font-bold tracking-[0.2em] uppercase mb-4">Overall Score</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-7xl font-bold text-gray-900 dark:text-white tracking-tighter">{data.overall_score ? Math.round(data.overall_score * 10) : '--'}</span>
                            <span className="text-xl font-bold text-gray-400">/100</span>
                        </div>
                        <div className="mt-6 w-full h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-brand-purple transition-all duration-1000" 
                                style={{ width: `${data.overall_score ? data.overall_score * 10 : 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* METRICS & FEEDBACK PLATFORM */}
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <CoreSkillMetrics metrics={data.metrics} interviewId={id} />
                </div>
                
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <FeedbackSection 
                        strengths={data.top_strengths} 
                        weaknesses={data.key_improvement_areas} 
                    />
                </div>

            </div>
        </main>
    );
}

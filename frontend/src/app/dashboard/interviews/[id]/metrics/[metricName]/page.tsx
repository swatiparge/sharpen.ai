'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getInterview, getMetricDetail, MetricDetail, sendMetricFeedback } from '@/lib/api';

// ── Static metric knowledge base ────────────────────────────────────
const metricInfo: Record<string, {
    title: string;
    description: string;
    benchmark: string;
    tips: string[];
}> = {
    communication_clarity: {
        title: 'Communication Clarity',
        description: 'Measures how clearly and concisely you articulate your thoughts. Are you easy to follow? Do you avoid filler words and rambling? Clarity is the #1 thing interviewers notice first.',
        benchmark: 'Benchmark: 7.0 = Hirable · 8.5 = Top 5% of candidates at your level',
        tips: [
            'Use the "Pyramid Principle" — lead with your conclusion, then explain the reasoning.',
            'Record yourself answering mock questions and watch back at 0.75x speed to catch filler words.',
            'Pause instead of using "um" or "like" — silence sounds more confident than filler.',
        ],
    },
    structural_thinking: {
        title: 'Structural Thinking',
        description: 'Evaluates whether you break problems into logical steps before diving in. Top candidates use frameworks like MECE, STAR, or explicit problem decomposition to demonstrate organized thinking.',
        benchmark: 'Benchmark: 7.0 = Hirable · 8.5 = Top 5% of candidates at your level',
        tips: [
            'Before answering, say "Let me structure my thinking…" — this signals seniority.',
            'Practice MECE decomposition: break every problem into Mutually Exclusive, Collectively Exhaustive parts.',
            'Use numbered lists when speaking: "There are 3 parts to this…" keeps the interviewer oriented.',
        ],
    },
    technical_depth: {
        title: 'Technical Depth',
        description: 'How deep is your understanding beyond surface-level answers? Do you explain the "why" behind your choices, mention edge cases, or reference internal implementation details?',
        benchmark: 'Benchmark: 7.0 = Hirable · 8.5 = Top 5% of candidates at your level',
        tips: [
            'For every technical choice you mention, explain what you considered and rejected.',
            'Bring up at least one edge case or failure mode for every system you describe.',
            'Reference specifics: "16MB Redis max value limit", "DNS TTL caching issues" — precision signals expertise.',
        ],
    },
    tradeoff_awareness: {
        title: 'Tradeoff Awareness',
        description: 'Do you acknowledge the pros AND cons of your decisions? Strong engineers say "I chose X over Y because…" instead of just stating what they did. This signals senior-level thinking.',
        benchmark: 'Benchmark: 7.0 = Hirable · 8.5 = Top 5% of candidates at your level',
        tips: [
            'Use the phrase "The tradeoff here is…" consciously in every technical decision you explain.',
            'Practice system design questions where you must explicitly choose between SQL vs NoSQL, REST vs gRPC, etc.',
            'For every solution you propose, ask yourself "What would make this the wrong choice?"',
        ],
    },
    quantification_impact: {
        title: 'Quantification & Impact',
        description: 'Do your answers include numbers, scale, and business outcomes? Weak: "I improved performance." Strong: "I cut latency by 40%, saving ~$50k/month in server costs."',
        benchmark: 'Benchmark: 7.0 = Hirable · 8.5 = Top 5% of candidates at your level',
        tips: [
            'Prepare 5-7 "impact stories" with real numbers from your past work before the interview.',
            'If you do not know exact numbers, use ranges: "reduced errors by somewhere between 60-80%".',
            'Always connect technical improvements to business outcomes (revenue, retention, cost, time saved).',
        ],
    },
    followup_handling: {
        title: 'Follow-up Handling',
        description: 'How well do you respond when the interviewer digs deeper or challenges your answer? This tests intellectual honesty, adaptability, and depth of knowledge under pressure.',
        benchmark: 'Benchmark: 7.0 = Hirable · 8.5 = Top 5% of candidates at your level',
        tips: [
            'If you do not know, say: "I have not worked with that directly, but my intuition is X because…"',
            'Treat follow-up questions as an invitation to explore, not as an attack.',
            'Practice "stress interviews" where a partner aggressively challenges every statement you make.',
        ],
    },
    seniority_alignment: {
        title: 'Seniority Alignment',
        description: 'Does your answer match the scope and ownership expected at your target level? Senior engineers discuss system design, team impact, and long-term decisions — not just tasks they completed.',
        benchmark: 'Benchmark: 7.0 = Hirable · 8.5 = Top 5% of candidates at your level',
        tips: [
            'Shift your language from "I did X" to "I led/designed/decided X and here is how I got buy-in".',
            'Include cross-team impact: "This affected 3 downstream teams, so I proactively communicated..."',
            'Show ownership of outcomes, not just tasks: "The system I designed handled 10x traffic with no incidents."',
        ],
    },
    confidence_signal: {
        title: 'Confidence Signal',
        description: 'Do you communicate with conviction? This covers tone, pacing, directness, and avoiding excessive hedging ("I think maybe...", "Not sure but..."). Confidence builds interviewer trust.',
        benchmark: 'Benchmark: 7.0 = Hirable · 8.5 = Top 5% of candidates at your level',
        tips: [
            'Replace "I think maybe" with "My approach would be" — same idea, 3x more authoritative.',
            'Slow down. Confident people speak at ~130 WPM. Nervous people speak at 180+ WPM.',
            'If challenged, do not immediately back down — say "That is a fair point, let me think through it."',
        ],
    },
};

function getScoreColor(score: number) {
    if (score >= 8.5) return { 
        bar: 'bg-brand-purple', 
        text: 'text-brand-purple', 
        bg: 'bg-brand-purple/5', 
        border: 'border-brand-purple/10', 
        shadow: 'shadow-sm',
        label: 'Exceptional' 
    };
    if (score >= 7.0) return { 
        bar: 'bg-brand-purple/70', 
        text: 'text-brand-purple/80', 
        bg: 'bg-brand-purple/5', 
        border: 'border-brand-purple/10', 
        shadow: 'shadow-sm',
        label: 'Solid' 
    };
    if (score >= 5.0) return { 
        bar: 'bg-amber-500', 
        text: 'text-amber-500', 
        bg: 'bg-amber-500/5', 
        border: 'border-amber-500/10', 
        shadow: 'shadow-sm',
        label: 'Developing' 
    };
    return { 
        bar: 'bg-rose-500', 
        text: 'text-rose-500', 
        bg: 'bg-rose-500/5', 
        border: 'border-rose-500/10', 
        shadow: 'shadow-sm',
        label: 'Needs Work' 
    };
}

export default function MetricDetailPage() {
    const { token } = useAuth();
    const router = useRouter();
    const params = useParams();
    const interviewId = params.id as string;
    const metricName = params.metricName as string;

    const [metric, setMetric] = useState<MetricDetail | null>(null);
    const [interview, setInterview] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Feedback state
    const [feedbackSent, setFeedbackSent] = useState<'AGREE' | 'DISAGREE' | null>(null);
    const [showDisagreeModal, setShowDisagreeModal] = useState(false);
    const [userFeedbackScore, setUserFeedbackScore] = useState('');
    const [userFeedbackComment, setUserFeedbackComment] = useState('');

    const handleFeedback = async (type: 'AGREE' | 'DISAGREE') => {
        if (!token || !interviewId || !metricName) return;
        
        try {
            await sendMetricFeedback(token, interviewId, metricName, {
                feedback_type: type,
                user_score: userFeedbackScore ? parseFloat(userFeedbackScore) : undefined,
                comment: userFeedbackComment
            });
            setFeedbackSent(type);
            setShowDisagreeModal(false);
        } catch (err) {
            console.error('Failed to send feedback:', err);
        }
    };

    useEffect(() => {
        if (!token || !interviewId || !metricName) return;
        Promise.all([
            getMetricDetail(token, interviewId, metricName),
            getInterview(token, interviewId),
        ]).then(([m, iv]) => {
            setMetric(m);
            setInterview(iv);
        }).catch(console.error)
          .finally(() => setLoading(false));
    }, [token, interviewId, metricName]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0B1221] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-gray-100 dark:border-white/5 border-t-brand-purple rounded-full animate-spin" />
            </div>
        );
    }

    if (!metric) {
        return (
            <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0B1221] flex items-center justify-center">
                <p className="text-gray-400 dark:text-gray-600 font-bold uppercase tracking-widest text-[10px]">Metric not found</p>
            </div>
        );
    }

    const info = metricInfo[metric.metric_name] || {
        title: metric.metric_name,
        description: '',
        benchmark: 'Benchmark: 7.0 = Hirable · 8.5 = Top 5%',
        tips: [],
    };
    const score = Number(metric.score) || 0;
    const colors = getScoreColor(score);
    const progressPercentage = (score / 10) * 100;

    return (
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0B1221] transition-colors duration-500 selection:bg-brand-purple/20">
            <div className="max-w-4xl mx-auto px-6 py-16">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-3 text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <button onClick={() => router.push('/dashboard')} className="hover:text-brand-purple transition-colors">Dashboard</button>
                    <span className="text-gray-200 dark:text-white/10">/</span>
                    <button onClick={() => router.back()} className="hover:text-brand-purple transition-colors max-w-[150px] truncate">
                        {interview?.name || 'Session'}
                    </button>
                    <span className="text-gray-200 dark:text-white/10">/</span>
                    <span className="text-brand-purple">{info.title}</span>
                </nav>

                {/* Page title */}
                <div className="mb-12">
                    <span className="text-[10px] font-bold text-brand-purple uppercase tracking-[0.3em] mb-3 block">Performance vector</span>
                    <h1 className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-6 font-serif italic">{info.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium max-w-2xl leading-relaxed">{info.description}</p>
                </div>

                {/* Score card */}
                <div className="bg-white dark:bg-[#0F172A]/40 border border-gray-100 dark:border-white/5 rounded-[3rem] p-8 md:p-12 mb-8 shadow-soft relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col md:flex-row gap-12">
                        {/* Score block */}
                        <div className="flex-shrink-0 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2.5rem] pb-10 pt-12 px-10 text-center min-w-[200px]">
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-4">Precision Index</p>
                            <div className="relative inline-block mb-4">
                                <p className={`text-7xl font-medium ${colors.text} tracking-tighter tabular-nums leading-none`}>
                                    {score.toFixed(1)}
                                </p>
                            </div>
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-700 mt-2 tracking-widest uppercase">Rank: <span className={colors.text}>{colors.label}</span></p>
                            
                            <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2 mt-8 overflow-hidden">
                                <div className={`${colors.bar} h-full rounded-full transition-all duration-1000`} style={{ width: `${progressPercentage}%` }} />
                            </div>
                        </div>

                        {/* What is this + calibration */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-8">
                                    <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mr-2">Calibration Targets:</div>
                                    <span className="text-[9px] font-bold text-gray-500 dark:text-white bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                                        {interview?.experience_level} Year Level
                                    </span>
                                    {interview?.company && (
                                        <span className="text-[9px] font-bold text-brand-purple bg-brand-purple/5 border border-brand-purple/10 px-3 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                                            @ {interview.company.toUpperCase()}
                                        </span>
                                    )}
                                    {interview?.round && (
                                        <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                                            {interview.round.replace(/_/g, ' ')} Round
                                        </span>
                                    )}
                                </div>

                                <div className={`text-sm font-bold uppercase tracking-widest px-6 py-4 rounded-2xl ${colors.bg} ${colors.text} border ${colors.border} inline-block`}>
                                   <div className="flex items-center gap-3">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h6m0 0v6m0-6L10 19m-3-3l-4 4" />
                                        </svg>
                                        {info.benchmark}
                                   </div>
                                </div>
                            </div>

                            {/* Feedback buttons */}
                            <div className="mt-12 pt-8 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Feedback</span>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => handleFeedback('AGREE')}
                                        disabled={!!feedbackSent}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                                            feedbackSent === 'AGREE' 
                                            ? 'bg-brand-purple border-brand-purple text-white' 
                                            : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-400 dark:text-white/40 hover:border-brand-purple/30 hover:text-brand-purple'
                                        } disabled:opacity-50 active:scale-95 shadow-sm`}
                                    >
                                        Accurate Analysis
                                    </button>
                                    <button 
                                        onClick={() => setShowDisagreeModal(true)}
                                        disabled={!!feedbackSent}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                                            feedbackSent === 'DISAGREE' 
                                            ? 'bg-rose-500 border-rose-500 text-white' 
                                            : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-400 dark:text-white/40 hover:border-rose-500/30 hover:text-rose-500'
                                        } disabled:opacity-50 active:scale-95 shadow-sm`}
                                    >
                                        Misaligned
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Disagree Modal */}
                {showDisagreeModal && (
                    <div className="fixed inset-0 bg-gray-900/40 dark:bg-[#0A0E14]/80 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-[#0B1221] border border-gray-100 dark:border-white/10 rounded-[3rem] p-10 max-w-md w-full shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight leading-tight font-serif italic">Calibrate Analysis</h3>
                                <p className="text-gray-500 text-sm font-medium mb-8">What was your evaluated score for this dimension?</p>
                                
                                <div className="space-y-6">
                                    <div className="group">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3 group-focus-within:text-brand-purple transition-colors">Proposed Score (0-10)</label>
                                        <input 
                                            type="number" 
                                            step="0.1" 
                                            min="0" 
                                            max="10"
                                            placeholder="7.5"
                                            className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl px-6 py-4.5 text-gray-900 dark:text-white focus:outline-none focus:border-brand-purple/50 focus:ring-4 focus:ring-brand-purple/5 transition-all font-bold placeholder:text-gray-300"
                                            value={userFeedbackScore}
                                            onChange={(e) => setUserFeedbackScore(e.target.value)}
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3 group-focus-within:text-brand-purple transition-colors">Context & Feedback</label>
                                        <textarea 
                                            rows={3}
                                            placeholder="Explain why this feels misaligned..."
                                            className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl px-6 py-4.5 text-gray-900 dark:text-white focus:outline-none focus:border-brand-purple/50 focus:ring-4 focus:ring-brand-purple/5 transition-all font-medium placeholder:text-gray-300 resize-none"
                                            value={userFeedbackComment}
                                            onChange={(e) => setUserFeedbackComment(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button 
                                            onClick={() => setShowDisagreeModal(false)}
                                            className="flex-1 px-6 py-5 rounded-2xl text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-all bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 active:scale-95"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={() => handleFeedback('DISAGREE')}
                                            className="flex-1 px-6 py-5 bg-brand-purple text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-sm hover:brightness-110 active:scale-95 transition-all"
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Explanation */}
                {metric.explanation_summary && (
                    <div className="bg-white dark:bg-[#0F172A]/40 border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 mb-8 shadow-soft relative overflow-hidden group transition-all duration-300">
                        <div className="flex items-center gap-3 mb-8 relative z-10">
                            <div className="w-8 h-8 rounded-lg bg-brand-purple/5 border border-brand-purple/10 flex items-center justify-center text-brand-purple">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h2 className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">Neural Observation</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed font-medium relative z-10">{metric.explanation_summary}</p>
                    </div>
                )}

                {/* Specific Examples */}
                {metric.examples && metric.examples.length > 0 && (
                    <div className="bg-white dark:bg-[#0F172A]/40 border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 mb-8 shadow-soft transition-all duration-300">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-8 h-8 rounded-lg bg-brand-purple/5 border border-brand-purple/10 flex items-center justify-center text-brand-purple">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                                </svg>
                            </div>
                            <h2 className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">Candidate Evidence</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            {metric.examples.map((ex) => {
                                const isPositive = ex.label?.toUpperCase().includes('STRONG');
                                return (
                                    <div key={ex.id} className={`group relative rounded-[2rem] border overflow-hidden p-8 transition-all duration-500 ${isPositive ? 'border-green-500/10 bg-green-500/[0.02] dark:bg-green-500/[0.01]' : 'border-amber-500/10 bg-amber-500/[0.02] dark:bg-amber-500/[0.01]'}`}>
                                        <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-2xl text-[9px] font-bold uppercase tracking-widest ${isPositive ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                                            {ex.label?.toUpperCase() || 'DATA POINT'}
                                        </div>
                                        
                                        {ex.question_text && (
                                            <div className="mb-6">
                                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest block mb-2 opacity-60">Session Context:</span>
                                                <p className="text-sm font-bold text-gray-600 dark:text-white/90 leading-relaxed border-l-2 border-brand-purple/20 dark:border-white/10 pl-4 py-1 italic">
                                                    {ex.question_text}
                                                </p>
                                            </div>
                                        )}
                                        
                                        <div className="flex gap-4">
                                            <div className="pt-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-green-500' : 'bg-amber-500'}`} />
                                            </div>
                                            <p className={`text-md leading-relaxed font-medium ${isPositive ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                                &ldquo;{ex.comment}&rdquo;
                                            </p>
                                        </div>
                                        
                                        {ex.segment_text && ex.segment_text !== ex.comment && (
                                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 flex items-center gap-3">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-white/2 px-3 py-1 rounded-md border border-gray-100 dark:border-white/5">Transcript Segment</span>
                                                <p className="text-xs text-gray-400 dark:text-gray-600 font-bold truncate max-w-md">&ldquo;{ex.segment_text}&rdquo;</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Personalized Suggestions (Adaptive Insights) */}
                {metric.explanation_summary && metric.explanation_summary.includes('|') && (
                    <div className="bg-white dark:bg-[#0F172A]/40 border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 mb-8 shadow-soft relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-brand-purple/5 border border-brand-purple/10 flex items-center justify-center text-brand-purple">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                    </svg>
                                </div>
                                <h2 className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">Adaptive Insights</h2>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            {metric.explanation_summary.split(' | ').map((tip, i) => (
                                <div key={i} className="flex flex-col gap-4 p-8 bg-gray-50 dark:bg-white/[0.02] rounded-[1.8rem] border border-gray-100 dark:border-white/5 hover:border-brand-purple/10 transition-all duration-500 h-full group/tip relative">
                                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-xl bg-brand-purple text-white shadow-sm flex items-center justify-center text-[10px] font-bold transform -rotate-12 transition-transform group-hover/tip:rotate-0">
                                        {i + 1}
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 text-md font-medium leading-relaxed">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Practice Framework (Optimization Protocols) */}
                <div className="bg-white dark:bg-[#0F172A]/40 border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 mb-12 shadow-soft relative overflow-hidden group transition-all duration-300">
                    <div className="flex items-center gap-3 mb-10 relative z-10">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                            </svg>
                        </div>
                        <h2 className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">Optimization Protocols</h2>
                    </div>
                    
                    <div className="space-y-6 relative z-10">
                        {info.tips.map((tip, i) => (
                            <div key={i} className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/5 hover:border-brand-purple/10 transition-all duration-300 group/kb">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center mt-1 group-hover/kb:bg-brand-purple/5 group-hover/kb:border-brand-purple/20 transition-all">
                                    <svg className="w-4 h-4 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-[15px] font-medium leading-relaxed pt-1 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Back CTA */}
                <button
                    onClick={() => router.back()}
                    className="group w-full py-6 bg-gray-50 dark:bg-white/[0.03] text-gray-400 dark:text-gray-600 font-bold text-[10px] uppercase tracking-[0.3em] rounded-[2rem] border border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-white transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-4"
                >
                    <svg className="w-5 h-5 transition-transform group-hover:-translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Return to Mission Overview
                </button>
            </div>
        </div>
    );
}

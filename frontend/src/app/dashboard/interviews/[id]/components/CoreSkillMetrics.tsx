'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Metric {
    id: string;
    metric_name: string;
    score: number;
}

interface CoreSkillMetricsProps {
    metrics: Metric[];
    interviewId: string;
}

const metricInfo: Record<string, { title: string; tooltip: string }> = {
    communication_clarity: {
        title: 'Communication Clarity',
        tooltip: 'How clearly and concisely you articulate your thoughts. Are you easy to follow? Do you avoid filler words and rambling? Clarity is the #1 thing interviewers notice first.',
    },
    structural_thinking: {
        title: 'Structural Thinking',
        tooltip: 'Do you break problems into logical steps before diving in? Top candidates use frameworks like MECE, STAR, or problem-decomposition to show organized thinking.',
    },
    technical_depth: {
        title: 'Technical Depth',
        tooltip: 'How deep is your actual understanding beyond surface-level answers? Do you explain the "why" behind your choices, mention edge cases, or reference internal implementation details?',
    },
    tradeoff_awareness: {
        title: 'Tradeoff Awareness',
        tooltip: 'Do you acknowledge the pros AND cons of your decisions? Strong engineers say "I chose X over Y because…" instead of just stating what they did. Shows senior-level thinking.',
    },
    quantification_impact: {
        title: 'Quantification & Impact',
        tooltip: 'Do your answers include numbers, scale, and business outcomes? Weak: "I improved performance." Strong: "I cut latency by 40%, saving ~$50k/month in server costs."',
    },
    followup_handling: {
        title: 'Follow-up Handling',
        tooltip: 'How well do you respond when the interviewer digs deeper or challenges your answer? This tests intellectual honesty, adaptability, and depth of knowledge under pressure.',
    },
    seniority_alignment: {
        title: 'Seniority Alignment',
        tooltip: 'Does your answer match the scope and ownership expected at your target level? Senior engineers talk about system design, team impact, and long-term decisions — not just tasks they completed.',
    },
    confidence_signal: {
        title: 'Confidence Signal',
        tooltip: 'Do you communicate with conviction? This covers tone, pacing, directness, and avoiding excessive hedging ("I think maybe...", "Not sure but..."). Confidence builds interviewer trust.',
    },
};

function getScoreColors(score: number) {
    if (score >= 8.5) return { 
        bar: 'bg-brand-purple', 
        text: 'text-brand-purple', 
        glow: 'bg-brand-purple/5' 
    };
    if (score >= 7.0) return { 
        bar: 'bg-brand-purple/70', 
        text: 'text-brand-purple/80', 
        glow: 'bg-brand-purple/5' 
    };
    if (score >= 5.0) return { 
        bar: 'bg-amber-500', 
        text: 'text-amber-500', 
        glow: 'bg-amber-500/5' 
    };
    return { 
        bar: 'bg-rose-500', 
        text: 'text-rose-500', 
        glow: 'bg-rose-500/5' 
    };
}

export default function CoreSkillMetrics({ metrics, interviewId }: CoreSkillMetricsProps) {
    const router = useRouter();
    const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

    if (!metrics || metrics.length === 0) return null;

    return (
        <section className="mt-12">
            <div className="flex items-center gap-6 mb-8">
                <h2 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-[0.3em] uppercase">Intelligence Metrics</h2>
                <div className="h-px flex-1 bg-gray-100 dark:bg-white/5" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.keys(metricInfo).map((metricKey) => {
                    const info = metricInfo[metricKey];
                    const m = metrics.find(item => item.metric_name === metricKey);
                    
                    if (!m) {
                        const isHovered = hoveredMetric === metricKey;
                        return (
                            <div
                                key={metricKey}
                                onMouseEnter={() => setHoveredMetric(metricKey)}
                                onMouseLeave={() => setHoveredMetric(null)}
                                className="relative bg-gray-50/50 dark:bg-white/[0.02] rounded-[2rem] border border-gray-100 dark:border-white/5 p-6 flex flex-col justify-between h-[210px] opacity-60 hover:opacity-100 transition-all duration-500 group"
                            >
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] pr-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-500">{info.title}</h3>
                                    
                                    <div
                                        className="flex-shrink-0 w-6 h-6 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center transition-all duration-300"
                                    >
                                        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                        </svg>
                                    </div>

                                    {/* Tooltip */}
                                    {isHovered && (
                                        <div className="absolute z-50 bottom-full left-0 mb-4 w-72 bg-white dark:bg-[#0B1221] border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white text-[13px] rounded-[1.5rem] p-6 shadow-2xl leading-relaxed pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <p className="font-bold mb-2 text-gray-500 uppercase tracking-widest text-[10px]">NOT ASSESSED</p>
                                            <p className="text-gray-500 dark:text-gray-400 font-medium">No relevant signals were detected in the audio for <strong>{info.title}</strong> throughout this interview. The AI omits irrelevant metrics to prevent inaccurate scoring.</p>
                                            <div className="absolute top-full left-8 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-white dark:border-t-[#0B1221]" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-bold tracking-tighter text-gray-300 dark:text-gray-700">--</span>
                                        <span className="text-[10px] font-bold text-gray-300 dark:text-gray-700 uppercase tracking-widest">/10</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden shadow-inner"></div>
                                    <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] pt-2">Not Assessed</p>
                                </div>
                            </div>
                        );
                    }

                    const score = Number(m.score) || 0;
                    const displayScore = score.toFixed(1);
                    const progressPercentage = (score / 10) * 100;
                    const colors = getScoreColors(score);
                    const isHovered = hoveredMetric === m.id;

                    return (
                        <div
                            key={m.id}
                            onClick={() => router.push(`/dashboard/interviews/${interviewId}/metrics/${m.metric_name}`)}
                            className="relative bg-white dark:bg-[#0F172A]/40 rounded-[2rem] border border-gray-100 dark:border-white/5 p-6 shadow-sm dark:shadow-2xl flex flex-col justify-between h-[210px] hover:border-brand-purple/20 transition-all duration-500 cursor-pointer group active:scale-[0.98]"
                            onMouseEnter={() => setHoveredMetric(m.id)}
                            onMouseLeave={() => setHoveredMetric(null)}
                        >
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] pr-2 group-hover:text-brand-purple transition-colors duration-500">{info.title}</h3>
                                
                                <div
                                    className="flex-shrink-0 w-6 h-6 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center transition-all duration-300 group-hover:bg-brand-purple/5 group-hover:border-brand-purple/20"
                                >
                                    <svg className="w-3 h-3 text-gray-400 group-hover:text-brand-purple transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                    </svg>
                                </div>

                                {/* Tooltip */}
                                {isHovered && info.tooltip && (
                                    <div className="absolute z-50 bottom-full left-0 mb-4 w-72 bg-white dark:bg-[#0B1221] border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white text-[13px] rounded-[1.5rem] p-6 shadow-2xl leading-relaxed pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <p className="font-bold mb-2 text-brand-purple uppercase tracking-widest text-[10px]">{info.title}</p>
                                        <p className="text-gray-500 dark:text-gray-400 font-medium">{info.tooltip}</p>
                                        <div className="absolute top-full left-8 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-white dark:border-t-[#0B1221]" />
                                    </div>
                                )}
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className={`text-5xl font-bold tracking-tighter transition-all duration-500 ${colors.text}`}>{displayScore}</span>
                                    <span className="text-[10px] font-bold text-gray-300 dark:text-gray-700 uppercase tracking-widest">/10</span>
                                </div>
                                <div className="w-full bg-gray-50 dark:bg-white/5 rounded-full h-1.5 overflow-hidden shadow-inner">
                                    <div
                                        className={`${colors.bar} h-full rounded-full transition-all duration-1000 ease-out`}
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-6">
                                    <span className="text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest group-hover:text-brand-purple transition-colors">View Details</span>
                                    <svg className="w-3 h-3 text-gray-300 dark:text-gray-700 group-hover:text-brand-purple transition-all transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

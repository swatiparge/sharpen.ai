import React from 'react';
import { useRouter } from 'next/navigation';

interface FeedbackItem {
    title: string;
    description: string;
}

interface FeedbackSectionProps {
    strengths: FeedbackItem[] | null;
    weaknesses: FeedbackItem[] | null;
}

export default function FeedbackSection({ strengths, weaknesses }: FeedbackSectionProps) {
    const router = useRouter();
    const hasStrengths = strengths && strengths.length > 0;
    const hasWeaknesses = weaknesses && weaknesses.length > 0;

    if (!hasStrengths && !hasWeaknesses) return null;

    return (
        <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* STRENGTHS */}
            <div className="bg-white dark:bg-[#0F172A]/40 rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8 md:p-10 shadow-soft relative overflow-hidden group transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-purple opacity-20" />
                
                <div className="flex items-center gap-5 mb-10 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-brand-purple/5 text-brand-purple flex items-center justify-center border border-brand-purple/10">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-1.808 2.37l-1.396 2.502a.563.563 0 01-1.04 0l-1.396-2.502a.563.563 0 00-1.808-2.37l-4.204-3.602c-.38-.325-.178-.948.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                    </div>
                    <div>
                        <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Performance Edge</span>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Top <span className="font-serif italic text-brand-purple">strengths</span></h2>
                    </div>
                </div>

                <div className="space-y-8 relative z-10">
                    {hasStrengths ? strengths.map((s, idx) => (
                        <div key={idx} className="flex gap-4 items-start group/item">
                            <div className="mt-1 flex-shrink-0 w-5 h-5 rounded bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-500 flex items-center justify-center transition-all duration-300">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <span className="font-bold text-gray-900 dark:text-white text-base block mb-1">{s.title}</span>
                                <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed block">{s.description}</span>
                            </div>
                        </div>
                    )) : (
                        <p className="text-gray-400 dark:text-gray-600 font-medium italic">No specific strengths highlighted.</p>
                    )}
                </div>
            </div>

            {/* IMPROVEMENT AREAS */}
            <div className="bg-white dark:bg-[#0F172A]/40 rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8 md:p-10 shadow-soft relative overflow-hidden group transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-purple/40 opacity-20" />
                
                <div className="flex items-center gap-5 mb-10 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/5 text-amber-500 flex items-center justify-center border border-amber-500/10">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Growth Protocol</span>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Focus <span className="font-serif italic text-brand-purple">points</span></h2>
                    </div>
                </div>

                <div className="space-y-8 relative z-10">
                    {hasWeaknesses ? weaknesses.map((w, idx) => (
                        <div key={idx} className="flex gap-4 items-start group/item">
                            <div className="mt-1 flex-shrink-0 w-5 h-5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 flex items-center justify-center transition-all duration-300">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <span className="font-bold text-gray-900 dark:text-white text-base block mb-1">{w.title}</span>
                                <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed block mb-6">{w.description}</span>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => router.push(`/dashboard/prepare/learn/${encodeURIComponent(w.title.toLowerCase().replace(/\s+/g, '-'))}`)}
                                        className="text-[9px] font-bold text-white uppercase tracking-widest px-4 py-2.5 rounded-lg bg-brand-purple hover:bg-brand-purple-light transition-all active:scale-95 shadow-sm"
                                    >
                                        Execute Deep Dive
                                    </button>
                                    <button 
                                        onClick={() => router.push('/dashboard/prepare/mock')}
                                        className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95 shadow-sm"
                                    >
                                        Mock Simulator
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <p className="text-gray-400 dark:text-gray-600 font-medium italic">No specific improvement areas highlighted.</p>
                    )}
                </div>
            </div>

        </section>
    );
}

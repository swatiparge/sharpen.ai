'use client';

import { PREP_DATA } from '@/lib/prep-data';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function InterviewPrepPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && !user) router.replace('/login');
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0B1221] flex items-center justify-center transition-colors duration-500">
                 <div className="w-10 h-10 border-4 border-gray-100 dark:border-white/5 border-t-brand-purple rounded-full animate-spin shadow-sm" />
            </div>
        );
    }

    return (
        <div className="pb-20 relative">
            <main className="max-w-7xl mx-auto px-6 pt-12">
                {/* Hero section */}
                <div className="mb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-brand-purple/[0.08] border border-brand-purple/20 backdrop-blur-md shadow-sm text-brand-purple text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-purple opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-purple"></span>
                        </span>
                        Personalized Prep
                    </div>
                    <h1 className="font-serif italic text-6xl md:text-8xl font-bold text-gray-900 dark:text-white mb-8 tracking-tighter leading-tight">
                        {PREP_DATA.role}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-3xl font-medium leading-relaxed">
                        Targeting <span className="text-brand-purple font-bold italic">{PREP_DATA.company}</span>. We've analyzed your history and onboarding data to highlight these critical areas.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Competencies & Pitch */}
                    <div className="lg:col-span-4 space-y-12">
                        {/* Competencies */}
                        <section className="bg-white dark:bg-[#0F172A]/40 backdrop-blur-2xl rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-10 shadow-soft relative overflow-hidden group">
                             <h2 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                                <span className="p-2.5 bg-brand-purple/[0.08] rounded-xl border border-brand-purple/20 text-brand-purple shadow-sm">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </span>
                                Focus Competencies
                            </h2>
                            <div className="space-y-4">
                                {PREP_DATA.competencies.map((comp, i) => (
                                    <div key={i} className="p-6 rounded-2xl bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/5 hover:border-brand-purple/30 hover:bg-brand-purple/[0.04] transition-all duration-500 group-hover:translate-x-1 cursor-default">
                                        <div className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-purple transition-colors">{comp.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed line-clamp-2">{comp.evidence}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* The Pitch */}
                        <section className="relative bg-white dark:bg-[#0F172A]/40 rounded-[2.5rem] border border-gray-100 dark:border-brand-purple/20 p-10 shadow-soft overflow-hidden group">
                            <h2 className="relative text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                                <span className="p-2.5 bg-brand-purple/[0.08] rounded-xl border border-brand-purple/20 text-brand-purple shadow-sm">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                                    </svg>
                                </span>
                                Elevator Pitch
                            </h2>
                            <div className="relative font-bold leading-relaxed text-gray-900 dark:text-white text-2xl mb-10">
                                <div className="absolute -left-6 -top-8 text-8xl text-brand-purple/10 font-black leading-none pointer-events-none italic font-serif">"</div>
                                <span className="relative z-10 italic">{PREP_DATA.pitch}</span>
                            </div>
                            <div className="relative text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase tracking-[0.2em] text-right flex items-center justify-end gap-3">
                                <div className="w-12 h-[1px] bg-gray-100 dark:bg-white/5"></div>
                                Optimized for Fintech
                            </div>
                        </section>
                    </div>

                    {/* Middle Column: STAR Stories */}
                    <div className="lg:col-span-8 space-y-12">
                        <section>
                            <div className="flex items-end justify-between mb-12">
                                <div>
                                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                                        STAR Story Bank
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium font-serif italic text-lg">Achievements mapped to critical domains.</p>
                                </div>
                                <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                    {PREP_DATA.starStories.length} Stories
                                </div>
                            </div>

                            <div className="grid gap-6">
                                {PREP_DATA.starStories.map((story) => (
                                    <div 
                                        key={story.id} 
                                        className={`bg-white dark:bg-[#0F172A]/40 rounded-[2rem] border transition-all duration-700 overflow-hidden shadow-soft ${selectedStoryId === story.id ? 'border-brand-purple/30 bg-brand-purple/[0.02]' : 'border-gray-100 dark:border-white/5 hover:border-brand-purple/20'}`}
                                    >
                                        <div 
                                            className="p-10 cursor-pointer relative group"
                                            onClick={() => setSelectedStoryId(selectedStoryId === story.id ? null : story.id)}
                                        >
                                            <div className="flex items-start justify-between relative z-10">
                                                <div className="flex-1">
                                                    <h3 className={`text-2xl font-bold mb-4 transition-colors duration-500 ${selectedStoryId === story.id ? 'text-brand-purple' : 'text-gray-900 dark:text-white group-hover:text-brand-purple'}`}>{story.title}</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {story.useFor.map((u, i) => (
                                                            <span key={i} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-500 ${selectedStoryId === story.id ? 'bg-brand-purple/10 text-brand-purple border border-brand-purple/20' : 'bg-gray-50 dark:bg-white/2 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-white/5'}`}>
                                                                {u}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 ${selectedStoryId === story.id ? 'bg-brand-purple text-white shadow-sm' : 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 group-hover:bg-brand-purple/10 group-hover:text-brand-purple'}`}>
                                                    <svg className={`w-6 h-6 transition-transform duration-700 ${selectedStoryId === story.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                                    </svg>
                                                </div>
                                            </div>
                                            
                                            <div className={`grid transition-all duration-700 ease-in-out ${selectedStoryId === story.id ? 'grid-rows-[0fr] opacity-0 mt-0' : 'grid-rows-[1fr] opacity-100 mt-6'}`}>
                                                <div className="overflow-hidden">
                                                    <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed italic pr-12 line-clamp-2">
                                                        {story.shortVersion}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className={`grid transition-all duration-1000 ease-in-out ${selectedStoryId === story.id ? 'grid-rows-[1fr] opacity-100 mt-10 translate-y-0' : 'grid-rows-[0fr] opacity-0 mt-0 -translate-y-4'}`}>
                                                <div className="overflow-hidden">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-6">
                                                            <div className="bg-gray-50/50 dark:bg-white/2 p-6 rounded-3xl border border-gray-100 dark:border-white/5 relative overflow-hidden">
                                                                <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                                                                    Situation
                                                                </div>
                                                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">{story.situation}</p>
                                                            </div>
                                                            <div className="bg-gray-50/50 dark:bg-white/2 p-6 rounded-3xl border border-gray-100 dark:border-white/5">
                                                                <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                                                                    Task
                                                                </div>
                                                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">{story.task}</p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-6">
                                                            <div className="bg-gray-50/50 dark:bg-white/2 p-6 rounded-3xl border border-gray-100 dark:border-white/5">
                                                                <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                                                                    Action
                                                                </div>
                                                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">{story.action}</p>
                                                            </div>
                                                            <div className="bg-brand-purple/[0.04] p-6 rounded-3xl border border-brand-purple/20 relative group/result overflow-hidden">
                                                                <div className="relative z-10">
                                                                    <div className="text-[10px] font-bold text-brand-purple uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                                                                        Result
                                                                    </div>
                                                                    <p className="text-lg font-bold text-gray-900 dark:text-white leading-relaxed">{story.result}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Predicted Questions */}
                        <section className="pt-12">
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-10 flex items-center gap-4">
                                High Probability Questions
                                <span className="p-2 bg-brand-purple/[0.08] text-brand-purple rounded-2xl border border-brand-purple/20">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                                    </svg>
                                </span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {PREP_DATA.predictedQuestions.map((q) => (
                                    <div key={q.id} className="bg-white dark:bg-[#0F172A]/40 backdrop-blur-2xl rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8 shadow-soft hover:border-brand-purple/30 hover:-translate-y-2 transition-all duration-700 group flex flex-col justify-between overflow-hidden relative">
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${q.probability === 'High' ? 'bg-brand-purple/[0.08] text-brand-purple border border-brand-purple/20' : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-white/10'}`}>
                                                    {q.probability} Prob
                                                </div>
                                            </div>
                                            <p className="text-xl font-bold text-gray-900 dark:text-white leading-relaxed group-hover:text-brand-purple transition-colors duration-500">
                                                "{q.question}"
                                            </p>
                                        </div>
                                        {q.storyId && (
                                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 flex justify-end relative z-10">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedStoryId(q.storyId || null);
                                                        window.scrollTo({ top: 400, behavior: 'smooth' });
                                                    }}
                                                    className="group/btn inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-brand-purple hover:brightness-125 transition-all"
                                                >
                                                    <span className="opacity-50 text-gray-400 dark:text-gray-600">Match:</span> {PREP_DATA.starStories.find(s => s.id === q.storyId)?.title}
                                                    <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}

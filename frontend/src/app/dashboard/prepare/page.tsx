'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PrepareJourneyPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

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

    const paths = [
        {
            title: 'Prepare & Learn',
            description: 'Master specific technical topics with guided lessons or interview-style practice. Explore our comprehensive curriculum.',
            cta: 'Choose Topic',
            href: '/dashboard/prepare/learn',
            icon: (
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.331 0 4.476.89 6.08 2.354M12 6.042A8.967 8.967 0 0118 3.75c1.052 0-2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.331 0-4.476.89-6.08 2.354" />
                </svg>
            ),
        },
        {
            title: 'Mock Interview',
            description: 'Simulate a real-time interview experience with AI-generated feedback. Practice your soft skills in a high-pressure environment.',
            cta: 'Start Mock',
            href: '/dashboard/prepare/mock',
            icon: (
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
            ),
        }
    ];

    return (
        <div className="pb-32 relative">
            {/* Header Area */}
            <div className="max-w-7xl mx-auto px-8 pt-20 pb-16 text-center animate-in fade-in slide-in-from-top-6 duration-1000">
                <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-brand-purple/[0.08] border border-brand-purple/20 text-brand-purple text-[10px] font-bold uppercase tracking-[0.2em] mb-8 shadow-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-purple opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-purple"></span>
                    </span>
                    The Lab
                </div>
                <h1 className="font-serif italic text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight leading-tight">
                    Refine Your <span className="text-brand-purple">Arsenal</span>
                </h1>
                <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
                    Select the high-fidelity preparation path that matches your current career trajectory.
                </p>
            </div>

            {/* Path Cards */}
            <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
                {paths.map((path, idx) => (
                    <div 
                        key={path.title}
                        className="group relative bg-white dark:bg-[#0F172A]/40 backdrop-blur-xl rounded-[3.5rem] border border-gray-100 dark:border-white/5 overflow-hidden transition-all duration-700 flex flex-col hover:border-brand-purple/20 hover:shadow-2xl animate-in fade-in slide-in-from-bottom-8"
                        style={{ animationDelay: `${idx * 200}ms` }}
                    >
                        <div className="h-64 bg-gray-50 dark:bg-white/5 flex items-center justify-center relative overflow-hidden border-b border-gray-100 dark:border-white/5 group-hover:bg-brand-purple/[0.02] transition-colors duration-700">
                             <div className="relative z-10 w-24 h-24 bg-white dark:bg-[#0F172A] rounded-3xl shadow-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 border border-gray-100 dark:border-white/10">
                                <div className="text-brand-purple">
                                    {path.icon}
                                </div>
                             </div>
                        </div>

                        <div className="p-10 flex flex-col flex-grow relative z-10">
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight group-hover:text-brand-purple transition-colors">{path.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-10 flex-grow">
                                {path.description}
                            </p>
                            <button
                                onClick={() => router.push(path.href)}
                                className="w-full py-4 rounded-2xl bg-brand-purple text-white font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 transform active:scale-95 group/btn shadow-sm hover:brightness-110"
                            >
                                <span className="relative z-10">{path.cta}</span>
                                <svg className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Weekly Goal Progress */}
            <div className="max-w-6xl mx-auto px-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="bg-white dark:bg-[#0F172A]/40 backdrop-blur-xl rounded-[3rem] p-10 flex flex-wrap items-center justify-between border border-gray-100 dark:border-white/5 shadow-soft relative overflow-hidden group/goal transition-colors duration-500">
                    <div className="flex items-center gap-8 relative z-10">
                        <div className="w-16 h-16 bg-brand-purple/[0.08] dark:bg-brand-purple/10 rounded-2xl flex items-center justify-center border border-brand-purple/20 shadow-sm group-hover/goal:scale-110 transition-transform duration-500 text-brand-purple">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-brand-purple uppercase tracking-[0.3em] mb-2">Milestone Delta</div>
                            <div className="text-lg text-gray-900 dark:text-white font-bold tracking-tight">3 of 5 Practice Objectives Reached</div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-8 flex-1 max-w-xl min-w-[300px] mt-8 lg:mt-0 relative z-10">
                        <div className="flex-1 h-2.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5">
                            <div className="h-full bg-brand-purple w-[60%] rounded-full shadow-sm transition-all duration-1000" />
                        </div>
                        <span className="text-sm font-bold text-brand-purple bg-brand-purple/[0.08] px-4 py-1.5 rounded-xl border border-brand-purple/20 tracking-widest leading-none">60%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

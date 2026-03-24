'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MockSetupPage() {
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

    return (
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0B1221] pb-32 relative font-sans selection:bg-brand-purple/30 flex flex-col items-center justify-center pt-24 transition-colors duration-500">
            <main className="max-w-4xl mx-auto px-8 relative z-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-brand-purple/[0.08] border border-brand-purple/20 text-brand-purple font-bold uppercase tracking-[0.2em] text-[11px] mb-12 shadow-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-purple opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-purple"></span>
                    </span>
                    Under Construction
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight leading-tight">
                    Live AI Mock <br className="hidden md:block" /> <span className="font-serif italic text-brand-purple">Interviews</span>
                </h1>
                
                <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-16 leading-relaxed">
                    We're building an immersive, voice-interactive AI interviewer that adapts to your responses in real-time. This feature will be available soon!
                </p>

                <div className="bg-white dark:bg-[#0F172A]/40 rounded-[3.5rem] border border-gray-100 dark:border-white/5 p-12 md:p-16 shadow-soft mb-16 relative overflow-hidden group max-w-2xl mx-auto transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/5 via-transparent to-brand-purple/5 opacity-40 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-sm border border-gray-100 dark:border-white/10 group-hover:scale-110 transition-transform duration-500">
                            <svg className="w-12 h-12 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                            </svg>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight group-hover:text-brand-purple transition-colors">Real-time Conversational AI</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-base font-medium leading-relaxed">Practice with an avatar that responds to your actual voice tone and logic.</p>
                    </div>
                </div>

                <button
                    onClick={() => router.push('/dashboard/prepare')}
                    className="inline-flex items-center gap-3 px-10 py-5 bg-white dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-300 shadow-soft border border-gray-100 dark:border-white/5 group active:scale-95"
                >
                    <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back to Laboratory
                </button>
            </main>
        </div>
    );
}

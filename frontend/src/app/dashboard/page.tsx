'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Only redirect if we've finished the initial hydration check
        // and we are certain there is no user session.
        if (!isLoading && !user) {
            const savedToken = localStorage.getItem('sharpen_token');
            if (!savedToken) {
                router.replace('/login');
            }
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0B1221] flex items-center justify-center transition-colors duration-500">
                <div className="w-10 h-10 border-4 border-gray-100 dark:border-white/5 border-t-brand-purple rounded-full animate-spin shadow-sm" />
            </div>
        );
    }

    const options = [
        {
            icon: (
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
            ),
            title: 'Record a real interview',
            description: 'Use Sharpen.ai during your next live interview to capture audio and generate real-time insights.',
            cta: 'Set up recording',
            href: '/dashboard/record',
            theme: 'purple',
            variant: 'solid'
        },
        {
            icon: (
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            title: 'Reconstruct a past interview',
            description: 'We guide you to recall questions and answers you already had from memory or your personal notes.',
            cta: 'Start reconstruction',
            href: '/dashboard/reconstruct',
            theme: 'purple',
            variant: 'outline'
        },
        {
            icon: (
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147L12 15l7.74-4.853a4.5 4.5 0 00-4.897-7.37L12 5.25l-2.843-2.473a4.5 4.5 0 00-4.897 7.37z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5l-9 5.625L3 10.5m18 4.5l-9 5.625L3 15" />
                </svg>
            ),
            title: 'Prepare yourself',
            description: 'Focus on specific technical skills or jump into a mock interview to get an initial skill snapshot.',
            cta: 'Start preparing',
            href: '/dashboard/prepare',
            theme: 'purple',
            variant: 'outline'
        },
    ];

    return (
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0B1221] selection:bg-brand-purple/10 flex flex-col transition-colors duration-300">
            {/* Hero Section */}
            <main className="max-w-6xl mx-auto px-6 pt-16 pb-16 flex-grow flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
                    Start your <br />
                    <span className="font-serif italic text-brand-purple">first analysis</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg max-w-2xl font-medium leading-relaxed mb-12 opacity-80">
                    Choose how you want to input your interview data to begin the analysis. We&apos;ll guide you through every step of the process.
                </p>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
                    {options.map((opt) => (
                        <div
                            key={opt.title}
                            className="group relative flex flex-col p-10 py-12 rounded-[2.5rem] bg-white dark:bg-[#0F172A]/40 border border-gray-100 dark:border-white/5 shadow-soft hover:shadow-2xl hover:border-brand-purple/20 transition-all duration-500"
                        >
                            <div className="mb-8 flex justify-center">
                                <div className="w-20 h-20 rounded-[2rem] bg-brand-purple/5 dark:bg-white/5 border border-brand-purple/10 dark:border-white/5 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-500">
                                    <div className="text-brand-purple dark:text-white">
                                        {opt.icon}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-grow text-center">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight group-hover:text-brand-purple transition-colors">
                                    {opt.title}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8 text-[15px] opacity-70">
                                    {opt.description}
                                </p>
                            </div>

                            <button
                                onClick={() => router.push(opt.href)}
                                className={`w-full py-4 rounded-2xl text-[15px] font-bold transition-all duration-300 transform active:scale-[0.98] border ${
                                    opt.variant === 'solid'
                                    ? 'bg-brand-purple border-brand-purple text-white shadow-lg shadow-brand-purple/20 hover:bg-brand-purple-light'
                                    : 'bg-transparent border-brand-purple/20 dark:border-white/10 text-brand-purple dark:text-white hover:bg-brand-purple/5 hover:border-brand-purple/40'
                                }`}
                            >
                                {opt.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-10 py-16 w-full flex flex-col md:flex-row items-center justify-between gap-10 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2 text-gray-400 text-sm font-bold uppercase tracking-widest">
                    <div className="w-5 h-5 text-brand-purple">
                         <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
                        </svg>
                    </div>
                    Powered by Sharpen.ai Engine
                </div>
                
                <div className="flex items-center gap-10">
                    <a href="mailto:legal@sharpen.ai" className="text-gray-400 hover:text-brand-purple dark:hover:text-white text-[11px] font-bold uppercase tracking-widest transition-colors">Help Center</a>
                    <Link href="/terms" className="text-gray-400 hover:text-brand-purple dark:hover:text-white text-[11px] font-bold uppercase tracking-widest transition-colors">Terms of Service</Link>
                    <Link href="/privacy" className="text-gray-400 hover:text-brand-purple dark:hover:text-white text-[11px] font-bold uppercase tracking-widest transition-colors">Privacy Policy</Link>
                </div>
            </footer>
        </div>

    );
}

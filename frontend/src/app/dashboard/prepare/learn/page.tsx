'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const TOPICS = [
    'React', 'Next.js', 'Tailwind CSS', 'Node.js',
    'JavaScript', 'TypeScript', 'Python', 'System Design'
];

export default function LearnSearchPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [search, setSearch] = useState('');

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

    const handleTopicClick = (topic: string) => {
        router.push(`/dashboard/prepare/learn/${encodeURIComponent(topic.toLowerCase().replace(/\s+/g, '-'))}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            handleTopicClick(search.trim());
        }
    };

    return (
        <div className="relative overflow-hidden pb-32">
            <main className="max-w-7xl mx-auto px-8 pt-20 text-center">
                <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-brand-purple/[0.08] border border-brand-purple/20 text-brand-purple text-[10px] font-bold uppercase tracking-[0.2em] mb-12 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-purple opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-purple"></span>
                    </span>
                    Curriculum Sync
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <h1 className="font-serif italic text-6xl md:text-8xl font-bold text-gray-900 dark:text-white mb-10 tracking-tight leading-[0.9] max-w-5xl mx-auto">
                        Learn any concept,<br className="hidden md:block" />
                        <span className="text-brand-purple">the way it sticks</span>
                    </h1>
                    <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                        Instant analogies, snippets, and interview-ready definitions for any technical or soft skill.
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="relative max-w-4xl mx-auto mb-16 group">
                        <div className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="What would you like to master?"
                                className="w-full bg-white dark:bg-[#0F172A]/40 backdrop-blur-2xl border border-gray-100 dark:border-white/10 rounded-[2.5rem] px-10 py-8 text-2xl text-gray-900 dark:text-white focus:outline-none focus:border-brand-purple/30 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 font-bold shadow-soft"
                            />
                            <button 
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-purple text-white px-10 py-5 rounded-[2rem] font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:brightness-110 active:scale-95 transition-all shadow-sm"
                            >
                                Explain it
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        </div>
                    </form>

                    {/* Topic Pills */}
                    <div className="flex flex-wrap justify-center gap-3 mb-24 max-w-4xl mx-auto">
                        {TOPICS.map((topic, idx) => (
                            <button
                                key={topic}
                                onClick={() => handleTopicClick(topic)}
                                className="px-6 py-3 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 font-bold hover:border-brand-purple/50 hover:bg-brand-purple/[0.04] hover:text-brand-purple transition-all duration-300 text-sm backdrop-blur-sm shadow-sm animate-in fade-in zoom-in-95"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                {topic}
                            </button>
                        ))}
                    </div>

                    {/* Prompt States */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
                        {[
                            { emoji: '💡', title: 'Simple Analogies', desc: 'Complex tech explained with everyday concepts.' },
                            { emoji: '💻', title: 'Modern Code', desc: 'Ready-to-use snippets in your favorite language.' },
                            { emoji: '🎯', title: 'Interview Alpha', desc: 'Definitions optimized for high-pressure rounds.' }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white dark:bg-[#0F172A]/40 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 hover:border-brand-purple/20 transition-all duration-500 group shadow-soft">
                                <div className="text-3xl mb-4 transform group-hover:scale-110 transition-transform duration-500">{item.emoji}</div>
                                <h3 className="text-gray-900 dark:text-white font-bold text-base mb-2 tracking-tight">{item.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

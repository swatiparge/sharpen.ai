'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import SharpenLogo from '@/components/SharpenLogo';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0B1221] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-100 dark:border-white/5 border-t-brand-purple rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0B1221] font-sans selection:bg-brand-purple/30 flex flex-col transition-colors duration-500">
            {/* Header */}
            <header className="border-b border-gray-100 dark:border-white/5 bg-white/80 dark:bg-[#0B1221]/80 backdrop-blur-xl px-10 py-5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div 
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-3 group px-4 py-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer"
                    >
                        <SharpenLogo />
                    </div>
                    <div className="flex items-center gap-4 px-5 py-2.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
                        <div className="text-right hidden sm:block">
                            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Onboarding</div>
                            <div className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight">{user.full_name}</div>
                        </div>
                        {user.avatar_url ? (
                            <img
                                src={user.avatar_url}
                                alt=""
                                className="w-9 h-9 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-xl bg-brand-purple text-white flex items-center justify-center text-sm font-bold shadow-sm">
                                {user.full_name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 flex items-center justify-center px-6 py-20 relative overflow-hidden">
                <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] bg-brand-purple/5 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[30%] left-[10%] w-[400px] h-[400px] bg-brand-purple/[0.03] blur-[100px] rounded-full pointer-events-none" />
                
                <div className="w-full max-w-[640px] relative z-10">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center py-10 text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em]">
                © 2024 Sharpen.ai • Intelligence Layer for Professionals
            </footer>
        </div>
    );
}

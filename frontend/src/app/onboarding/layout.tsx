'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-blue-50/50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-3">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <svg className="w-6 h-6 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                        <span className="font-bold text-lg text-brand-700">swadhyaya.ai</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Signed in as</span>
                        <span className="text-sm font-medium text-gray-700">{user.full_name}</span>
                        {user.avatar_url ? (
                            <img
                                src={user.avatar_url}
                                alt=""
                                className="w-8 h-8 rounded-full"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                                {user.full_name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-[600px] mx-auto px-4 py-10">
                {children}
            </main>

            {/* Footer */}
            <footer className="text-center py-4 text-xs text-gray-400">
                © 2024 swadhyaya.ai Platform. All rights reserved.
            </footer>
        </div>
    );
}

'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

export default function DashboardPage() {
    const { user, isLoading, logout } = useAuth();
    const [profileOpen, setProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) router.replace('/login');
    }, [user, isLoading, router]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleSignOut = () => {
        logout();
        router.replace('/login');
    };

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    const options = [
        {
            icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
            ),
            title: 'Record  yourself',
            description: 'Use swadhyaya.ai during your next live interview to capture your answers and generate real-time insights.',
            cta: 'Start Analyzing',
            href: '/dashboard/record',
            active: true,
        },
        {
            icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
            ),
            title: 'Reconstruct a past interview',
            description: 'We guide you to recall questions and answers you already had from memory or your personal notes.',
            cta: 'Start reconstruction',
            href: '#',
            active: false,
        },
        {
            icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
            ),
            title: 'Take a baseline mock',
            description: 'Do a short simulated interview to get an initial skill snapshot and identify immediate areas for improvement.',
            cta: 'Start baseline mock',
            href: '#',
            active: false,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <svg className="w-6 h-6 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                        <span className="font-bold text-lg text-brand-700">swadhyaya.ai</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                            </svg>
                        </button>
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                                    {user.full_name.charAt(0)}
                                </div>
                                My Profile
                                <svg className={`w-3.5 h-3.5 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>
                            {profileOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-900">{user.full_name}</p>
                                        <p className="text-xs text-gray-400">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                        </svg>
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Start your first analysis</h1>
                <p className="text-gray-500 mb-10 max-w-xl">
                    Choose how you want to input your interview data to begin the analysis. We&apos;ll guide you through every step of the process.
                </p>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {options.map((opt) => (
                        <div
                            key={opt.title}
                            className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
                        >
                            <div>
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mb-6">
                                    {opt.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{opt.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed mb-6">{opt.description}</p>
                            </div>
                            <button
                                onClick={() => opt.active && router.push(opt.href)}
                                disabled={!opt.active}
                                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${opt.active
                                    ? 'bg-brand-700 text-white hover:bg-brand-800'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {opt.cta}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Footer links */}
                <div className="flex items-center justify-center gap-8 text-sm">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium"
                    >
                        ← Back to Dashboard
                    </button>
                    <button className="flex items-center gap-1 text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.331 0 4.476.89 6.08 2.354M12 6.042A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.331 0-4.476.89-6.08 2.354" />
                        </svg>
                        View Documentation
                    </button>
                </div>
            </main>
        </div>
    );
}

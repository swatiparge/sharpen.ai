'use client';

import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import SharpenLogo from './SharpenLogo';

export default function DashboardHeader() {
    const { user, logout } = useAuth();
    const [profileOpen, setProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();

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

    if (!user) return null;

    const navItems = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Reconstruct Interview', path: '/dashboard/reconstruct' },
        { name: 'Learn', path: '/dashboard/prepare/learn' }
    ];

    return (
        <header className="bg-white dark:bg-[#0B1221] border-b border-gray-100 dark:border-white/5 px-8 py-5 sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-12">
                        <Link href="/" className="flex items-center gap-2 group">
                            <SharpenLogo />
                        </Link>

                    <nav className="hidden md:flex items-center gap-10">
                        {navItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <button 
                                    key={item.path}
                                    onClick={() => router.push(item.path)} 
                                    className={`text-sm font-semibold transition-all duration-300 relative py-1 ${
                                        isActive 
                                        ? 'text-brand-purple' 
                                        : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    {item.name}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Start Analysis Button */}
                    <button 
                        onClick={() => {
                            if (pathname === '/dashboard') {
                                window.scrollTo({ top: 500, behavior: 'smooth' });
                            } else {
                                router.push('/dashboard');
                            }
                        }}
                        className="bg-brand-purple hover:bg-brand-purple-light text-white font-bold px-6 py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-brand-purple/20 active:scale-95"
                    >
                        Start Analysis
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="flex items-center transition-transform active:scale-95"
                        >
                            <div className="w-10 h-10 rounded-full border border-gray-100 dark:border-white/10 overflow-hidden bg-gray-50 dark:bg-[#1E293B] flex items-center justify-center text-sm font-bold text-gray-900 dark:text-white shadow-md">
                                {user.full_name?.charAt(0) || 'U'}
                            </div>
                        </button>
                        {profileOpen && (
                            <div className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/5 shadow-2xl rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 mb-1">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{user.full_name}</p>
                                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                </div>
                                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-purple dark:hover:text-white hover:bg-brand-purple/5 rounded-xl transition-colors flex items-center gap-3">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                                    My Profile
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full text-left px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-500/5 rounded-xl transition-colors flex items-center gap-3"
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
    );
}

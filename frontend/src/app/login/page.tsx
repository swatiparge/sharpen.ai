'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/lib/auth';
import { googleAuth } from '@/lib/api';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

import SharpenLogo from '@/components/SharpenLogo';

function LoginCard() {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleGoogleSuccess = async (response: CredentialResponse) => {
        if (!response.credential) {
            setError('Google sign-in failed. Please try again.');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const data = await googleAuth(response.credential);
            login(data.user, data.token);

            if (data.onboarding_done) {
                router.push('/dashboard');
            } else {
                router.push('/onboarding/step-1');
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google sign-in was cancelled or failed.');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] dark:bg-[#0B1221] px-6 font-sans selection:bg-brand-purple/30 relative overflow-hidden transition-colors duration-500">
            {/* Background Accents */}
            <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-brand-purple/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] bg-brand-purple/[0.03] blur-[100px] rounded-full pointer-events-none" />
            
            <div className="w-full max-w-[480px] z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="bg-white dark:bg-[#0F172A]/40 border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-12 md:p-16 shadow-soft relative overflow-hidden group">
                    
                    {/* Logo Section */}
                    <div className="relative z-10 flex flex-col items-center mb-12">
                        <div className="mb-10 transform group-hover:scale-105 transition-transform duration-500">
                            <SharpenLogo />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4 font-serif italic">Welcome Back</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-center leading-relaxed">
                            Sign in to <span className="text-gray-900 dark:text-white font-bold">Sharpen.ai</span> to continue your career journey.
                        </p>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="relative z-10 bg-rose-500/5 border border-rose-500/10 text-rose-500 text-[13px] font-bold rounded-2xl px-6 py-4 mb-8 text-center animate-in shake duration-500">
                            {error}
                        </div>
                    )}

                    {/* Google Auth Button Container */}
                    <div className="relative z-10 flex justify-center">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-[56px] w-full bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 animate-pulse">
                                <div className="w-6 h-6 border-3 border-gray-200 dark:border-white/10 border-t-brand-purple rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="w-full transition-all hover:scale-[1.02] active:scale-[0.98] duration-300 shadow-sm hover:shadow-md rounded-2xl overflow-hidden">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    size="large"
                                    width="100%"
                                    text="continue_with"
                                    shape="rectangular"
                                    theme={typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'filled_black' : 'outline'}
                                />
                            </div>
                        )}
                    </div>

                    {/* Security Note */}
                    <div className="relative z-10 flex items-center justify-center gap-2 mt-12 text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase tracking-[0.2em]">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                        Secure OAuth 2.0 Encryption
                    </div>
                </div>

                {/* Additional Links */}
                <div className="mt-12 flex flex-col items-center gap-6 text-[10px] font-bold uppercase tracking-[0.3em]">
                    <p className="text-gray-400 dark:text-gray-600">Protected by <span className="text-gray-600 dark:text-gray-400">Google Cloud Platform</span></p>
                    <div className="flex gap-8">
                        <Link href="/privacy" className="text-gray-400 hover:text-brand-purple transition-colors">Privacy</Link>
                        <Link href="/terms" className="text-gray-400 hover:text-brand-purple transition-colors">Terms</Link>
                        <a href={`mailto:legal@sharpen.ai`} className="text-gray-400 hover:text-brand-purple transition-colors">Help</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <LoginCard />
        </GoogleOAuthProvider>
    );
}

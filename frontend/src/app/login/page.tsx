'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/lib/auth';
import { googleAuth } from '@/lib/api';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-lg p-10">
                {/* Logo */}
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">Login</h1>
                <p className="text-sm text-gray-500 text-center mb-8">
                    Sign in or create an account with Google
                </p>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                        {error}
                    </div>
                )}

                {/* Google Sign-In */}
                <div className="flex justify-center">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-[44px] w-full bg-gray-50 rounded-lg border border-gray-200">
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                        </div>
                    ) : (
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            size="large"
                            width="340"
                            text="continue_with"
                            shape="rectangular"
                            theme="outline"
                        />
                    )}
                </div>

                {/* Footer */}
                <p className="text-xs text-gray-400 text-center mt-8">
                    By continuing, you agree to our Terms & Privacy Policy
                </p>
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { saveOnboardingProfile } from '@/lib/api';

const TARGET_ROLES = [
    'Frontend Engineer',
    'Backend Engineer',
    'Full Stack Engineer',
    'DevOps Engineer',
    'Data Scientist',
    'Product Manager',
    'UX Designer',
    'Mobile Developer',
    'QA Engineer',
    'Engineering Manager',
    'Other',
];

const INTERVIEW_STAGES = [
    'Just getting started',
    'Actively interviewing',
    'Got a few offers',
    'Preparing for a specific company',
];

export default function OnboardingStep2() {
    const { token } = useAuth();
    const router = useRouter();

    const [targetRole, setTargetRole] = useState('Frontend Engineer');
    const [targetCompanies, setTargetCompanies] = useState('');
    const [interviewStage, setInterviewStage] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleNext = async () => {
        if (!token) return;
        setSaving(true);
        setError('');
        try {
            const companiesArray = targetCompanies
                .split(',')
                .map((c) => c.trim())
                .filter((c) => c.length > 0);

            await saveOnboardingProfile(token, {
                target_level: targetRole,
                target_companies: companiesArray.length > 0 ? companiesArray : undefined,
                interview_stage: interviewStage || undefined,
            });
            router.push('/onboarding/step-3');
        } catch (err: any) {
            setError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-8">
            {/* Step header */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">Onboarding Flow</span>
                <span className="text-xs font-semibold text-gray-400">Step 2 of 3</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full mb-8 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: '66%' }} />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">What are your target roles?</h1>
            <p className="text-sm text-gray-500 mb-8">
                Help us tailor your interview prep by defining your goals.
            </p>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
                    {error}
                </div>
            )}

            {/* Target Role */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Target Role</label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center]"
                    >
                        {TARGET_ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Target Companies */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-900">Target Companies</label>
                    <span className="text-xs text-gray-400">Optional</span>
                </div>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={targetCompanies}
                        onChange={(e) => setTargetCompanies(e.target.value)}
                        placeholder="e.g., Company A, Company B"
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                    />
                </div>
                <p className="text-xs text-blue-400 mt-1">Separate multiple companies with commas.</p>
            </div>

            {/* Interview Stage */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Interview Stage</label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <select
                        value={interviewStage}
                        onChange={(e) => setInterviewStage(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center]"
                    >
                        <option value="">Select current stage</option>
                        {INTERVIEW_STAGES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                <button
                    onClick={() => router.push('/onboarding/step-1')}
                    className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <span>←</span> Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-700 text-white font-semibold text-sm rounded-lg hover:bg-brand-800 disabled:opacity-60 transition-colors"
                >
                    {saving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>Next <span>→</span></>
                    )}
                </button>
            </div>
        </div>
    );
}

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
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="mb-10 pl-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/[0.08] border border-brand-purple/20 text-[10px] font-bold text-brand-purple uppercase tracking-[0.2em] mb-6">
                    Step 02 / 03
                </div>
                <h1 className="font-serif italic text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Mission Objectives</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                    Define your destination. We&apos;ll build the roadmap to get you there.
                </p>
            </div>

            <div className="bg-white dark:bg-[#0F172A]/40 backdrop-blur-xl rounded-[3rem] border border-gray-100 dark:border-white/5 p-10 md:p-12 shadow-soft space-y-10 relative overflow-hidden group transition-colors duration-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-purple opacity-20" />
                
                <div className="relative z-10">
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full mb-12 overflow-hidden shadow-inner translate-y-[-20px]">
                        <div className="h-full bg-brand-purple rounded-full transition-all duration-1000 shadow-sm" style={{ width: '66.66%' }} />
                    </div>

                    {error && (
                        <div className="bg-rose-500/5 border border-rose-500/10 text-rose-500 text-sm font-bold rounded-2xl px-6 py-4 mb-8 animate-in shake">
                            {error}
                        </div>
                    )}

                    <div className="space-y-8">
                        {/* Target Role */}
                        <div className="group/field">
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1 group-focus-within/field:text-brand-purple transition-colors">Target Appointment</label>
                            <div className="relative">
                                <select
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:outline-none focus:border-brand-purple/50 focus:ring-4 focus:ring-brand-purple/5 transition-all appearance-none cursor-pointer"
                                >
                                    {TARGET_ROLES.map((r) => (
                                        <option key={r} value={r} className="bg-white dark:bg-[#0B1221]">{r}</option>
                                    ))}
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-600">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Target Companies */}
                        <div className="group/field">
                            <div className="flex items-center justify-between mb-3 ml-1">
                                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] group-focus-within/field:text-brand-purple transition-colors">Dream Organizations</label>
                                <span className="text-[9px] font-bold text-gray-300 dark:text-gray-700 uppercase tracking-widest italic lowercase">Comma Separated</span>
                            </div>
                            <input
                                type="text"
                                value={targetCompanies}
                                onChange={(e) => setTargetCompanies(e.target.value)}
                                placeholder="e.g. Google, Anthropic, Scale AI"
                                className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold focus:outline-none focus:border-brand-purple/50 focus:ring-4 focus:ring-brand-purple/5 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700"
                            />
                        </div>

                        {/* Interview Stage */}
                        <div className="group/field">
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1 group-focus-within/field:text-brand-purple transition-colors">Current Status</label>
                            <div className="relative">
                                <select
                                    value={interviewStage}
                                    onChange={(e) => setInterviewStage(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:outline-none focus:border-brand-purple/50 focus:ring-4 focus:ring-brand-purple/5 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-white dark:bg-[#0B1221] text-gray-400">Select your progress</option>
                                    {INTERVIEW_STAGES.map((s) => (
                                        <option key={s} value={s} className="bg-white dark:bg-[#0B1221]">{s}</option>
                                    ))}
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-600">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-100 dark:border-white/5">
                        <button
                            onClick={() => router.push('/onboarding/step-1')}
                            className="inline-flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] hover:text-gray-900 dark:hover:text-white transition-colors group/back"
                        >
                            <svg className="w-4 h-4 transition-transform group-hover/back:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg> Back
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={saving}
                            className="inline-flex items-center gap-3 px-10 py-4 bg-brand-purple text-white font-bold text-xs uppercase tracking-[0.2em] rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-sm disabled:opacity-40"
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Proceed to final phase 
                                    <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

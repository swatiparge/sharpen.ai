'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { saveOnboardingProfile } from '@/lib/api';

const STRUGGLE_AREAS = [
    { id: 'system_design', label: 'System Design', icon: '🏗️' },
    { id: 'behavioral', label: 'Behavioral Questions', icon: '🧠' },
    { id: 'coding_speed', label: 'Coding Speed', icon: '⚡' },
    { id: 'communication', label: 'Communication', icon: '💬' },
    { id: 'salary_negotiation', label: 'Salary Negotiation', icon: '💰' },
    { id: 'technical_depth', label: 'Technical Depth', icon: '🔧' },
];

export default function OnboardingStep3() {
    const { token } = useAuth();
    const router = useRouter();

    const [selected, setSelected] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const toggleArea = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    const handleComplete = async () => {
        if (!token) return;
        setSaving(true);
        setError('');
        try {
            await saveOnboardingProfile(token, {
                struggle_areas: selected,
                onboarding_done: true,
                consent_given: true,
            });
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="mb-10 pl-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/[0.08] border border-brand-purple/20 text-[10px] font-bold text-brand-purple uppercase tracking-[0.2em] mb-6 animate-pulse">
                    Step 03 / 03 • Sequence Finalized
                </div>
                <h1 className="font-serif italic text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Growth Calibration</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-lg">
                    Define your focus areas. We&apos;ll prioritize these domains in your personalized development roadmap.
                </p>
            </div>

            <div className="bg-white dark:bg-[#0F172A]/40 backdrop-blur-xl rounded-[3rem] border border-gray-100 dark:border-white/5 p-10 md:p-12 shadow-soft space-y-10 relative overflow-hidden group transition-colors duration-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-purple opacity-20" />
                
                <div className="relative z-10">
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full mb-12 overflow-hidden shadow-inner translate-y-[-20px]">
                        <div className="h-full bg-brand-purple rounded-full transition-all duration-1000 shadow-sm" style={{ width: '100%' }} />
                    </div>

                    {error && (
                        <div className="bg-rose-500/5 border border-rose-500/10 text-rose-500 text-sm font-bold rounded-2xl px-6 py-4 mb-8 text-center animate-in shake">
                            {error}
                        </div>
                    )}

                    {/* Chip grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                        {STRUGGLE_AREAS.map((area) => {
                            const isSelected = selected.includes(area.id);
                            return (
                                <button
                                    key={area.id}
                                    onClick={() => toggleArea(area.id)}
                                    className={`relative flex items-center gap-4 px-6 py-5 rounded-[1.8rem] border transition-all duration-500 text-left overflow-hidden group/opt ${isSelected
                                            ? 'bg-brand-purple/[0.04] border-brand-purple/30 shadow-sm'
                                            : 'bg-gray-50/50 dark:bg-white/[0.02] border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 hover:bg-white dark:hover:bg-white/[0.04]'
                                        }`}
                                >
                                    <div className={`flex items-center justify-center w-12 h-12 rounded-2xl text-xl transition-all duration-500 ${isSelected ? 'bg-brand-purple/20 scale-110' : 'bg-gray-100 dark:bg-white/5'
                                        }`}>
                                        {area.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className={`text-xs font-bold uppercase tracking-widest transition-colors duration-500 ${isSelected ? 'text-brand-purple' : 'text-gray-400 dark:text-gray-500'}`}>
                                            {area.label}
                                        </div>
                                        <div className="text-[10px] text-gray-400 dark:text-gray-600 font-bold mt-1 uppercase tracking-tighter">Calibration Target</div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${isSelected
                                            ? 'bg-brand-purple border-brand-purple shadow-sm'
                                            : 'border-gray-200 dark:border-white/10'
                                        }`}>
                                        {isSelected && (
                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/[0.03] to-transparent pointer-events-none" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-8 border-t border-gray-100 dark:border-white/5">
                        <button
                            onClick={() => router.push('/onboarding/step-2')}
                            className="inline-flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] hover:text-gray-900 dark:hover:text-white transition-colors group/back"
                        >
                            <svg className="w-4 h-4 transition-transform group-hover/back:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg> Back
                        </button>
                        <button
                            onClick={handleComplete}
                            disabled={saving}
                            className="inline-flex items-center gap-4 px-10 py-4 bg-brand-purple text-white font-bold text-xs uppercase tracking-[0.2em] rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-sm disabled:opacity-40"
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Finalize Initialization
                                    <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110.1 21a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0113.9 3a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
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

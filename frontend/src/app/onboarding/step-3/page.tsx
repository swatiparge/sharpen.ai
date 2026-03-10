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
        <div className="bg-white rounded-2xl shadow-sm p-8">
            {/* Step header */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Step 3 of 3</span>
                <span className="text-xs font-medium text-gray-400">100% Complete</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: '100%' }} />
            </div>

            <p className="text-sm text-green-600 italic mb-2">Almost there! Just one final detail.</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">What do you struggle with the most?</h1>
            <p className="text-sm text-gray-500 mb-8">
                Select all that apply. We&apos;ll tailor your practice roadmap based on these challenges.
            </p>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
                    {error}
                </div>
            )}

            {/* Chip grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
                {STRUGGLE_AREAS.map((area) => {
                    const isSelected = selected.includes(area.id);
                    return (
                        <button
                            key={area.id}
                            onClick={() => toggleArea(area.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left ${isSelected
                                    ? 'bg-brand-700 border-brand-700 text-white'
                                    : 'bg-white border-gray-200 text-gray-900 hover:border-gray-400'
                                }`}
                        >
                            <span
                                className={`flex items-center justify-center w-8 h-8 rounded text-sm ${isSelected ? 'bg-white/20' : 'bg-blue-50'
                                    }`}
                            >
                                {area.icon}
                            </span>
                            <span className="flex-1 text-sm font-medium">{area.label}</span>
                            <span
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                        ? 'bg-white border-white'
                                        : 'border-gray-300'
                                    }`}
                            >
                                {isSelected && (
                                    <svg className="w-3 h-3 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <button
                    onClick={() => router.push('/onboarding/step-2')}
                    className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <span>←</span> Back
                </button>
                <button
                    onClick={handleComplete}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-700 text-white font-semibold text-sm rounded-lg hover:bg-brand-800 disabled:opacity-60 transition-colors"
                >
                    {saving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            Complete Setup
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

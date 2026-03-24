'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getResumeUploadUrl, uploadFileToS3, saveOnboardingProfile } from '@/lib/api';

const ROLES = [
    'Frontend Engineer',
    'Backend Engineer',
    'Full Stack Engineer',
    'DevOps Engineer',
    'Data Scientist',
    'Product Manager',
    'UX Designer',
    'Mobile Developer',
    'QA Engineer',
    'Other',
];

const EXPERIENCE_LEVELS = [
    { value: '0-1', label: '0–1 years' },
    { value: '2-3', label: '2–3 years' },
    { value: '4-5', label: '4–5 years' },
    { value: '6+', label: '6+ years' },
];

export default function OnboardingStep1() {
    const { token } = useAuth();
    const router = useRouter();

    const [role, setRole] = useState('Frontend Engineer');
    const [experience, setExperience] = useState('');
    const [company, setCompany] = useState('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeKey, setResumeKey] = useState('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowed.includes(file.type)) {
            setError('Only PDF and DOCX files are supported');
            return;
        }

        setResumeFile(file);
        setUploading(true);
        setError('');
        try {
            const { upload_url, storage_key } = await getResumeUploadUrl(token, file.type);
            await uploadFileToS3(upload_url, file);
            setResumeKey(storage_key);
        } catch (err: any) {
            setError('Failed to upload resume: ' + (err.message || 'Unknown error'));
            setResumeFile(null);
        } finally {
            setUploading(false);
        }
    };

    const handleNext = async () => {
        if (!token) return;
        setSaving(true);
        setError('');
        try {
            await saveOnboardingProfile(token, {
                current_role: role,
                years_experience: experience || undefined,
                current_company: company || undefined,
                resume_path: resumeKey || undefined,
            });
            router.push('/onboarding/step-2');
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
                    Step 01 / 03
                </div>
                <h1 className="font-serif italic text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">The Foundation</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Tell us about your professional identity to tailor your experience.</p>
            </div>

            <div className="bg-white dark:bg-[#0F172A]/40 backdrop-blur-xl rounded-[3rem] border border-gray-100 dark:border-white/5 p-10 md:p-12 shadow-soft space-y-10 relative overflow-hidden group transition-colors duration-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-purple opacity-20" />
                
                <div className="relative z-10">
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full mb-12 overflow-hidden shadow-inner translate-y-[-20px]">
                        <div className="h-full bg-brand-purple rounded-full transition-all duration-1000 shadow-sm" style={{ width: '33.33%' }} />
                    </div>

                    {error && (
                        <div className="bg-rose-500/5 border border-rose-500/10 text-rose-500 text-sm font-bold rounded-2xl px-6 py-4 mb-8 animate-in shake">
                            {error}
                        </div>
                    )}

                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Primary role */}
                            <div className="group/field">
                                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1 group-focus-within/field:text-brand-purple transition-colors">Primary Domain</label>
                                <div className="relative">
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:outline-none focus:border-brand-purple/50 focus:ring-4 focus:ring-brand-purple/5 transition-all appearance-none cursor-pointer"
                                    >
                                        {ROLES.map((r) => (
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

                            {/* Years of experience */}
                            <div className="group/field">
                                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1 group-focus-within/field:text-brand-purple transition-colors">Career Seniority</label>
                                <div className="relative">
                                    <select
                                        value={experience}
                                        onChange={(e) => setExperience(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:outline-none focus:border-brand-purple/50 focus:ring-4 focus:ring-brand-purple/5 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-white dark:bg-[#0B1221] text-gray-400">Level of expertise</option>
                                        {EXPERIENCE_LEVELS.map((lvl) => (
                                            <option key={lvl.value} value={lvl.value} className="bg-white dark:bg-[#0B1221]">{lvl.label}</option>
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

                        {/* Current company */}
                        <div className="group/field">
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1 group-focus-within/field:text-brand-purple transition-colors">Current Affiliation <span className="opacity-40 italic lowercase ml-2">(Optional)</span></label>
                            <input
                                type="text"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                placeholder="e.g. Acme Intelligence"
                                className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold focus:outline-none focus:border-brand-purple/50 focus:ring-4 focus:ring-brand-purple/5 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700"
                            />
                        </div>

                        {/* Resume upload */}
                        <div className="group/field">
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1 group-focus-within/field:text-brand-purple transition-colors">Digital Resume <span className="opacity-40 italic lowercase ml-2">(Optional)</span></label>
                            <div
                                onClick={() => !uploading && fileInputRef.current?.click()}
                                className={`relative border-2 border-dashed rounded-[2rem] px-8 py-10 text-center cursor-pointer transition-all duration-500 group/drop ${resumeFile
                                        ? 'border-brand-purple/40 bg-brand-purple/[0.02]'
                                        : 'border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] hover:border-brand-purple/30 hover:bg-brand-purple/[0.01]'
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.docx"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                {uploading ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-8 h-8 border-3 border-gray-100 dark:border-white/10 border-t-brand-purple rounded-full animate-spin shadow-sm" />
                                        <span className="text-[11px] font-bold text-brand-purple uppercase tracking-widest">Uploading Asset...</span>
                                    </div>
                                ) : resumeFile ? (
                                    <div className="animate-in fade-in zoom-in-95">
                                        <div className="w-12 h-12 rounded-xl bg-brand-purple/10 flex items-center justify-center mx-auto mb-4 border border-brand-purple/20">
                                            <svg className="w-6 h-6 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                        </div>
                                        <div className="text-gray-900 dark:text-white font-bold text-sm truncate max-w-[200px] mx-auto">{resumeFile.name}</div>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase tracking-widest mt-2">Ready for analysis</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-gray-400 dark:text-gray-600 mb-6 group-hover/drop:text-brand-purple transition-colors duration-500">
                                            <svg className="w-10 h-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                                            </svg>
                                        </div>
                                        <p className="text-sm text-gray-900 dark:text-white font-bold mb-1">
                                            Drop your PDF or <span className="text-brand-purple hover:underline underline-offset-4">browse files</span>
                                        </p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase tracking-[0.2em]">Supported: PDF, DOCX</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end mt-12 pt-8 border-t border-gray-100 dark:border-white/5">
                        <button
                            onClick={handleNext}
                            disabled={saving}
                            className="inline-flex items-center gap-3 px-10 py-4 bg-brand-purple text-white font-bold text-xs uppercase tracking-[0.2em] rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-sm disabled:opacity-40"
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Proceed to phase 02 
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

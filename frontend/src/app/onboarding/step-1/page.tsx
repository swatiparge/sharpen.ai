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
        <div className="bg-white rounded-2xl shadow-sm p-8">
            {/* Step header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                </div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Step 1 of 3</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full mb-8 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: '33%' }} />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-8">Tell us about your current role</h1>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
                    {error}
                </div>
            )}

            {/* Primary role */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Your primary role</label>
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center]"
                >
                    {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>
            </div>

            {/* Years of experience */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Years of experience</label>
                <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center]"
                >
                    <option value="">Select experience</option>
                    {EXPERIENCE_LEVELS.map((lvl) => (
                        <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                    ))}
                </select>
            </div>

            {/* Current company */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Current company <span className="font-normal text-gray-400">(Optional)</span>
                </label>
                <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
            </div>

            {/* Resume upload */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Upload resume <span className="font-normal text-gray-400">(Optional)</span>
                </label>
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl px-6 py-8 text-center cursor-pointer transition-all ${resumeFile
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/30'
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
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                            <span className="text-sm text-gray-500">Uploading...</span>
                        </div>
                    ) : resumeFile ? (
                        <>
                            <div className="text-green-600 font-medium text-sm">✓ {resumeFile.name}</div>
                            <p className="text-xs text-gray-400 mt-1">Click to replace</p>
                        </>
                    ) : (
                        <>
                            <div className="text-gray-400 mb-2">
                                <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-500">
                                Drop your resume here or <span className="text-blue-500 underline">click to browse</span>
                            </p>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">Supported formats: PDF, DOCX</p>
                        </>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
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

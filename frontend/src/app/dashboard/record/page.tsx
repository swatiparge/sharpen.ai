'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { createInterview, getMediaUploadUrl, uploadFileToS3, triggerAnalysis } from '@/lib/api';

const ROUNDS = [
    { label: 'Technical', value: 'TECHNICAL' },
    { label: 'Behavioral', value: 'BEHAVIORAL' },
    { label: 'System Design', value: 'SYSTEM_DESIGN' },
    { label: 'Screen', value: 'SCREEN' },
    { label: 'Other', value: 'OTHER' },
];

export default function SetupRecordingPage() {
    const { user, token } = useAuth();
    const router = useRouter();

    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [round, setRound] = useState('TECHNICAL');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const allowed = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a', 'audio/webm', 'audio/mp3'];
        if (!allowed.includes(file.type)) {
            setError('Supported formats: MP3, WAV, M4A');
            return;
        }
        setAudioFile(file);
        setError('');
    };

    const handleUploadAndAnalyze = async () => {
        if (!name.trim()) { setError('Interview name is required'); return; }
        if (!audioFile || !token) return;

        setUploading(true);
        setError('');
        try {
            // 1. Create interview
            const interview = await createInterview(token, {
                name: name.trim(),
                company: company.trim() || undefined,
                round,
                interview_type: 'RECORDED',
            });

            // 2. Get upload URL
            const { upload_url } = await getMediaUploadUrl(
                token, interview.id, 'AUDIO', audioFile.type
            );

            // 3. Upload to S3
            await uploadFileToS3(upload_url, audioFile);

            // 4. Trigger analysis
            await triggerAnalysis(token, interview.id);

            // 5. Navigate to analysis page
            router.push(`/dashboard/record/analyzing/${interview.id}`);
        } catch (err: any) {
            setError(err.message || 'Failed to upload');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-2xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload & Analyze</h1>
                <p className="text-gray-500 mb-10">
                    Upload your interview audio file and we&apos;ll analyze your performance using AI.
                </p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
                        {error}
                    </div>
                )}

                {/* Interview Details */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Interview Details</h2>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-900 mb-1.5">Interview name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Senior Frontend Role"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                            Company <span className="font-normal text-gray-400">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="Enter company name"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-900 mb-1.5">Round</label>
                        <select
                            value={round}
                            onChange={(e) => setRound(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center]"
                        >
                            {ROUNDS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                    </div>
                </section>

                {/* Upload audio file */}
                <section className="mb-8">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Upload audio file</label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl px-6 py-8 text-center cursor-pointer transition-all ${audioFile
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 bg-gray-50/50 hover:border-blue-400 hover:bg-blue-50/30'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".mp3,.wav,.m4a,.webm"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        {audioFile ? (
                            <>
                                <div className="text-green-600 font-medium text-sm">✓ {audioFile.name}</div>
                                <p className="text-xs text-gray-400 mt-1">Click to replace</p>
                            </>
                        ) : (
                            <>
                                <div className="text-gray-400 mb-2">
                                    <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Drag and drop your interview audio here, or <span className="text-blue-500">click to browse</span>
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Supported formats: MP3, WAV, M4A</p>
                            </>
                        )}
                    </div>
                </section>

                {/* Permission notice */}
                <p className="text-xs text-gray-400 flex items-center gap-1 mb-8">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                    Make sure you have permission to share this recording.
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                        ‹ Back
                    </button>

                    <button
                        onClick={handleUploadAndAnalyze}
                        disabled={uploading || !name.trim() || !audioFile}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-700 text-white font-semibold text-sm rounded-lg hover:bg-brand-800 disabled:opacity-60 transition-colors"
                    >
                        {uploading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Upload & Analyze
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
}

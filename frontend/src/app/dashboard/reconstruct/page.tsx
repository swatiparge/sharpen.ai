'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

type Step = 'setup' | 'metadata' | 'qa' | 'review' | 'analyzing';

interface QAData {
    question_text: string;
    answer_text: string;
    followup_text?: string;
    confidence_score?: number;
}

interface ReconstructionData {
    company_name: string;
    job_role: string;
    interview_round: string;
    interview_type: string;
    qa_pairs: QAData[];
}

import SharpenLogo from '@/components/SharpenLogo';

export default function ReconstructionPage() {
    const { user, token, isLoading } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState<Step>('setup');
    const [data, setData] = useState<ReconstructionData>({
        company_name: '',
        job_role: '',
        interview_round: '',
        interview_type: 'TECHNICAL',
        qa_pairs: [{ question_text: '', answer_text: '' }],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && !user) router.replace('/login');
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0B1221] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-gray-100 dark:border-white/5 border-t-brand-purple rounded-full animate-spin shadow-sm" />
            </div>
        );
    }

    const nextStep = () => {
        if (step === 'setup') setStep('metadata');
        else if (step === 'metadata') setStep('qa');
        else if (step === 'qa') setStep('review');
    };

    const prevStep = () => {
        if (step === 'metadata') setStep('setup');
        else if (step === 'qa') setStep('metadata');
        else if (step === 'review') setStep('qa');
    };

    const handleAddQA = () => {
        setData({
            ...data,
            qa_pairs: [...data.qa_pairs, { question_text: '', answer_text: '' }],
        });
    };

    const handleRemoveQA = (index: number) => {
        const newQA = [...data.qa_pairs];
        newQA.splice(index, 1);
        setData({ ...data, qa_pairs: newQA });
    };

    const handleQAChange = (index: number, field: keyof QAData, value: string | number) => {
        const newQA = [...data.qa_pairs];
        newQA[index] = { ...newQA[index], [field]: value };
        setData({ ...data, qa_pairs: newQA });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            if (!token) throw new Error("Not authenticated");
            const interview = await api('/interviews', {
                method: 'POST',
                token,
                body: {
                    interview_type: 'RECONSTRUCTED',
                    name: data.job_role,
                    company: data.company_name,
                    round: data.interview_round as any,
                    interviewed_at: new Date().toISOString(),
                }
            });

            const questions = data.qa_pairs.map((qa, idx) => ({
                question_text: qa.question_text,
                answer_text: qa.answer_text,
                followup_text: qa.followup_text || '',
                confidence_score: qa.confidence_score || 5,
                question_order: idx + 1,
            }));

            await api(`/interviews/${interview.id}/reconstruction`, { 
                method: 'POST',
                token,
                body: { questions }
            });

            await api(`/interviews/${interview.id}/analyze`, {
                method: 'POST',
                token
            });

            router.push(`/dashboard/interviews/${interview.id}`);
        } catch (err: any) {
            setError(err.message || 'Failed to start analysis');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0B1221] selection:bg-brand-purple/30 pb-20 transition-colors duration-500">
            {/* Header */}
            <div className="bg-white/80 dark:bg-[#0B1221]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 py-4 px-6 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 text-sm font-bold transition-colors group"
                    >
                        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                        Cancel
                    </button>
                    <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step === 'setup' ? 'bg-brand-purple' : 'bg-gray-100 dark:bg-white/5'}`} />
                        <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step === 'metadata' ? 'bg-brand-purple' : 'bg-gray-100 dark:bg-white/5'}`} />
                        <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step === 'qa' ? 'bg-brand-purple' : 'bg-gray-100 dark:bg-white/5'}`} />
                        <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step === 'review' ? 'bg-brand-purple' : 'bg-gray-100 dark:bg-white/5'}`} />
                    </div>
                    <div className="hidden sm:block">
                        <SharpenLogo showText={false} />
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-12">
                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}

                {step === 'setup' && (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="mb-12 text-center">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-brand-purple rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                            </div>
                            <h2 className="font-serif italic text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight">Interview Reconstruction</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto font-medium">Recall your past interviews and get deep AI insights into your performance.</p>
                        </div>

                        <div className="bg-white dark:bg-[#0F172A]/40 backdrop-blur-xl rounded-[3rem] border border-gray-100 dark:border-white/5 p-10 md:p-12 shadow-soft">
                            <h3 className="font-sans text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-brand-purple shadow-sm" />
                                What type of interview was it?
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {[
                                    { id: 'TECHNICAL', label: 'Technical' },
                                    { id: 'BEHAVIORAL', label: 'Behavioral' },
                                    { id: 'SYSTEM_DESIGN', label: 'System Design' },
                                    { id: 'SCREEN', label: 'Phone Screen' },
                                    { id: 'OTHER', label: 'Other' }
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setData({ ...data, interview_round: type.id })}
                                        className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden ${data.interview_round === type.id
                                                ? 'border-brand-purple bg-brand-purple/[0.03]'
                                                : 'border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] hover:border-brand-purple/30 hover:bg-brand-purple/[0.01]'
                                            }`}
                                    >
                                        <div className={`font-sans font-bold text-lg mb-1 transition-colors ${data.interview_round === type.id ? 'text-brand-purple' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {type.label}
                                        </div>
                                        <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest opacity-60">Interview Round</div>
                                        {data.interview_round === type.id && (
                                            <div className="absolute top-0 right-0 p-3">
                                                <div className="w-5 h-5 bg-brand-purple rounded-full flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={nextStep}
                                className="w-full mt-10 bg-brand-purple text-white py-4 rounded-2xl font-bold hover:brightness-110 transition-all shadow-sm transform active:scale-[0.98]"
                            >
                                Let&apos;s Start →
                            </button>
                        </div>
                    </div>
                )}

                {step === 'metadata' && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                        <div className="mb-12">
                            <h2 className="font-serif italic text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">The Basics</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-base font-medium">Tell us where you interviewed and for what role.</p>
                        </div>

                        <div className="bg-white dark:bg-[#0F172A]/40 backdrop-blur-xl rounded-[3rem] border border-gray-100 dark:border-white/5 p-10 md:p-12 shadow-soft space-y-8">
                            <div className="group">
                                <label className="block text-sm font-bold text-gray-400 dark:text-gray-500 mb-3 ml-1 group-focus-within:text-brand-purple transition-colors">Company Name</label>
                                <input
                                    type="text"
                                    value={data.company_name}
                                    onChange={(e) => setData({ ...data, company_name: e.target.value })}
                                    placeholder="e.g. Google, Stripe, Local Startup"
                                    className="w-full bg-gray-50/50 dark:bg-white/[0.03] px-6 py-4 rounded-2xl border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all font-medium shadow-sm"
                                />
                            </div>
                            <div className="group">
                                <label className="block text-sm font-bold text-gray-400 dark:text-gray-500 mb-3 ml-1 group-focus-within:text-brand-purple transition-colors">Job Role</label>
                                <input
                                    type="text"
                                    value={data.job_role}
                                    onChange={(e) => setData({ ...data, job_role: e.target.value })}
                                    placeholder="e.g. Senior Frontend Engineer"
                                    className="w-full bg-gray-50/50 dark:bg-white/[0.03] px-6 py-4 rounded-2xl border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all font-medium shadow-sm"
                                />
                            </div>
                            <div className="group">
                                <label className="block text-sm font-bold text-gray-400 dark:text-gray-500 mb-3 ml-1 group-focus-within:text-brand-purple transition-colors">Interview Round</label>
                                <input
                                    type="text"
                                    value={data.interview_round}
                                    onChange={(e) => setData({ ...data, interview_round: e.target.value })}
                                    placeholder="e.g. Final Portfolio, Technical Phone Screen"
                                    className="w-full bg-gray-50/50 dark:bg-white/[0.03] px-6 py-4 rounded-2xl border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all font-medium shadow-sm"
                                />
                            </div>

                            <div className="flex gap-5 pt-6">
                                <button
                                    onClick={prevStep}
                                    className="flex-1 px-8 py-4 rounded-2xl font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-100 dark:border-white/5 transition-all text-sm uppercase tracking-widest"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={nextStep}
                                    disabled={!data.company_name || !data.job_role}
                                    className="flex-[2] bg-brand-purple text-white py-4 rounded-2xl font-bold hover:brightness-110 transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transform active:scale-[0.98]"
                                >
                                    Next: Add Questions
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'qa' && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                        <div className="mb-12 flex items-end justify-between border-b border-gray-100 dark:border-white/5 pb-8">
                            <div>
                                <h2 className="font-serif italic text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Recap the Q&A</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-base font-medium">Try to be as detailed as possible with your answers.</p>
                            </div>
                            <div className="bg-brand-purple/[0.08] border border-brand-purple/20 text-brand-purple px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                {data.qa_pairs.length} Questions
                            </div>
                        </div>

                        <div className="space-y-8">
                            {data.qa_pairs.map((qa, idx) => (
                                <div key={idx} className="bg-white dark:bg-[#0F172A]/40 backdrop-blur-xl rounded-[3rem] border border-gray-100 dark:border-white/5 p-10 md:p-12 shadow-soft relative group overflow-hidden">
                                     <div className={`absolute -top-12 -right-12 w-24 h-24 blur-[60px] opacity-10 bg-brand-purple`} />
                                     
                                    <div className="absolute -left-3 top-10 w-12 h-12 bg-brand-purple rounded-2xl flex items-center justify-center font-serif font-bold text-xl text-white shadow-sm z-20">
                                        {idx + 1}
                                    </div>
                                    
                                    {data.qa_pairs.length > 1 && (
                                        <button
                                            onClick={() => handleRemoveQA(idx)}
                                            className="absolute top-8 right-8 text-gray-400 hover:text-red-500 transition-all p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 z-20"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}

                                    <div className="space-y-8 ml-6">
                                        <div className="group">
                                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-brand-purple transition-colors">The Question</label>
                                            <textarea
                                                value={qa.question_text}
                                                onChange={(e) => handleQAChange(idx, 'question_text', e.target.value)}
                                                placeholder="What did the interviewer ask?"
                                                rows={2}
                                                className="w-full bg-gray-50/50 dark:bg-white/[0.03] px-6 py-5 rounded-2xl border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all font-medium shadow-sm italic font-serif leading-relaxed resize-none"
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-brand-purple transition-colors">Your Answer</label>
                                            <textarea
                                                value={qa.answer_text}
                                                onChange={(e) => handleQAChange(idx, 'answer_text', e.target.value)}
                                                placeholder="What was your response?"
                                                rows={4}
                                                className="w-full bg-gray-50/50 dark:bg-white/[0.03] px-6 py-5 rounded-2xl border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all font-medium shadow-sm leading-relaxed font-sans resize-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="group">
                                                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-brand-purple transition-colors">Follow-ups (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={qa.followup_text || ''}
                                                    onChange={(e) => handleQAChange(idx, 'followup_text', e.target.value)}
                                                    placeholder="Did they ask anything back?"
                                                    className="w-full bg-gray-50/50 dark:bg-white/[0.03] px-6 py-4 rounded-2xl border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all font-medium shadow-sm font-sans"
                                                />
                                            </div>
                                            <div className="group">
                                                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-brand-purple transition-colors">Confidence (1-10)</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={qa.confidence_score || ''}
                                                    onChange={(e) => handleQAChange(idx, 'confidence_score', parseInt(e.target.value))}
                                                    placeholder="Rate your self-confidence"
                                                    className="w-full bg-gray-50/50 dark:bg-white/[0.03] px-6 py-4 rounded-2xl border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all font-medium shadow-sm font-sans"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={handleAddQA}
                                className="w-full py-6 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[3rem] text-gray-400 dark:text-gray-500 font-bold hover:border-brand-purple/50 hover:text-brand-purple hover:bg-brand-purple/[0.02] transition-all flex items-center justify-center gap-3 bg-gray-50/50 dark:bg-white/[0.01]"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Another Question
                            </button>

                            <div className="flex gap-5 pt-12">
                                <button
                                    onClick={prevStep}
                                    className="flex-1 px-8 py-5 rounded-2xl font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-100 dark:border-white/5 transition-all text-sm uppercase tracking-widest"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={nextStep}
                                    disabled={data.qa_pairs.some(qa => !qa.question_text || !qa.answer_text)}
                                    className="flex-[2] bg-brand-purple text-white py-5 rounded-2xl font-bold hover:brightness-110 transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transform active:scale-[0.98]"
                                >
                                    Review Recap →
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'review' && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                        <div className="mb-12">
                            <h2 className="font-serif italic text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Final Review</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-base font-medium">Make sure everything looks right before we analyze your performance.</p>
                        </div>

                        <div className="bg-white dark:bg-[#0F172A]/40 backdrop-blur-xl rounded-[3rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-soft mb-12 transition-colors duration-500">
                            <div className="bg-gray-50 dark:bg-white/[0.03] px-10 py-8 border-b border-gray-100 dark:border-white/5 relative">
                                <div className="absolute top-0 right-0 w-32 h-32 blur-[80px] bg-brand-purple/10" />
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-serif italic text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{data.company_name}</h4>
                                    <div className="bg-brand-purple/[0.08] border border-brand-purple/20 text-brand-purple px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                        {data.interview_type}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-wider">
                                    <span>{data.job_role}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-white/10" />
                                    <span>{data.interview_round}</span>
                                </div>
                            </div>

                            <div className="p-10 space-y-12">
                                {data.qa_pairs.map((qa, idx) => (
                                    <div key={idx} className={`${idx !== 0 ? 'pt-10 border-t border-gray-100 dark:border-white/5' : ''} group`}>
                                        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 group-hover:text-brand-purple transition-colors">Question {idx + 1}</div>
                                        <h5 className="font-serif italic text-xl font-bold text-gray-900 dark:text-white mb-6 group-hover:translate-x-1 transition-transform">{qa.question_text}</h5>
                                        <div className="bg-gray-50 dark:bg-white/[0.03] rounded-2xl p-8 text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed italic border border-gray-100 dark:border-white/5 relative font-serif">
                                            <svg className="absolute -top-3 -left-3 w-8 h-8 text-gray-200 dark:text-white/5" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V12C14.017 12.5523 13.5693 13 13.017 13H10.017V21H14.017ZM10.017 21V13H7.01705C6.46477 13 6.01705 12.5523 6.01705 12V9C6.01705 8.44772 6.46477 8 7.01705 8H11.017C11.5693 8 12.017 8.44772 12.017 9V15C12.017 15.5523 11.5693 16 11.017 16H8.01705C6.91248 16 6.01705 16.8954 6.01705 18V21H10.017Z" /></svg>
                                            &ldquo;{qa.answer_text}&rdquo;
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-5">
                            <button
                                onClick={prevStep}
                                className="flex-1 px-8 py-5 rounded-2xl font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-100 dark:border-white/5 transition-all text-sm uppercase tracking-widest"
                            >
                                Edit Details
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-[2] bg-brand-purple text-white py-5 rounded-2xl font-bold hover:brightness-110 transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 transform active:scale-[0.98]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        Generate Insights
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

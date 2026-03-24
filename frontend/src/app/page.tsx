'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import SharpenLogo from '@/components/SharpenLogo';

export default function HomePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');

    return (
        <div className="min-h-screen bg-[#FDFCFB] font-sans text-[#1A1F36] selection:bg-brand-purple/10">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FDFCFB]/80 backdrop-blur-md border-b border-[#1A1F36]/5 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-2 group">
                            <SharpenLogo />
                        </Link>
                        
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
                            <Link href="#" className="hover:text-brand-purple transition-colors">Solutions</Link>
                            <Link href="#" className="hover:text-brand-purple transition-colors">How it works</Link>
                            <Link href="#" className="hover:text-brand-purple transition-colors">Pricing</Link>
                            <Link href="#" className="hover:text-brand-purple transition-colors">About</Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-semibold hover:text-brand-purple transition-colors px-4 py-2">Sign in</Link>
                        <Link 
                            href="/login" 
                            className="bg-brand-purple text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-purple/20 hover:bg-brand-purple-light transition-all active:scale-95"
                        >
                            Join waitlist
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="pt-40 pb-32 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/5 border border-brand-purple/10 text-[11px] font-bold text-brand-purple uppercase tracking-widest mb-8">
                            Launching Platform v4.0
                        </div>
                        
                        <h1 className="text-6xl md:text-8xl font-medium leading-[0.95] mb-10 tracking-tight text-gray-900">
                            You&apos;re working hard. <br />
                            <span className="font-serif italic text-brand-purple block mt-2">You deserve to know</span>
                            <span className="font-serif italic text-brand-purple opacity-90">why it&apos;s not enough.</span>
                        </h1>
                        
                        <p className="text-gray-500 text-xl md:text-2xl leading-relaxed mb-12 max-w-xl">
                            Sharpen analyzes your performance so you know <span className="text-gray-900 font-semibold underline decoration-brand-purple/30">exactly</span> what&apos;s holding you back — and exactly how to fix it. Real signals. Real growth.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 max-w-lg p-2 rounded-2xl bg-white border border-gray-100 shadow-soft">
                            <input 
                                type="email"
                                placeholder="name@email.com"
                                className="flex-1 bg-transparent px-4 py-3 outline-none text-gray-900 placeholder:text-gray-300 font-medium"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button className="w-full sm:w-auto bg-brand-purple text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand-purple/20 hover:bg-brand-purple-light transition-all active:scale-95">
                                Join waitlist
                            </button>
                        </div>
                        <p className="mt-4 text-[10px] text-gray-400 font-medium uppercase tracking-widest pl-2">
                            Join 4,000+ professionals on the waitlist. Launching June 2024.
                        </p>
                    </div>

                    {/* Hero Image / Mockup Placeholder */}
                    <div className="relative">
                        <div className="aspect-[4/5] rounded-[2.5rem] bg-gray-100/50 border border-gray-200/50 relative overflow-hidden shadow-2xl group">
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            {/* Inner Card Mockup Placeholder */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[70%] bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 animate-in fade-in zoom-in duration-1000">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                </div>
                                <div className="space-y-4">
                                    <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                                    <div className="h-4 bg-gray-100 rounded-full w-1/2" />
                                    <div className="h-20 bg-brand-purple/5 rounded-2xl w-full border border-brand-purple/10 flex items-center justify-center">
                                        <div className="text-brand-purple text-sm font-serif italic text-center px-6 leading-tight">
                                            &quot;Your performance in Technical Depth was strong, but your System Design articulation needs refinement.&quot;
                                        </div>
                                    </div>
                                    <div className="h-4 bg-gray-100 rounded-full w-2/3" />
                                    <div className="pt-6 grid grid-cols-2 gap-4">
                                        <div className="h-24 bg-gray-50 rounded-2xl border border-gray-100" />
                                        <div className="h-24 bg-gray-50 rounded-2xl border border-gray-100" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-purple/10 blur-[80px] rounded-full" />
                        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-blue-400/10 blur-[100px] rounded-full" />
                    </div>
                </div>
            </main>

            {/* Section 2: Not failing because... */}
            <section className="py-32 px-6 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto text-center mb-24">
                    <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-gray-900 mb-6">
                        You&apos;re not failing because <br /> 
                        <span className="font-serif italic text-brand-purple">you&apos;re not good enough.</span>
                    </h2>
                    <p className="font-serif italic text-2xl md:text-3xl text-gray-400">
                        Nobody&apos;s shown you the mirror.
                    </p>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        {
                            title: "You're preparing in the dark",
                            desc: "On paper, the metrics make sense. But without visibility, you are essentially gambling on what you think matters — and losing visibility on what actually does."
                        },
                        {
                            title: "You can't see yourself clearly",
                            desc: "The pattern is obvious once it's pointed out to you. But in the midst of the performance, you are too close to see the signals that are holding you back."
                        },
                        {
                            title: "The gap feels personal. It isn't.",
                            desc: "Missing the mark feels like a talent problem. It's almost always a technical one. The difference between where you are and where you want to be is just one or two data points."
                        }
                    ].map((card, i) => (
                        <div key={i} className="group p-10 rounded-[2rem] bg-[#FDFCFB] border border-gray-100 shadow-sm hover:shadow-soft transition-all duration-500">
                            <h3 className="text-xl font-bold mb-6 group-hover:text-brand-purple transition-colors">{card.title}</h3>
                            <p className="text-gray-500 leading-relaxed">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Section 3: From guesswork... */}
            <section className="py-32 px-6 bg-[#FDFCFB]">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div>
                        <div className="text-xs font-bold text-brand-purple uppercase tracking-[0.2em] mb-6">Mindset &rarr; Execution</div>
                        <h2 className="text-5xl md:text-6xl font-medium tracking-tight text-gray-900 mb-12">
                            From guesswork to <br />
                            <span className="font-serif italic text-brand-purple">a clear growth path</span>
                        </h2>
                        
                        <div className="space-y-10">
                            {[
                                { t: "Capture your session", d: "Drop a recording of your conversation. Sharpen works behind the scenes to extract high-signal technical and behavioral indicators." },
                                { t: "Deconstruct your signals", d: "Our AI engine analyzes your response structure, technical depth, and delivery patterns to identify where the signal is being lost." },
                                { t: "Get your performance report", d: "Receive a detailed, evidence-based report within minutes. No generic feedback. Just the truth about your performance." },
                                { t: "Track your growth overtime", d: "Visualize where you've improved and where you've hit a plateau. Compare your strength across sessions to ensure consistent advancement." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-6">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-purple/5 border border-brand-purple/10 flex items-center justify-center text-xs font-bold text-brand-purple">
                                        0{i + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-2 text-gray-900">{item.t}</h4>
                                        <p className="text-gray-500 leading-relaxed">{item.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="aspect-square rounded-[3rem] bg-white border border-gray-100 shadow-soft overflow-hidden p-12">
                             {/* Analysis Visualization Mockup */}
                             <div className="h-full flex flex-col">
                                <div className="flex items-center justify-between mb-12">
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Competency Model</div>
                                        <div className="text-sm font-bold text-gray-900">System Design Articulation</div>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-brand-purple text-white flex items-center justify-center font-serif italic text-xl shadow-lg shadow-brand-purple/20">
                                        8.4
                                    </div>
                                </div>
                                
                                <div className="space-y-6 flex-grow">
                                    <div className="p-5 rounded-2xl bg-brand-purple/[0.03] border border-brand-purple/10">
                                        <div className="text-[10px] font-bold text-brand-purple uppercase tracking-widest mb-3">Core Strength Found</div>
                                        <p className="text-xs text-gray-600 leading-relaxed italic font-serif">
                                            &quot;Your explanation of database sharding strategies demonstrated high technical depth and architectural foresight.&quot;
                                        </p>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-rose-50 border border-rose-100">
                                        <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-3">Critical Focus Point</div>
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            The transition between monolithic context and microservices scaling transition lacked specific latency trade-off analysis.
                                        </p>
                                    </div>
                                    <div className="flex gap-2 pt-6">
                                        {['Latency Analysis', 'DB Strategies', 'Scaling Logic'].map(tag => (
                                            <span key={tag} className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-[10px] font-bold text-gray-400">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 4: The Thoughts... */}
            <section className="py-32 px-6 bg-white border-t border-gray-100 overflow-hidden relative">
                 <div className="max-w-7xl mx-auto text-center mb-24 relative z-10">
                    <div className="text-xs font-bold text-brand-purple uppercase tracking-[0.2em] mb-6">User Perspectives</div>
                    <h2 className="text-5xl md:text-6xl font-medium tracking-tight text-gray-900">
                        The thoughts you have <br />
                        <span className="font-serif italic text-brand-purple">after every session.</span>
                    </h2>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    {[
                        { q: "Is it my luck? I have the silence after I send a follow-up.", a: "Every silence is data. Sharpen shows you why the conversation ended where it did, so you can control the outcome next time." },
                        { q: "I've been trying so hard. I have been given the 'not a fit' for no reason.", a: "The 'not a fit' is a generic label for a specific technical gap. We find the gap, so you can stop guessing and start solving." },
                        { q: "Maybe it's just not meant for me. Or maybe nobody's told me the truth yet.", a: "The truth is often hidden in the nuance of delivery. Sharpen provides the objective truth you need to bridge the gap." }
                    ].map((card, i) => (
                        <div key={i} className="p-10 rounded-[2.5rem] bg-[#FDFCFB] border border-gray-100 hover:border-brand-purple/20 transition-all duration-700">
                            <div className="font-serif italic text-xl text-gray-900 mb-8 leading-relaxed">
                                &quot;{card.q}&quot;
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {card.a}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Section 5: Come too far... */}
            <section className="py-40 px-6 bg-[#FDFCFB] text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-[20vw] font-bold text-[#1A1F36]/[0.02] select-none uppercase pointer-events-none">
                    SHARPEN
                </div>
                
                <div className="max-w-3xl mx-auto relative z-10">
                    <h2 className="text-6xl md:text-8xl font-medium tracking-tight text-gray-900 mb-10 leading-[0.95]">
                        You&apos;ve come too far <br />
                        <span className="font-serif italic text-brand-purple">to keep guessing.</span>
                    </h2>
                    <p className="text-gray-500 text-xl mb-12 max-w-xl mx-auto leading-relaxed">
                        Join the waitlist. Get a true analysis of where to focus. Finally understand what&apos;s holding you back — and exactly how to fix it.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 max-w-lg mx-auto p-2 rounded-2xl bg-white border border-gray-100 shadow-soft">
                        <input 
                            type="email"
                            placeholder="name@email.com"
                            className="flex-1 bg-transparent px-4 py-3 outline-none text-gray-900 placeholder:text-gray-300 font-medium w-full"
                        />
                        <button className="w-full sm:w-auto bg-brand-purple text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand-purple/20 hover:bg-brand-purple-light transition-all active:scale-95">
                            Join waitlist
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 bg-white border-t border-gray-50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-brand-purple rounded flex items-center justify-center">
                             <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                        </div>
                        <span className="font-bold text-sm tracking-tight">sharpen.ai</span>
                        <span className="text-gray-300 text-sm ml-2 font-medium">Career Performance Analytics</span>
                    </div>

                    <div className="flex items-center gap-8 text-xs font-medium text-gray-400">
                        <Link href="#" className="hover:text-brand-purple transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-brand-purple transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-brand-purple transition-colors">Contact</Link>
                        <span className="ml-4">&copy; 2024 Sharpen.ai</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

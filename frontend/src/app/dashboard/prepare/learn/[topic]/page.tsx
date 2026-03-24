'use client';

import { useAuth } from '@/lib/auth';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { TopicMetadata } from '@/lib/learn-data';
import { generateLesson } from '@/lib/api';

interface Message {
    id: string;
    role: 'ai' | 'user';
    content: string;
    type?: 'explanation' | 'question' | 'analogy' | 'code';
    options?: string[];
    timestamp: Date;
}

export default function AIPlaygroundPage() {
    const { user, token, isLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const topic = params.topic as string;
    const [metadata, setMetadata] = useState<TopicMetadata | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isGenerating, setIsGenerating] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isLoading && !user) router.replace('/login');
        
        async function fetchLesson() {
            if (!topic || !token) return;
            
            try {
                const data: TopicMetadata = await generateLesson(token, topic);
                console.log('Tutor AI Resolved Topic:', { topic, resolved: data.topic, language: data.language });
                setMetadata(data);
                
                const lessonContent = data.fullLesson 
                    ? `${data.fullLesson}\n\nWould you like an **interview question** to test your knowledge on this topic?`
                    : `Let's dive into **${data.displayName}** in **${data.language}**.\n\n### 1. What is it?\n${data.whatIsIt}\n\n### 2. Where to use it?\n${data.whereToUse}\n\n### 3. Real-world Example\n${data.realWorldExample}\n\n### 4. Syntax / Code\n${data.syntax}\n\nWould you like an **interview question** to test your knowledge on this topic?`;

                setMessages([
                    {
                        id: '1',
                        role: 'ai',
                        content: lessonContent,
                        type: 'explanation',
                        timestamp: new Date()
                    }
                ]);
            } catch (err: any) {
                console.error('Failed to generate lesson', err);
                setError(err.message || 'Failed to generate lesson. Ensure you are connected to the network.');
            } finally {
                setIsGenerating(false);
            }
        }

        fetchLesson();
    }, [user, isLoading, router, topic, token]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (override?: string) => {
        const text = override || input;
        if (!text.trim()) return;
        
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        simulateAIResponse(text.trim());
    };

    const simulateAIResponse = (text: string) => {
        setIsThinking(true);
        setTimeout(() => {
            setIsThinking(false);
            
            const lowerText = text.toLowerCase();
            const wantsQuestion = lowerText.includes('question') || lowerText.includes('yes') || lowerText.includes('sure') || lowerText.includes('test') || lowerText.includes('next');
            const lastMsg = messages[messages.length - 1];
            
            const activeQuestionMsg = [...messages].reverse().find(m => m.role === 'ai' && m.type === 'question');
            const isAnsweringActive = activeQuestionMsg && !messages.slice(messages.indexOf(activeQuestionMsg) + 1).some(m => m.role === 'ai');

            let content = '';
            let options: string[] | undefined;
            let msgType: 'explanation' | 'question' = 'explanation';

            if (isAnsweringActive && metadata) {
                const currentQuestion = metadata.questions[currentQuestionIndex];
                const isCorrect = text.trim() === currentQuestion.correctAnswer;
                
                content = isCorrect 
                    ? `✅ **Correct!**\n\n${currentQuestion.explanation}`
                    : `❌ **Not quite.**\n\nThe correct answer is **${currentQuestion.correctAnswer}**.\n\n${currentQuestion.explanation}`;
                
                const hasMoreQuestions = currentQuestionIndex < metadata.questions.length - 1;
                if (hasMoreQuestions) {
                    content += `\n\nReady for the **next question** or do you want more details?`;
                    options = ['Next question', 'Tell me more', 'I\'m done'];
                } else {
                    content += `\n\nYou've finished all questions for this topic! Would you like to explore another topic or do you have any more questions about **${metadata.displayName}**?`;
                    options = ['Explore next topic', 'Ask another question', 'I\'m done'];
                }
            } else if (wantsQuestion && metadata) {
                const nextIndex = text.toLowerCase().includes('next') ? currentQuestionIndex + 1 : currentQuestionIndex;
                const indexToUse = nextIndex < metadata.questions.length ? nextIndex : 0;
                setCurrentQuestionIndex(indexToUse);
                
                const question = metadata.questions[indexToUse];
                content = `Let's see how well you've grasped the concept.\n\n**${question.question}**`;
                options = question.options;
                msgType = 'question';
            } else {
                content = `I'm here to help! Whether you want more details, another example, or if you're ready for an **interview question**, just let me know. What else would you like to know about **${metadata?.displayName}**?`;
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content,
                type: msgType,
                options,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 1200);
    };

    if (isLoading || !user) return null;
     if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0A0E14] p-6">
                <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-[2rem] flex items-center justify-center mb-8 border border-rose-500/20 shadow-sm">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Generation Failed</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-sm text-center font-medium leading-relaxed">
                    The AI tutor ran into an issue loading the topic '{decodeURIComponent(topic)}'. Check your connection and try again.
                </p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-8 py-4 bg-brand-purple text-white font-bold rounded-2xl hover:brightness-110 transition-all shadow-sm"
                >
                    Retry Lesson
                </button>
            </div>
        );
    }
    
    if (isGenerating) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0A0E14]">
                <div className="w-16 h-16 border-4 border-gray-100 dark:border-white/5 border-t-brand-purple rounded-full animate-spin mb-8 shadow-sm" />
                <p className="text-gray-900 dark:text-white font-bold text-xl tracking-tight">Generating lesson for {decodeURIComponent(topic)}...</p>
                <p className="text-gray-400 dark:text-gray-600 font-bold mt-3 uppercase tracking-[0.2em] text-[10px]">Hand-crafted for your career path</p>
            </div>
        );
    }
    
    if (!metadata) return null;

    return (
        <div className="flex h-screen bg-white dark:bg-[#0A0E14] overflow-hidden">
            {/* Sidebar - Topic & Guidance Style */}
            <aside className="w-96 border-r border-gray-100 dark:border-white/5 flex flex-col p-10 hidden xl:flex dark:bg-[#0F172A]/20 backdrop-blur-3xl relative overflow-hidden shrink-0">
                <div className="flex-1 space-y-12">
                    <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em] mb-6">Active Domain</div>
                        <div className="p-7 rounded-[2.5rem] bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 relative group overflow-hidden shadow-soft">
                            <div className="flex items-center gap-5 relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-midnight-800 border border-gray-100 dark:border-white/10 flex items-center justify-center text-brand-purple shadow-sm transition-all duration-500">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.331 0 4.476.89 6.08 2.354M12 6.042A8.967 8.967 0 0118 3.75c1.052 0-2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.331 0-4.476.89-6.08 2.354" />
                                    </svg>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="text-gray-900 dark:text-white font-bold truncate text-lg tracking-tight">{metadata.language}</div>
                                    <div className="text-[11px] text-brand-purple font-bold uppercase tracking-widest mt-1 truncate">{metadata.displayName}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {metadata.syllabusTopics && metadata.syllabusTopics.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
                            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em] mb-8">Concept Roadmap</div>
                            <div className="space-y-6">
                                {metadata.syllabusTopics.map((item) => (
                                    <button 
                                        key={item} 
                                        onClick={() => router.push(`/dashboard/prepare/learn/${item.toLowerCase().trim().replace(/[ _]/g, '-')}`)}
                                        className="flex items-center gap-4 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-brand-purple cursor-pointer group transition-all w-full text-left"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-midnight-700 group-hover:bg-brand-purple transition-all duration-300" />
                                        <span className="truncate group-hover:translate-x-1 transition-transform">{item}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {metadata.interviewTopics && metadata.interviewTopics.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
                            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em] mb-8">Interview Targets</div>
                            <div className="space-y-6">
                                {metadata.interviewTopics.map((item) => (
                                    <button 
                                        key={item} 
                                        onClick={() => router.push(`/dashboard/prepare/learn/${item.toLowerCase().trim().replace(/[ _]/g, '-')}`)}
                                        className="flex items-center gap-4 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-brand-purple cursor-pointer group transition-all w-full text-left"
                                    >
                                        <div className="w-7 h-7 rounded-xl bg-brand-purple/[0.08] border border-brand-purple/20 text-xs flex items-center justify-center group-hover:bg-brand-purple group-hover:text-white transition-all duration-300 shadow-sm">🎯</div>
                                        <span className="truncate group-hover:translate-x-1 transition-transform">{item}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-auto p-10 bg-brand-purple/[0.04] rounded-[3rem] border border-brand-purple/10 relative group overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="relative z-10">
                        <div className="text-sm font-bold text-gray-900 dark:text-white mb-3 italic tracking-tight font-serif">Need a deep dive?</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                            Ask for an analogy, a real-world project, or a quick mock question anytime.
                        </p>
                    </div>
                </div>
            </aside>

            {/* Chat Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-[#0A0E14]">
                {/* Header */}
                <header className="h-24 border-b border-gray-100 dark:border-white/5 flex items-center px-10 bg-white/80 dark:bg-[#0A0E14]/80 backdrop-blur-2xl sticky top-0 z-20 justify-between shrink-0">
                     <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center shadow-sm border border-gray-100 dark:border-white/10 group">
                            <span className="text-xs font-bold group-hover:scale-110 transition-transform">AI</span>
                        </div>
                        <div>
                            <span className="font-bold text-gray-900 dark:text-white text-xl tracking-tight">Mentor AI</span>
                            <div className="flex items-center gap-2.5 mt-1">
                                <span className="w-2 h-2 rounded-full bg-brand-purple animate-pulse" />
                                <span className="text-[10px] font-bold text-brand-purple uppercase tracking-[0.2em]">Contextual Synthesis Active</span>
                            </div>
                        </div>
                     </div>
                     <button
                        onClick={() => router.push('/dashboard/prepare/learn')}
                        className="text-[11px] font-bold text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white uppercase tracking-[0.2em] transition-all px-8 py-3.5 border border-gray-100 dark:border-white/5 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95 shadow-sm"
                     >
                        End Session
                     </button>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-8 space-y-12 max-w-5xl mx-auto w-full custom-scrollbar relative z-10">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-6 duration-700`}>
                            <div className={`flex gap-8 max-w-[92%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`flex-shrink-0 w-14 h-14 rounded-[1.2rem] flex items-center justify-center border transition-all duration-700 ${
                                    msg.role === 'ai' 
                                    ? 'bg-white dark:bg-midnight-900 border-gray-100 dark:border-white/10 text-brand-purple shadow-soft' 
                                    : 'bg-brand-purple border-brand-purple/20 text-white shadow-soft'
                                }`}>
                                    {msg.role === 'ai' ? (
                                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v1.607a2 2 0 01-1.006.1.75.75 0 10-.148 1.492c.457.045.92.045 1.377 0a.75.75 0 10-.149-1.492 2 2 0 01-1.005-.1V3.104a.75.75 0 00-1.237-.58L5.334 5.69a1.066 1.066 0 01-1.5.025l-.027-.026a1.066 1.066 0 01-.025-1.5l2.362-2.363a2.25 2.25 0 013.181 0l.424.424v.284zm0 0h5.25m-5.25 0v3.104m5.25-3.104v3.104m0 0v1.607a2 2 0 001.006.1.75.75 0 11.148 1.492c-.457.045-.92.045-1.377 0a.75.75 0 11.149-1.492 2 2 0 001.005-.1V3.104a.75.75 0 011.237-.58l2.363 2.362a1.066 1.066 0 001.5-.025l.027.026a1.066 1.066 0 00.025 1.5l-2.362 2.363a2.25 2.25 0 00-3.181 0l-.424-.424V3.104zM3 13.5v.187a1.013 1.013 0 00.372.736l.335.25a.75.75 0 00.899-1.2l-.335-.25a.25.25 0 01-.092-.182V13.5H3zM21 13.5v.187a1.013 1.013 0 01-.372.736l-.335.25a.75.75 0 01-.899-1.2l.335-.25a.25.25 0 00.092-.182V13.5h1.5z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="space-y-5 flex-1 overflow-hidden">
                                     <div className={`p-8 rounded-[2.5rem] relative overflow-hidden shadow-soft transition-all duration-700 ${
                                         msg.role === 'ai' 
                                         ? 'bg-gray-50/50 dark:bg-[#0F172A]/40 border border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-300' 
                                         : 'bg-white dark:bg-midnight-900 border border-brand-purple/20 text-gray-900 dark:text-white'
                                     }`}>
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-purple/[0.03] blur-[80px] opacity-60 pointer-events-none" />
                                        <div className="whitespace-pre-wrap font-sans prose prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-bold dark:prose-headings:text-white prose-strong:text-brand-purple dark:prose-strong:text-brand-purple prose-code:bg-gray-100 dark:prose-code:bg-midnight-800 prose-code:text-brand-purple prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-bold prose-code:before:content-none prose-code:after:content-none border-b-0 text-sm">
                                            {(() => {
                                                const parts = msg.content.split(/(```[\s\S]*?```)/g);
                                                return parts.map((part, index) => {
                                                    if (part.startsWith('```')) {
                                                        const code = part.replace(/```(\w+)?\n?/, '').replace(/```$/, '').trim();
                                                        return (
                                                            <div key={index} className="my-6 relative group/code antialiased">
                                                                <pre className="p-6 rounded-2xl bg-midnight-950/80 dark:bg-midnight-950 border border-gray-100 dark:border-white/5 overflow-x-auto custom-scrollbar shadow-inner group-hover:border-brand-purple/30 transition-all duration-500">
                                                                    <code className="text-[13px] font-mono leading-relaxed text-gray-300 dark:text-gray-400 block">
                                                                        {code}
                                                                    </code>
                                                                </pre>
                                                                <div className="absolute top-4 right-4 text-[10px] font-bold text-gray-600 dark:text-gray-700 uppercase tracking-widest pointer-events-none group-hover:text-brand-purple transition-colors">
                                                                    Syntax Output
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    
                                                    return part.split('\n').map((line, i) => {
                                                        const trimmedLine = line.trim();
                                                        if (!trimmedLine) return <div key={`${index}-${i}`} className="h-2" />;
                                                        
                                                        if (trimmedLine.startsWith('###')) {
                                                            return (
                                                                <h3 key={`${index}-${i}`} className="text-gray-900 dark:text-white font-bold text-lg mb-4 mt-6 first:mt-0">
                                                                    {trimmedLine.replace(/^###\s*/, '')}
                                                                </h3>
                                                            );
                                                        }
                                                        
                                                        if (trimmedLine.startsWith('•')) {
                                                            return (
                                                                <div key={`${index}-${i}`} className="flex gap-4 mb-3 pl-4 group/bullet items-start">
                                                                    <span className="text-brand-purple font-bold text-lg leading-none pt-0.5 group-hover:scale-125 transition-transform duration-300">•</span>
                                                                    <span className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed text-sm">{trimmedLine.substring(1).trim()}</span>
                                                                </div>
                                                            );
                                                        }
                                                        
                                                        return (
                                                            <p key={`${index}-${i}`} className="mb-4 last:mb-0 font-medium text-sm leading-relaxed" dangerouslySetInnerHTML={{ 
                                                                __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-purple font-bold">$1</strong>').replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-midnight-800/80 text-brand-purple px-1.5 py-0.5 rounded border border-gray-100 dark:border-white/5 font-bold transition-all hover:brightness-110">$1</code>') 
                                                            }} />
                                                        );
                                                    });
                                                });
                                            })()}
                                        </div>
                                        
                                        {msg.options && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                                                {msg.options.map((opt) => (
                                                    <button 
                                                        key={opt}
                                                        onClick={() => handleSend(opt)}
                                                        className="p-6 rounded-[1.8rem] border border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 hover:border-brand-purple/50 hover:bg-brand-purple/[0.04] transition-all text-left text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-brand-purple shadow-sm backdrop-blur-3xl active:scale-[0.97] group/opt flex items-center justify-between"
                                                    >
                                                        <span>{opt}</span>
                                                        <svg className="w-5 h-5 opacity-0 group-hover/opt:opacity-100 group-hover/opt:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                        </svg>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                     </div>
                                     <div className={`text-[10px] font-bold text-gray-400 dark:text-gray-700 uppercase tracking-[0.3em] px-6 ${msg.role === 'user' ? 'text-right' : ''}`}>
                                         {msg.role === 'ai' ? 'Expert Intelligence' : 'Candidate Progress'} • Just now
                                     </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isThinking && (
                        <div className="flex gap-8 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-midnight-900 border border-gray-100 dark:border-white/5 flex items-center justify-center shadow-soft">
                                <span className="flex gap-1.5">
                                    <span className="w-2 h-2 bg-brand-purple rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-2 h-2 bg-brand-purple rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-2 h-2 bg-brand-purple rounded-full animate-bounce" />
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} className="h-4" />
                </div>

                {/* Footer Input */}
                <div className="p-12 bg-white dark:bg-[#0A0E14] border-t border-gray-100 dark:border-white/5 relative z-30 pt-16 shrink-0">
                    <div className="relative w-full max-w-4xl mx-auto group">
                         <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type your response or ask a follow-up..."
                                className="w-full bg-gray-50 dark:bg-midnight-950/90 backdrop-blur-3xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] px-10 py-8 text-gray-900 dark:text-white focus:outline-none focus:border-brand-purple/40 transition-all font-bold pr-28 shadow-soft text-lg placeholder:text-gray-300 dark:placeholder:text-gray-700"
                            />
                            <button 
                                onClick={() => handleSend()}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-brand-purple text-white p-5 rounded-[1.8rem] hover:brightness-110 active:scale-90 transition-all shadow-sm"
                            >
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                         </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

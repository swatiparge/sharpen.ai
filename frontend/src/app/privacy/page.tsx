import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy – Sharpen.ai',
    description: 'Privacy Policy for Sharpen.ai, the AI-powered interview coaching platform.',
};

const LAST_UPDATED = 'March 25, 2025';
const CONTACT_EMAIL = 'legal@sharpen.ai';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0B1221] transition-colors duration-500">
            <div className="max-w-3xl mx-auto px-6 py-20">

                {/* Header */}
                <div className="mb-16">
                    <Link href="/login" className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] hover:text-brand-purple transition-colors mb-10 inline-block">
                        ← Back to Sharpen.ai
                    </Link>
                    <span className="text-[10px] font-bold text-brand-purple uppercase tracking-[0.3em] mb-4 block">Legal</span>
                    <h1 className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-6 font-serif italic">Privacy Policy</h1>
                    <p className="text-gray-400 dark:text-gray-600 text-sm font-medium">Last updated: {LAST_UPDATED}</p>
                </div>

                {/* Content */}
                <div className="space-y-12">

                    <Section title="1. Introduction">
                        <p>Sharpen.ai ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains what data we collect, how we use it, and your rights regarding that data when you use our AI-powered interview coaching platform.</p>
                    </Section>

                    <Section title="2. Information We Collect">
                        <p><strong className="text-gray-700 dark:text-gray-300">Account Information</strong> — When you sign in via Google OAuth, we receive your name, email address, and profile picture. We do not receive your Google password.</p>
                        <p><strong className="text-gray-700 dark:text-gray-300">Onboarding Profile</strong> — Job title, target role, years of experience, target company, and other career context you provide during setup.</p>
                        <p><strong className="text-gray-700 dark:text-gray-300">Interview Recordings & Transcripts</strong> — Audio files you upload or record, and the text transcripts generated from them.</p>
                        <p><strong className="text-gray-700 dark:text-gray-300">Reconstructed Interviews</strong> — Question-and-answer text you manually enter to reconstruct past interviews.</p>
                        <p><strong className="text-gray-700 dark:text-gray-300">Usage Data</strong> — Pages visited, features used, session duration, and general interaction patterns to improve the product.</p>
                    </Section>

                    <Section title="3. How We Use Your Data">
                        <ul>
                            <li><strong className="text-gray-700 dark:text-gray-300">To provide the Service</strong> — Transcribing audio, scoring your answers, generating metrics, and building personalized improvement roadmaps.</li>
                            <li><strong className="text-gray-700 dark:text-gray-300">To improve AI accuracy</strong> — Aggregated and anonymized data may be used to improve our scoring models.</li>
                            <li><strong className="text-gray-700 dark:text-gray-300">To communicate with you</strong> — Service updates, support responses, and product announcements (you may opt out of marketing emails at any time).</li>
                            <li><strong className="text-gray-700 dark:text-gray-300">Security and fraud prevention</strong> — Identifying and protecting against malicious activity.</li>
                        </ul>
                    </Section>

                    <Section title="4. Third-Party Services">
                        <p>We use the following third-party services to operate Sharpen.ai:</p>
                        <ul>
                            <li><strong className="text-gray-700 dark:text-gray-300">Google OAuth</strong> — Authentication only. Governed by <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google's Privacy Policy</a>.</li>
                            <li><strong className="text-gray-700 dark:text-gray-300">AssemblyAI</strong> — Audio transcription. Audio files are transmitted securely and are subject to <a href="https://www.assemblyai.com/legal/privacy-policy" target="_blank" rel="noreferrer">AssemblyAI's Privacy Policy</a>.</li>
                            <li><strong className="text-gray-700 dark:text-gray-300">NVIDIA NIM</strong> — AI language model inference for scoring. Inputs are subject to <a href="https://www.nvidia.com/en-us/about-nvidia/privacy-policy/" target="_blank" rel="noreferrer">NVIDIA's Privacy Policy</a>.</li>
                            <li><strong className="text-gray-700 dark:text-gray-300">AWS S3 / Cloudflare R2</strong> — Secure cloud storage for audio recordings.</li>
                        </ul>
                        <p>We do not sell your personal data to advertisers or data brokers.</p>
                    </Section>

                    <Section title="5. Data Retention">
                        <p>We retain your data for as long as your account is active. You may request deletion of your account and associated data at any time by contacting <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
                        <p>Anonymized, aggregated data may be retained indefinitely for product improvement purposes.</p>
                    </Section>

                    <Section title="6. Data Security">
                        <p>We use industry-standard security measures including encrypted connections (TLS), secure cloud storage, and access controls. However, no system is perfectly secure and we cannot guarantee absolute security of your data.</p>
                    </Section>

                    <Section title="7. Your Rights">
                        <p>Depending on your location, you may have the following rights:</p>
                        <ul>
                            <li><strong className="text-gray-700 dark:text-gray-300">Access</strong> — Request a copy of the data we hold about you.</li>
                            <li><strong className="text-gray-700 dark:text-gray-300">Correction</strong> — Request correction of inaccurate data.</li>
                            <li><strong className="text-gray-700 dark:text-gray-300">Deletion</strong> — Request deletion of your account and data.</li>
                            <li><strong className="text-gray-700 dark:text-gray-300">Objection</strong> — Object to certain types of data processing.</li>
                            <li><strong className="text-gray-700 dark:text-gray-300">Portability</strong> — Request your data in a machine-readable format.</li>
                        </ul>
                        <p>To exercise any of these rights, email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
                    </Section>

                    <Section title="8. Cookies">
                        <p>We use minimal cookies required for authentication and session management. We do not use third-party advertising cookies. You can disable cookies in your browser settings, but this may affect your ability to log in.</p>
                    </Section>

                    <Section title="9. Children's Privacy">
                        <p>Sharpen.ai is not directed at children under the age of 16. We do not knowingly collect personal data from children. If you believe a child has provided us data, contact us immediately at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
                    </Section>

                    <Section title="10. Changes to This Policy">
                        <p>We may update this Privacy Policy periodically. We will notify you of material changes via email or a prominent notice on the platform. Continued use of the Service after changes constitutes acceptance.</p>
                    </Section>

                    <Section title="11. Contact">
                        <p>For privacy-related inquiries or data requests: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
                    </Section>

                </div>

                {/* Footer links */}
                <div className="mt-20 pt-10 border-t border-gray-100 dark:border-white/5 flex gap-8">
                    <Link href="/terms" className="text-[10px] font-bold text-gray-400 hover:text-brand-purple transition-colors uppercase tracking-widest">Terms of Service</Link>
                    <Link href="/login" className="text-[10px] font-bold text-gray-400 hover:text-brand-purple transition-colors uppercase tracking-widest">Back to App</Link>
                </div>

            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-[#0F172A]/40 border border-gray-100 dark:border-white/5 rounded-[2rem] p-10">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 tracking-tight">{title}</h2>
            <div className="space-y-4 text-gray-500 dark:text-gray-400 text-[15px] leading-relaxed font-medium [&_a]:text-brand-purple [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2">
                {children}
            </div>
        </div>
    );
}

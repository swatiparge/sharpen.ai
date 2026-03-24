import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
    title: 'sharpen.ai — Career Performance Analytics',
    description: 'AI-powered interview performance analytics platform. Track. Improve. Measure.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning className="overflow-y-scroll">
            <body className="font-sans antialiased text-gray-900 dark:text-gray-100 bg-white dark:bg-[#0A0E14] selection:bg-brand-purple/10 transition-colors duration-300">
                <ThemeProvider>
                    <AuthProvider>{children}</AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

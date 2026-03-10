import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/lib/auth';

export const metadata: Metadata = {
    title: 'swadhyaya.ai — Career Performance Analytics',
    description: 'AI-powered interview performance analytics platform. Track. Improve. Measure.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="font-sans antialiased bg-gray-50 text-gray-900">
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}

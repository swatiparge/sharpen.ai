'use client';

import Link from 'next/link';

interface SharpenLogoProps {
    className?: string;
    showText?: boolean;
}

export default function SharpenLogo({ className = '', showText = true }: SharpenLogoProps) {
    return (
        <div className={`flex items-center gap-2 group cursor-pointer ${className}`}>
            <div className="w-8 h-8 bg-brand-purple rounded-lg flex items-center justify-center shadow-lg group-hover:rotate-3 transition-transform overflow-hidden font-mono">
                <span className="text-white text-base translate-y-[0px] font-bold tracking-tight">S/</span>
            </div>
            {showText && (
                <div className="flex items-center font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                    <span>Sharpen</span>
                    <span className="text-brand-purple">.ai</span>
                </div>
            )}
        </div>
    );
}

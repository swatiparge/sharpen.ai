/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'Outfit', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
                serif: ['Instrument Serif', 'Libre Baskerville', 'serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                midnight: {
                    50: '#f4f5f7',
                    100: '#e9ebef',
                    200: '#c8cfd9',
                    300: '#a7b3c3',
                    400: '#657ba1',
                    500: '#23437e',
                    600: '#1f3c71',
                    700: '#1a325e',
                    800: '#15284b',
                    900: '#0A0E14', 
                    950: '#06090d',
                },
                accent: {
                    cyan: '#7FFFD4',
                    purple: '#A855F7',
                },
                brand: {
                    purple: '#6D28D9', // Deep Purple from image 911
                    "purple-light": '#8B5CF6',
                    "purple-soft": '#F5F3FF',
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'midnight-gradient': 'linear-gradient(to bottom, #0F172A, #0A0E14)',
            },
            boxShadow: {
                'glow-cyan': '0 0 20px -5px rgba(127, 255, 212, 0.3)',
                'glow-purple': '0 0 20px -5px rgba(168, 85, 247, 0.3)',
                'soft': '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
            }
        },
    },
    plugins: [],
};

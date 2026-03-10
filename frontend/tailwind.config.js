/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#e8ecff',
                    100: '#c5ccff',
                    500: '#4f6ef7',
                    600: '#3b5ce4',
                    700: '#1a1f36',
                    800: '#151929',
                    900: '#0f1220',
                },
            },
        },
    },
    plugins: [],
};

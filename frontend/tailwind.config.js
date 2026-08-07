/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B1220',
        panel: '#121A2B',
        panel2: '#1A2540',
        line: '#28324A',
        india: '#F0A868',
        singapore: '#4FD1C5',
        germany: '#E3B23C',
        accent: '#6C8EF5',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};

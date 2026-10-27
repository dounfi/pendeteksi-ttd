/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mat: '#2B58B5',
        'label-blue': '#1F4FBF',
        ink: '#14213D',
        paper: '#F7F2E6',
        'paper-white': '#FFFEFA',
        manila: '#E2C07C',
        'sticky-yellow': '#FFE27A',
        'sticky-pink': '#F7B5CB',
        'sticky-blue': '#BFE3F5',
        verdict: {
          asli: '#1F7A4F',
          'belum-pasti': '#E0A21B',
          palsu: '#B93A2E',
        }
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        caveat: ['"Caveat"', 'cursive'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'paper-contact': '0 4px 10px rgba(20, 33, 61, 0.16)',
        'paper-deep': '0 10px 24px rgba(20, 33, 61, 0.22)',
        'btn-shadow': '0 4px 0 #123785',
        'btn-active': '0 1px 0 #123785',
      }
    },
  },
  plugins: [],
}

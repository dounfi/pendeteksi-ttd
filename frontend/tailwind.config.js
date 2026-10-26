/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#FDFBF7',
          dark: '#F3ECE3',
          card: '#FFFDF9',
        },
        ink: {
          DEFAULT: '#2B2118',
          muted: '#68594D',
          light: '#9E8E81',
          border: '#2B2118',
        },
        bata: {
          DEFAULT: '#C84B31',
          dark: '#A73822',
          light: '#F8E8E5',
        },
        mustard: {
          DEFAULT: '#E9B44C',
          dark: '#CF9B34',
          light: '#FCF5E8',
        },
        daun: {
          DEFAULT: '#2D6A4F',
          dark: '#21513C',
          light: '#E6EFE9',
        },
        kobalt: {
          DEFAULT: '#1D3557',
          dark: '#14253E',
          light: '#E6ECF3',
        },
        washi: {
          yellow: 'rgba(233, 180, 76, 0.45)',
          red: 'rgba(200, 75, 49, 0.35)',
          blue: 'rgba(29, 53, 87, 0.35)',
          green: 'rgba(45, 106, 79, 0.35)',
        }
      },
      fontFamily: {
        bricolage: ['"Bricolage Grotesque"', 'sans-serif'],
        instrument: ['"Instrument Sans"', 'sans-serif'],
        caveat: ['"Caveat"', 'cursive'],
      },
      boxShadow: {
        'scrapbook-sm': '2px 2px 0px #2B2118',
        'scrapbook': '4px 4px 0px #2B2118',
        'scrapbook-lg': '7px 7px 0px #2B2118',
        'scrapbook-xl': '10px 10px 0px #2B2118',
      }
    },
  },
  plugins: [],
}

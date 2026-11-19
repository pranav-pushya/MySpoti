/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          base: '#121212',
          highlight: '#1a1a1a',
          press: '#000000',
          elevated: '#242424',
          card: '#181818',
          cardHover: '#282828',
          green: '#1db954',
          greenHover: '#1ed760',
          muted: '#a7a7a7',
          subtext: '#b3b3b3'
        }
      },
      screens: {
        'xs': '400px',
        // standard sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
        '3xl': '1920px'
      }
    },
  },
  plugins: [],
};

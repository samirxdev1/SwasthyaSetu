/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          deep: '#0F6E5C',
          DEFAULT: '#0F6E5C',
        },
        sage: {
          soft: '#E7F3EF',
          DEFAULT: '#E7F3EF',
        },
        slate: {
          ink: '#1C2B2A',
        },
        fog: {
          warm: '#F7F6F3',
          DEFAULT: '#F7F6F3',
        },
        clay: {
          muted: '#C9754A',
          DEFAULT: '#C9754A',
        },
        blue: {
          signal: '#3B7A9E',
        },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}


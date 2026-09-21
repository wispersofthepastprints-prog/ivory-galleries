import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#F8F6F0',
        obsidian: '#0A0A0A',
        gold: '#D4AF37',
        charcoal: '#1a1a1a',
        graphite: '#222',
        stone: '#333',
        fog: '#888',
        cream: '#FAF9F6',
        'warm-white': '#F5F3EE',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config

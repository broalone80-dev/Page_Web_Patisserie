/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        crimson: {
          DEFAULT: '#8B1A2B',
          50: '#FDF2F4',
          100: '#FCE7EA',
          200: '#F9CED5',
          300: '#F4A3B2',
          400: '#ED6F87',
          500: '#E14362',
          600: '#C0392B',
          700: '#8B1A2B',
          800: '#6D1420',
          900: '#5C1320',
          950: '#33060D',
          dark: '#6D1420',
          light: '#A82040',
        },
        stone: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
        orange: {
          DEFAULT: '#D4883A',
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          light: '#E8A85C',
        },
        cream: '#FFF8F0',
        dark: '#1A1A1A',
        'gray-section': '#F5F5F5',
        'newsletter-red': '#C0392B',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      borderRadius: {
        'card': '12px',
        'btn': '24px',
        'full': '9999px',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'header': '0 2px 10px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.5s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E03131',
          'red-dark': '#C92A2A',
          'red-light': '#FFF5F5',
          black: '#141414',
          'gray-900': '#1A1A1A',
          'gray-800': '#2C2C2C',
          'gray-700': '#3D3D3D',
          'gray-600': '#555555',
          'gray-500': '#6B6B6B',
          'gray-400': '#909090',
          'gray-300': '#B8B8B8',
          'gray-200': '#D9D9D9',
          'gray-100': '#EFEFEF',
          'gray-50': '#F7F7F5',
          offwhite: '#F5F5F0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 2px 8px 0 rgba(0,0,0,0.06)',
        card: '0 4px 16px 0 rgba(0,0,0,0.08)',
        nav: '0 -1px 0 0 rgba(0,0,0,0.06)',
      },
      screens: {
        xs: '390px',
      },
    },
  },
  plugins: [],
}

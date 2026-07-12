/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#07111f',
          900: '#0c1728',
          800: '#17263b'
        },
        ember: '#ff6b35',
        aurora: '#47d7ac',
        gold: '#f5b700'
      },
      boxShadow: {
        glow: '0 20px 80px rgba(71, 215, 172, 0.16)'
      },
      backgroundImage: {
        'mesh': 'radial-gradient(circle at top left, rgba(71,215,172,0.24), transparent 32%), radial-gradient(circle at top right, rgba(255,107,53,0.18), transparent 28%), linear-gradient(180deg, #09111d 0%, #0b1524 54%, #07111f 100%)'
      }
    }
  },
  plugins: []
};

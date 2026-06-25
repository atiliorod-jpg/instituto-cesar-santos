/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ics: {
          preto: '#232323',
          branco: '#FFFFFF',
          dourado: '#C9A24B',
          cinza: '#6E6E6E',
          bege: '#F2EFE9',
        }
      },
      fontFamily: {
        title: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

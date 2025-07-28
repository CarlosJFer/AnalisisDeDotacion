/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Paleta pastel basada en el logo de la Municipalidad de Corrientes
        municipal: {
          // Verde pastel (principal)
          green: {
            50: '#f0f9f0',
            100: '#dcf2dc',
            200: '#a5d6a7',
            300: '#81c784',
            400: '#66bb6a',
            500: '#4caf50',
            600: '#43a047'
          },
          // Azul pastel (secundario)
          blue: {
            50: '#e3f2fd',
            100: '#bbdefb',
            200: '#81d4fa',
            300: '#4fc3f7',
            400: '#29b6f6',
            500: '#03a9f4',
            600: '#039be5'
          },
          // Violeta pastel (acento)
          purple: {
            50: '#f3e5f5',
            100: '#e1bee7',
            200: '#ce93d8',
            300: '#ba68c8',
            400: '#ab47bc',
            500: '#9c27b0',
            600: '#8e24aa'
          },
          // Fucsia pastel (destacado)
          pink: {
            50: '#fce4ec',
            100: '#f8bbd9',
            200: '#f48fb1',
            300: '#f06292',
            400: '#ec407a',
            500: '#e91e63',
            600: '#d81b60'
          },
          // Grises suaves para fondos
          gray: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#eeeeee',
            300: '#e0e0e0',
            400: '#bdbdbd',
            500: '#9e9e9e',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121'
          }
        }
      },
      fontFamily: {
        'municipal': ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'municipal': '0 4px 6px -1px rgba(76, 175, 80, 0.1), 0 2px 4px -1px rgba(76, 175, 80, 0.06)',
        'municipal-lg': '0 10px 15px -3px rgba(76, 175, 80, 0.1), 0 4px 6px -2px rgba(76, 175, 80, 0.05)'
      }
    },
  },
  plugins: [],
};

/**
 * tailwind.config.js — paleta y tipografías de la marca.
 * Para cambiar los colores de un cliente, edite SOLO este archivo
 * (y las variables equivalentes en css/01-base.css) y ejecute "npm run css".
 */
module.exports = {
  content: ['./*.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        // Verde petróleo: color principal
        marca: {
          50: '#effaf8',
          100: '#d4f1ec',
          200: '#a9e2d9',
          300: '#74cabe',
          400: '#43aea1',
          500: '#2a9286',
          600: '#1f746c',
          700: '#1c5d58',
          800: '#1a4a47',
          900: '#173e3c',
          950: '#082423'
        },
        // Ámbar suave: acento para llamadas a la acción secundarias
        acento: {
          100: '#fbefd0',
          300: '#f0cd7a',
          500: '#d9a441',
          600: '#bd8528'
        },
        // Neutros cálidos
        arena: {
          50: '#faf8f5',
          100: '#f3efe8',
          200: '#e7e0d3'
        },
        tinta: {
          500: '#5b6866',
          700: '#2c3a38',
          900: '#14201f'
        }
      },
      fontFamily: {
        titulo: ['Fraunces', 'Georgia', 'serif'],
        texto: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};

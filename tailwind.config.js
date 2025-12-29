module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        // Строительная тематика: оранжевый, синий, серый
        construction: {
          orange: '#FF8C42',
          'orange-dark': '#E67E22',
          'orange-light': '#FFB366',
          blue: '#4A90E2',
          'blue-dark': '#357ABD',
          'blue-light': '#6BA3E8',
          gray: '#5D6D7E',
          'gray-dark': '#34495E',
          'gray-light': '#85929E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    }
  },
  plugins: [],
}


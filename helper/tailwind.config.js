module.exports = {
  mode: 'jit',
  purge: [
    './src/renderer/index.html',
    './src/renderer/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      transitionProperty: {
        'width': 'width',
      }
    }
  },
  variants: {},
  plugins: []
}

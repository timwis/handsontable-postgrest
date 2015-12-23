/* global __dirname */
module.exports = {
  entry: './src/main.js',
  output: {
    path: __dirname + '/dist',
    filename: 'main.js'
  },
  externals: {
    handsontable: 'Handsontable'
  }
}

/* global __dirname */
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/main.js',
  output: {
    path: __dirname + '/dist',
    publicPath: '/dist/',
    filename: 'main.js'
  },
  plugins: [new HtmlWebpackPlugin({
    template: './src/index.html'
  })],
  externals: {
    handsontable: 'Handsontable'
  }
}

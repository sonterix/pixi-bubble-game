const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  mode: 'development',
  entry: path.join(__dirname, 'src', 'index.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bubble-game.min.[hash:8].js'
  },
  devtool: 'inline-source-map',
  devServer: {
    port: 3000,
    open: true
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      file: path.join(__dirname, 'dist', 'index.html'),
      template: path.join(__dirname, 'public', 'index.html')
    }),
    new MiniCssExtractPlugin()
  ]
}

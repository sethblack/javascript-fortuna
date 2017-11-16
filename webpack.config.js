var path = require('path');
var webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './lib/fortuna.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'fortuna.min.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['env']
        }
      }
    ]
  },
  stats: {
    colors: true
  },
  devtool: 'source-map',
  plugins: [
    new UglifyJsPlugin({
      parallel: true
    })
  ]
};
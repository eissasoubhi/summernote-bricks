const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'src'),

  output: {
    filename: 'summernote-extensions.min.js',
    publicPath: 'dist/',
  },

  resolve: {
    alias: {
        Bricks: path.resolve(__dirname, 'src/Bricks/'),
        Utils: path.resolve(__dirname, 'src/Utils/')
    }
  },

  module: {
    rules: [{ test: /\.js?$/, loader: 'babel-loader', exclude: /node_modules/ }],
  },

  devtool: 'source-map'
};
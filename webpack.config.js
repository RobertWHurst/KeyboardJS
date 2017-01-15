var webpack = require('webpack');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var path = require('path');
var env = require('yargs').argv.mode;

var plugins = [], outputFile;

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({ minimize: true }));
  outputFile = 'keyboard.min.js';
} else {
  outputFile = 'keyboard.js';
}

var config = {
  entry: path.join(__dirname, 'index.js'),
  devtool: 'source-map',
  output: {
    path: path.join(__dirname,  'dist'),
    filename: outputFile,
    library: 'keyboardJS',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  resolve: {
    extensions: ['', '.js']
  },
  plugins: plugins
};

module.exports = config;
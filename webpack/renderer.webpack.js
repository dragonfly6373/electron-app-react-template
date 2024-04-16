const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const assets = [ 'images', 'css', 'fonts' ]; // asset directories

module.exports = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: require('./rules.webpack'),
  },
  plugins: assets.map(asset => {
    return new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../assets', asset),
          to: path.resolve(__dirname, '../.webpack/renderer/assets', asset)
        }
      ]
    });
  })
}
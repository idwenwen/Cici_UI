const path = require('path')
const webpack = require('webpack')
const { CheckerPlugin } = require('awesome-typescript-loader')

module.exports = {
  entry: {
    app: './main.ts'
  },
  output: {
    filename: '[name]_[hash:6].js'
  },
  resolve: {
    entensions: [".ts", '.tsx','.js', 'json']
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "awesome-typescript-loader"
      },
      {
        enforce: "pre",
        test: /\.js$/,
        exclude: [/node_modules/, /config/],
        use: [
          "source-map-loader",
          {
            loader: "babel-loader",
            options: {
              presets: ['@babel/preset-env']
            }
          },
          {
            loader: 'eslint-loader',
            options: {
              emitWarning: true
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', {
          loader: 'css-loader',
          options: {
            minimize: true, // 启用压缩。
            sourceMap: true // 启用sourceMap设置
          }
        } ]
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[path][name].[ext]'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CheckerPlugin(),
    new webpack.DefinePlugin({
      'enviroment': require('./webpack.global')
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
}

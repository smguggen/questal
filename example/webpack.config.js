const Html = require("html-webpack-plugin");
const Css = require("mini-css-extract-plugin");
const path = require('path');

module.exports = {
  mode:"development",
  entry:"./src/index.js",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: './index.js'
  },
  resolve: {
        modules: ['node_modules']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
              loader: Css.loader,
          },
          'css-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'sass-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader']
      }
    ]
  },
  plugins: [
    new Html({
      template: "./index.html",
      filename: "./index.html"
    }),
    new Css(
        {
            filename:'css/[name].css'
        }
    ),

  ]
}

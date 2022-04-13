// NOTE: To use this example standalone (e.g. outside of deck.gl repo)
// delete the local development overrides at the bottom of this file

var webpack = require('webpack');
const path = require('path');


const CONFIG = {
    mode: 'development',
  
    entry: {
      app: './app.js'
    },
  
    output: {
      library: 'App'
    },
  
    module: {
      rules: [
        {
          // Transpile ES6 to ES5 with babel
          // Remove if your app does not use JSX or you don't need to support old browsers
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: [/node_modules/],
          options: {
            presets: ['@babel/preset-react']
          } 
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(gif|png|jpe?g|svg)$/i,
          use: [
            'file-loader',
            {
              loader: 'image-webpack-loader',
              options: {
                mozjpeg: {
                  progressive: true,
                  quality: 65
                },
                pngquant: {
                  quality: '65-90',
                  speed: 4
                },
                gifsicle: {
                  interlaced: false
                },
                webp: {
                  quality: 75
                }
              }
            }
          ]
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx', '.scss', '.gif', '.png', '.jpg', '.jpeg', '.svg']
    }
  };
  
// This line enables bundling against src in this repo rather than installed module
module.exports = env => (env ? require('../../webpack.config.local')(CONFIG)(env) : CONFIG);
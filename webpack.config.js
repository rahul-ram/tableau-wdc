const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      clean: true,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx']
    },
    plugins: [
      new HtmlWebpackPlugin({ 
        template: './public/index.html',
        filename: 'index.html'
      }),
      new Dotenv({
        path: `.env.${argv.mode || 'development'}`
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'public/manifest.json', to: 'manifest.json' },
          { from: 'public/icon.png', to: 'icon.png', noErrorOnMissing: true }
        ]
      })
    ],
    module: {
      rules: [
        { 
          test: /\.tsx?$/, 
          use: 'ts-loader', 
          exclude: /node_modules/ 
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    devServer: {
      static: './dist',
      port: 3000,
      hot: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
      }
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        name: false,
      },
    }
  };
};

const path = require( 'path' );
const CopyPlugin = require( 'copy-webpack-plugin' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );

module.exports = {
  mode: 'development',
  entry: {
    popup: './src/index.tsx',
    background: './src/background.ts',
    content: './src/content.ts',
    popupMissingApi: './src/popupMissingApi.tsx',
    processPanel_Index: './src/processPanel_index.tsx'
  },
  output: {
    filename: '[name].js',
    path: path.resolve( __dirname, 'dist' )
  },
  devtool: 'cheap-source-map', // Use a CSP-compliant source map
  optimization: {
    minimize: false // Disable minimization to avoid potential CSP issues
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', 'jsx', '.mjs']
  },
  plugins: [
    new CopyPlugin( {
      patterns: [
        { from: 'src/images', to: 'images' },
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'src/popupMissingApi.html', to: 'popupMissingApi.html' },
        { from: 'src/processPanel_Index.html', to: 'processPanel_Index.html' },
        { from: 'src/style/iframeStyle.css', to: 'iframeStyle.css' }
      ],
    } ),
    new HtmlWebpackPlugin( {
      template: './src/popup.html',
      filename: 'popup.html',
      chunks: ['popup']
    } )
  ]
};
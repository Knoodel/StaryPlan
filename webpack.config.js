const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.ts', // Your main TypeScript entry file
  output: {
    filename: 'bundle.js', // Output file name
    path: path.resolve(__dirname, 'dist') // Output directory
  },
  resolve: {
    extensions: ['.ts', '.js'] // Resolve TypeScript and JavaScript files
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader' // Use ts-loader to transpile TypeScript files
      }
    ]
  }
};
const path = require('path')
const webpack = require("webpack");


module.exports = {
    mode: 'development', 
    entry: ['./src/index.js', './src/auth.js'], 
    context: __dirname,
    target: "web",
    resolve: {
        extensions: [".js", ".jsx"],
      },
    output: {
        path: path.resolve(__dirname, 'dist'), 
        filename: 'bundle.js', 
        sourceMapFilename: "bundle.js.map"
    },
    devtool: "source-map", 
    watch: true,
    plugins: [
        new webpack.DefinePlugin({
          "process.env.NODE_ENV": JSON.stringify("development"),
          "process.env.BABEL_ENV": JSON.stringify("development"),
        }),
      ],
}
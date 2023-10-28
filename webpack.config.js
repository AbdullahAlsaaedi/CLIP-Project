const path = require('path')

module.exports = {
    mode: 'development', 
    entry: ['./src/index.js', './src/auth.js'], 
    output: {
        path: path.resolve(__dirname, 'dist'), 
        filename: 'bundle.js', 
        sourceMapFilename: "bundle.js.map"
    },
    devtool: "source-map", 
    watch: true
}
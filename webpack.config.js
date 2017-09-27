module.exports = {
    entry: __dirname + '/client/index.js',
    output: {
        path: __dirname + '/public/js',
        filename: "bundle.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: ['react', 'es2015']
                  }
                }
            }
        ]
    }
};
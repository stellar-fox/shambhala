"use strict"




// ...
const
    fs = require("fs"),
    path = require("path"),
    webpack = require("webpack"),
    MinifyPlugin = require("babel-minify-webpack-plugin"),
    appDirectory = fs.realpathSync(process.cwd())




// ...
module.exports = {

    mode: "production",


    target: "web",


    entry: {
        "shambhala.client": path.resolve(
            appDirectory, "src/lib/shambhala.client.js"
        ),
    },


    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "../dist.lib"),
        library: "shambhalaClient",
        libraryTarget: "umd",
        globalObject: "self",
    },


    externals: ["@xcmats/js-toolbox"],


    optimization: {
        minimize: true,
        mergeDuplicateChunks: true,
        sideEffects: true,
        providedExports: true,
        concatenateModules: true,
        occurrenceOrder: true,
        removeEmptyChunks: true,
        removeAvailableModules: true,
        minimizer: [
            new MinifyPlugin({}, {
                comments: false,
            }),
        ],
    },


    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ["babel-loader"],
                sideEffects: false,
            },
        ],
    },


    plugins: [

        new webpack.DefinePlugin({
            "process.env.BABEL_ENV": JSON.stringify("production"),
        }),

    ],

}

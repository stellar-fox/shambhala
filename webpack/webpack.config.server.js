"use strict"




// ...
const
    fs = require("fs"),
    path = require("path"),
    webpack = require("webpack"),
    MinifyPlugin = require("babel-minify-webpack-plugin"),
    appDirectory = fs.realpathSync(process.cwd()),
    nodeExternals = require("webpack-node-externals")




// ...
module.exports = {

    mode: "production",


    target: "node",


    externals: [nodeExternals()],


    entry: {
        "server": path.resolve(
            appDirectory, "src/server/index.js"
        ),
    },


    output: {
        filename: "[name].bundle.js",
        chunkFilename: "[name].chunk.js",
        path: path.resolve(__dirname, "../dist.server"),
        libraryTarget: "commonjs",
        globalObject: "this",
    },


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
            {
                test: /\.sql$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[hash].[ext]",
                        },
                    },
                ],
            },
        ],
    },


    node: {
        __dirname: false,
        __filename: false,
    },


    plugins: [
        new webpack.DefinePlugin({
            "process.env.BABEL_ENV": JSON.stringify("production"),
        }),
    ],

}

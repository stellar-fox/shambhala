"use strict"




// ...
const
    fs = require("fs"),
    path = require("path"),
    webpack = require("webpack"),
    UglifyJsPlugin = require("uglifyjs-webpack-plugin"),
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
        sourceMapFilename: "[name].map",
        path: path.resolve(__dirname, "dist.server"),
        globalObject: "self",
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


    devtool: "source-map",


    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    output: { comments: false },
                },
            }),
        ],
    },


    plugins: [
        new webpack.DefinePlugin({
            "process.env.BABEL_ENV": JSON.stringify("commonjs"),
        }),
    ],

}

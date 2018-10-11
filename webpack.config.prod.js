"use strict"




// ...
const
    fs = require("fs"),
    path = require("path"),
    webpack = require("webpack"),
    HtmlWebpackPlugin = require("html-webpack-plugin"),
    appDirectory = fs.realpathSync(process.cwd()),
    publicDirectory = "public/",
    publicPath = JSON.parse(
        fs.readFileSync("./package.json", "utf-8")
    ).publicPath




// ...
module.exports = {

    mode: "production",


    entry: {
        "static/host": path.resolve(
            appDirectory, "src/host/index.js"
        ),
        "static/client": path.resolve(
            appDirectory, "src/client/index.js"
        ),
        "shambhala.sw": path.resolve(
            appDirectory, "src/client/index.sw.js"
        ),
    },


    output: {
        filename: "[name].[hash].bundle.js",
        chunkFilename: "[name].[hash].chunk.js",
        sourceMapFilename: "[name].[hash].map",
        path: path.resolve(__dirname, "dist"),
        publicPath,
        globalObject: "self",
    },


    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ["babel-loader"],
            },
        ],
    },


    devtool: "source-map",


    plugins: [

        new webpack.DefinePlugin({
            "process.env.BABEL_ENV": JSON.stringify("production"),
        }),

        new webpack.HotModuleReplacementPlugin(),

        new HtmlWebpackPlugin({
            chunks: ["static/host"],
            filename: "index.html",
            inject: true,
            hash: true,
            realPublicPath: path.join(publicPath, publicDirectory),
            title: "Shambhala - host",
            template: path.resolve(
                appDirectory, "./src/host/index.html"
            ),
        }),

        new HtmlWebpackPlugin({
            chunks: ["static/client"],
            filename: "shambhala.html",
            inject: true,
            hash: true,
            realPublicPath: path.join(publicPath, publicDirectory),
            title: "Shambhala",
            template: path.resolve(
                appDirectory, "./src/client/index.html"
            ),
        }),

    ],

}

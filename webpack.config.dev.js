"use strict"


// ...
const
    webpack = require("webpack"),
    HtmlWebpackPlugin = require("html-webpack-plugin"),
    path = require("path"),
    fs = require("fs"),
    appDirectory = fs.realpathSync(process.cwd()),
    publicPath = "/"


// ...
module.exports = {

    mode: "development",

    entry: {
        "static/main":
            path.resolve(appDirectory, "src/index.js"),
        "static/shambhala.main":
            path.resolve(appDirectory, "src/index.shambhala.js"),
        "shambhala.sw":
            path.resolve(appDirectory, "src/index.sw.js"),
    },

    output: {
        filename: "[name].[hash].bundle.js",
        chunkFilename: "[name].[hash].chunk.js",
        sourceMapFilename: "[name].[hash].map",
        publicPath,
        globalObject: "self",
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader",],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ["babel-loader",],
            },
        ],
    },

    devServer: {
        compress: true,
        contentBase: "public/",
        disableHostCheck: true,
        host: "0.0.0.0",
        hot: true,
        https: false,
        index: "index.html",
        inline: true,
        open: false,
        overlay: true,
        port: 8080,
        public: "localhost:8080",
        publicPath,
        useLocalIp: true,
        watchContentBase: true,
    },

    devtool: "source-map",

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            chunks: ["static/main",],
            filename: "index.html",
            inject: true,
            hash: true,
            title: "Shambhala - playground",
            template: path.resolve(
                appDirectory, "./public/index.html"
            ),
        }),
        new HtmlWebpackPlugin({
            chunks: ["static/shambhala.main",],
            filename: "shambhala.html",
            inject: true,
            hash: true,
            title: "Shambhala",
            template: path.resolve(
                appDirectory, "./public/index.shambhala.html"
            ),
        }),
    ],

}

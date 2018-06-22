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
        main: [
            require.resolve("webpack/hot/dev-server"),
            path.resolve(appDirectory, "src/index.js"),
        ],
        sw: [
            path.resolve(appDirectory, "src/index.sw.js"),
        ],
    },

    output: {
        filename: "static/[name].bundle.js",
        chunkFilename: "static/[name].chunk.js",
        publicPath,
        globalObject: "self",
    },

    devServer: {
        compress: true,
        contentBase: "public/",
        disableHostCheck: true,
        host: "0.0.0.0",
        hot: true,
        https: true,
        index: "index.html",
        inline: true,
        open: true,
        overlay: true,
        port: 8080,
        public: "localhost:8080",
        publicPath,
        useLocalIp: true,
        watchContentBase: true,
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            chunks: ["main",],
            filename: "index.html",
            inject: true,
            hash: true,
            template: path.resolve(appDirectory, "public/index.html"),
        }),
    ],

}

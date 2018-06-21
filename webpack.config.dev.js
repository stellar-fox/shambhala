"use strict"

// ...
const
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
    },

    devServer: {
        compress: true,
        contentBase: "public/",
        disableHostCheck: true,
        host: "0.0.0.0",
        https: true,
        index: "index.html",
        open: true,
        overlay: true,
        port: 8080,
        public: "localhost:8080",
        publicPath,
        useLocalIp: true,
        watchContentBase: true,
    },

    plugins: [
        new HtmlWebpackPlugin({
            chunks: ["main",],
            filename: "index.html",
            inject: true,
            hash: true,
            template: path.resolve(appDirectory, "public/index.html"),
        }),
    ],

}

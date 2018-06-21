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
    },

    output: {
        filename: "static/js/[name].bundle.js",
        chunkFilename: "static/js/[name].chunk.js",
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
            inject: true,
            template: path.resolve(appDirectory, "public/index.html"),
        }),
    ],

}

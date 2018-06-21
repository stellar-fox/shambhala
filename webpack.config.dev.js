"use strict"

// ...
const
    HtmlWebpackPlugin = require("html-webpack-plugin"),
    path = require("path"),
    fs = require("fs")


// ...
const
    appDirectory = fs.realpathSync(process.cwd()),
    publicPath = "/"


// ...
module.exports = {

    mode: "development",

    entry: [
        require.resolve("webpack/hot/dev-server"),
        path.resolve(appDirectory, "src/index.js"),
    ],

    output: {
        filename: "static/js/bundle.js",
        chunkFilename: "static/js/[name].chunk.js",
        publicPath,
    },

    devServer: {
        compress: true,
        contentBase: "public/",
        disableHostCheck: true,
        host: "0.0.0.0",
        https: true,
        overlay: true,
        publicPath,
        watchContentBase: true,
    },

    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(appDirectory, "public/index.html"),
        }),
    ],

}

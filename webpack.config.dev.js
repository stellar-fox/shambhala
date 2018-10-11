"use strict"




// ...
const
    fs = require("fs"),
    path = require("path"),
    express = require("express"),
    chalk = require("chalk"),
    webpack = require("webpack"),
    HtmlWebpackPlugin = require("html-webpack-plugin"),
    appDirectory = fs.realpathSync(process.cwd()),
    publicDirectory = "public/",
    publicPath = JSON.parse(
        fs.readFileSync("./package.json", "utf-8")
    ).publicPath




// ...
module.exports = {

    mode: "development",


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


    devServer: {
        before: function (app) {
            // static-files server
            app.use(
                path.join(publicPath, publicDirectory),
                express.static(path.join(appDirectory, publicDirectory))
            )

            // info
            // eslint-disable-next-line no-console
            console.log(
                chalk.gray(" [info]") + ":",
                "Static output is served from",
                chalk.bold.blue(publicDirectory),
                "as",
                chalk.bold.blue(path.join(publicPath, publicDirectory))
            )

            // simple logger
            // app.use(function (req, _res, next) {
            //     console.log(req.method, req.url)
            //     next()
            // })
        },
        compress: true,
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

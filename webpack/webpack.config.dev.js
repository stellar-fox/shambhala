"use strict"




// ...
const
    fs = require("fs"),
    path = require("path"),
    express = require("express"),
    chalk = require("chalk"),
    // webpack = require("webpack"),
    HtmlWebpackPlugin = require("html-webpack-plugin"),
    appDirectory = fs.realpathSync(process.cwd()),
    publicDirectory = "public/",
    publicPath = JSON.parse(
        fs.readFileSync("package.json", "utf-8")
    ).publicPath




// ...
module.exports = {

    mode: "development",


    target: "web",


    entry: {
        "static/host": path.resolve(
            appDirectory, "src/host/index.js"
        ),
        "static/client": path.resolve(
            appDirectory, "src/client/index.js"
        ),
    },


    output: {
        filename: "[name].bundle.js",
        chunkFilename: "[name].chunk.js",
        sourceMapFilename: "[name].map",
        publicPath,
        globalObject: "self",
    },


    resolve: {
        extensions: [".js", ".jsx", ".json"],
    },


    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                enforce: "pre",
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "eslint-loader",
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "babel-loader",
            },
        ],
    },


    devServer: {
        before: function (app) {
            // CORS (just for the development)
            app.use((_req, res, next) => {
                res.header("Access-Control-Allow-Origin", "*")
                res.header(
                    "Access-Control-Allow-Headers",
                    "Origin, X-Requested-With, Content-Type, Accept"
                )
                next()
            })

            // static-files server
            app.use(
                path.join(publicPath, publicDirectory),
                express.static(path.join(appDirectory, publicDirectory))
            )

            // redirect when accessing "/" but publicPath is different
            app.get("/", (_req, res, next) => {
                if (publicPath !== "/") {
                    res.redirect(publicPath)
                } else {
                    next()
                }
            })

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
            app.use((req, _res, next) => {
                // eslint-disable-next-line no-console
                console.log(chalk.gray(req.method), req.url)
                next()
            })
        },
        compress: true,
        disableHostCheck: true,
        host: "0.0.0.0",
        hot: false,  // HMR
        https: false,
        index: "index.html",
        inline: true,
        open: false,
        overlay: true,
        port: 8080,
        public: "https://localhost",
        publicPath,
        useLocalIp: true,
        watchContentBase: true,
    },


    devtool: "source-map",


    plugins: [

        // new webpack.HotModuleReplacementPlugin(),

        new HtmlWebpackPlugin({
            chunks: ["static/host"],
            filename: "index.html",
            inject: true,
            hash: true,
            realPublicPath: path.join(publicPath, publicDirectory),
            title: "Shambhala - host",
            template: path.resolve(
                appDirectory, "src/host/index.html"
            ),
        }),

        new HtmlWebpackPlugin({
            chunks: ["static/client"],
            filename: "shambhala.html",
            inject: true,
            hash: true,
            realPublicPath: path.join(publicPath, publicDirectory),
            title: "Shambhala - client",
            template: path.resolve(
                appDirectory, "src/client/ui/index.html"
            ),
        }),

    ],

}

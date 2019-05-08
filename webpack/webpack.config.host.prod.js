"use strict"




// ...
const
    fs = require("fs"),
    path = require("path"),
    webpack = require("webpack"),
    MinifyPlugin = require("babel-minify-webpack-plugin"),
    HtmlWebpackPlugin = require("html-webpack-plugin"),
    CopyWebpackPlugin = require("copy-webpack-plugin"),
    appDirectory = fs.realpathSync(process.cwd()),
    publicDirectory = "public/",
    publicPath = JSON.parse(
        fs.readFileSync("package.json", "utf-8")
    ).publicPath




// ...
module.exports = {

    mode: "production",


    target: "web",


    node: {
        fs: "empty",
    },


    entry: {
        "host": path.resolve(
            appDirectory, "src/host/index.js"
        ),
    },


    output: {
        filename: "[name].bundle.js",
        chunkFilename: "static/[name].c.js",
        sourceMapFilename: "[name].map",
        path: path.resolve(__dirname, "../dist.host/shambhala"),
        publicPath,
        globalObject: "self",
    },


    optimization: {
        concatenateModules: true,
        minimize: true,
        mergeDuplicateChunks: true,
        occurrenceOrder: true,
        providedExports: true,
        removeAvailableModules: true,
        removeEmptyChunks: true,
        sideEffects: true,
        splitChunks: {
            automaticNameDelimiter: ".",
            chunks: "all",
            maxAsyncRequests: 8,
            maxInitialRequests: 2,
            minChunks: 1,
            minSize: 32768,
            maxSize: 262140,
            name: true,
            cacheGroups: {
                vendors: false,
                d: {
                    minChunks: 2,
                    priority: 0,
                    reuseExistingChunk: true,
                },
            },
        },
        minimizer: [
            new MinifyPlugin({}, {
                comments: false,
            }),
        ],
    },


    resolve: {
        extensions: [".js", ".jsx", ".json"],
    },


    module: {
        rules: [
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
                sideEffects: false,
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader",
                ],
            },
            {
                exclude: [/\.jsx?$/, /\.css$/, /\.html$/, /\.json$/],
                loader: "file-loader",
                options: {
                    name: "static/media/[name].[hash:8].[ext]",
                },
            },
        ],
    },


    plugins: [

        new webpack.DefinePlugin({
            "process.env.BABEL_ENV": JSON.stringify("production"),
        }),

        new HtmlWebpackPlugin({
            filename: "index.html",
            inject: true,
            hash: true,
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true,
            },
            realPublicPath: path.join(publicPath, publicDirectory),
            title: "Shambhala - host",
            template: path.resolve(
                appDirectory, "src/host/index.html"
            ),
        }),

        new CopyWebpackPlugin(
            [{ from: "public", to: "public" }]
        ),

    ],

}

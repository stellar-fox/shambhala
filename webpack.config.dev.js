"use strict"

// ...
const webpack = require("webpack")

// ...
module.exports = {

    mode: "development",

    plugins: [
        new webpack.LoaderOptionsPlugin({
            options: {
                compress: true,
                contentBase: "public/",
                hot: true,
                overlay: true,
                watchContentBase: true,
            },
        }),
    ],

}

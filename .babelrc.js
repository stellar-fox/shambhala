// used babel-plugins array
var plugins = [
    "@babel/plugin-proposal-object-rest-spread",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-transform-arrow-functions",
    "@babel/plugin-transform-block-scoped-functions",
    "@babel/plugin-transform-block-scoping",
    "@babel/plugin-transform-computed-properties",
    "@babel/plugin-transform-destructuring",
    "@babel/plugin-transform-exponentiation-operator",
    "@babel/plugin-transform-literals",
    "@babel/plugin-transform-parameters",
    "@babel/plugin-transform-runtime",
    "@babel/plugin-transform-shorthand-properties",
    "@babel/plugin-transform-spread",
    "@babel/plugin-transform-template-literals"
];




// configuration
module.exports = function (api) {
    api.cache.using(() => process.env.BABEL_ENV);
    console.log("Compiling for", "'" + api.env() + "'", "...");

    return {
        "env": {
            // shambhala-frontend environment (dev.)
            "development": {
                "comments": false,
                "plugins": plugins,
                "presets": [
                    [
                        "@babel/preset-env",
                        {
                            "modules": false,
                            "shippedProposals": true,
                            "targets": {
                                "esmodules": true
                            }
                        }
                    ]
                ]
            },

            // shambhala-backend environment (devApiServer and production)
            "commonjs": {
                "comments": false,
                "plugins": plugins,
                "presets": [
                    [
                        "@babel/preset-env",
                        {
                            "modules": "commonjs",
                            "shippedProposals": true
                        }
                    ]
                ]
            }
        }
    };
};

var path = require('path');
var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');


module.exports = function (env) {
    return [

        {

            mode: 'development',
            target: 'node',
            node: {
                __dirname: true,
                __filename: true,
            },
            entry: {

                'main': './src/main.js',

            },
            output: {
                path: path.join(__dirname, './dist'),
                filename: '[name].js',

            },
            module: {
                rules: [

                    {
                        test: /\.js$/,
                        loader: 'babel-loader',
                        //exclude: /node_modules/
                    },

                ]
            },

            externals: [nodeExternals()],

            plugins:[]

        },


    ]
}

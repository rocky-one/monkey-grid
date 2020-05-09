
const webpack = require('webpack');
const HappyPack = require('happypack');
const os = require('os');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');
// const fs = require('fs');
const { vendor } = require('./constBase.js');

var setConfig = function (dll, processEnv, entryName) {
    var config = {
        entry: {
            [entryName]: dll === 'dll' ? vendor : path.resolve(__dirname, '../src/App.ts'),
        },
        mode: processEnv,
        output: {
            path: path.resolve(__dirname, '../dist'),
            publicPath: '/',
            filename: 'js/[name].[hash:8].js',
            chunkFilename: 'js/[name].[chunkhash:8].js',
        },
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.less'],
            modules: [path.resolve(__dirname, '../node_modules')],
            alias: {
                'react': path.resolve(__dirname, '../node_modules/react'),
                //'react-dom': path.resolve(__dirname, '../node_modules/react-dom'),
                'react-dom': '@hot-loader/react-dom',
                'react-router': path.resolve(__dirname, '../node_modules/react-router'),
                'react-router-dom': path.resolve(__dirname, '../node_modules/react-router-dom'),
                'redux': path.resolve(__dirname, '../node_modules/redux'),
                'axios': path.resolve(__dirname, '../node_modules/axios'),
                'antd': path.resolve(__dirname, '../node_modules/antd'),
                '@': path.resolve(__dirname, '../src')
            }
        },
        module: {
            rules: [
                {
                    test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "url-loader",
                        options: {
                            limit: 10000,
                            name: 'images/[name].[hash:7].[ext]'
                        }
                    }
                },
                {
                    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                    exclude: /node_modules/,
                    use: [{
                        loader: "url-loader",
                        options: {
                            limit: 10000,
                            name: 'iconfont/[name].[hash:7].[ext]'
                        }
                    }]
                },
                {
                    test: /\.css$/,
                    exclude: /node_modules|antd\.css/,
                    use: [
                        {
                            loader: processEnv === 'development' ? "style-loader" : MiniCssExtractPlugin.loader,
                        },
                        // {
                        //     loader: 'typings-for-css-modules-loader',
                        //     options: {
                        //         modules: true,
                        //         namedExport: true
                        //     }
                        // },
                        {
                            loader: "css-loader",
                            // options: {
                            //     modules: true,
                            //     localIdentName: '[name][hash:base64:5]'
                            // }
                        },
                    ],
                },
                {
                    test: /\.less$/,
                    use: [
                        {
                            loader: processEnv === 'development' ? "style-loader" : MiniCssExtractPlugin.loader,
                        },
                        'happypack/loader?id=less',
                    ]
                },
                {
                    test: /\.css$/,
                    include: /node_modules|antd\.css/,
                    use: [
                        require.resolve('style-loader'),
                        {
                            loader: require.resolve('css-loader'),
                            options: {
                                importLoaders: 1,
                            },
                        },
                    ],
                },

                {
                    test: /\.(ts|tsx)$/,
                    use: {
                        loader: 'happypack/loader?id=ts',
                    },
                    exclude: /node_modules/
                },
            ]
        },
        plugins: [
            new HappyPack({
                id: 'less',
                threadPool: HappyPack.ThreadPool({ size: os.cpus().length }),
                threads: 4,
                verbose: true,
                loaders: [
                    {
                        loader: "css-loader",
                        // options: {
                        //     modules: true,
                        //     localIdentName: '[name][hash:base64:5]'
                        // }
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: processEnv === 'production' ? (loader) => [
                                require('postcss-import')({ root: loader.resourcePath }),
                                require('autoprefixer')({
                                    browsers: ["defaults",
                                        'last 4 versions', "not ie < 9", "> 1%", "last 3 iOS versions"]
                                }),
                            ] : [],

                        }
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            modifyVars: {
                                '@icon-url': '"../../../../../src/css/antd-iconfont/iconfont"',
                                'font-size-base': '12px',
                            },
                        }

                        //processEnv === 'production' ?  : {} 
                        // options: {
                        //     modules: true,
                        //     sourceMap: true,
                        //     importLoader: 2,
                        // modifyVars:{
                        //     "primary-color": "red",
                        //     "ant-btn-primary":"red"
                        // }
                        //modifyVars:{"primary-color": "#1DA57A"}
                        //},
                    }
                ],
            }),

            new HappyPack({
                id: 'ts',
                threadPool: HappyPack.ThreadPool({ size: os.cpus().length }),
                threads: 4,
                verbose: true,
                loaders: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', "@babel/preset-react"],
                            "plugins": [
                                ["import", {
                                    "libraryName": "antd",
                                    "libraryDirectory": "es",
                                    "style": "css" // `style: true` 会加载 less 文件
                                }]
                            ],
                            // babelrc: true, cacheDirectory: true
                        }
                    },
                    {
                        loader: 'ts-loader',
                        options: {
                            happyPackMode: true
                        }
                    }
                ]
            }),
            new webpack.optimize.ModuleConcatenationPlugin(),
            new MiniCssExtractPlugin({
                filename: "css/[name]-[chunkhash:8].css",
                chunkFilename: 'css/[name].[chunkhash:8].css',
            }),
        ],
    };
    return config;
}

module.exports = setConfig;

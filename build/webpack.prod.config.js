var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// var ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var CopyPlugin = require('copy-webpack-plugin');
var setConfig = require('./webpack.base.config.js');
var merge = require('webpack-merge');
var config = setConfig('dllprod', 'production', 'main');

var dllProdconfig = {
	cache: true,
	optimization: {
		splitChunks: {
			cacheGroups: {
				// 这里是抽取首页需要的公共库
				main: {
					name: "main",
					chunks: "initial",
					minChunks: 2,
					priority: 10,
				},
				// 想抽取所有模块的公共库 但是抽出来有点大
				// 我认为是增加了首屏的加载大小
				// 另一方面也可以说减少了首屏的加载数量 看怎么取舍
				common: {
					name: "common",
					chunks: "all",
					test: /[\/]node_modules[\/]/,
					minChunks: 1,
					priority: 20,
				},
				echarts: {
					chunks: "all",
					name: "chunk-echarts",
					priority: 30, // 权重要大于 common 不然会被打包进 common
					test: /[\/]node_modules[\/]_echarts@4\.1\.0@echarts[\/]/
				}
			}
		}
	},
	plugins: [
		new CleanWebpackPlugin(['dist/js/*.js', 'dist/css/*.css', 'dist/images', 'dist/index.html'], {
			root: process.cwd(),
			verbose: true,
			dry: false,
			exclude: ['dist/js/vendor'],
		}),

		new webpack.DllReferencePlugin({
			context: path.resolve(__dirname),
			manifest: require('./manifest.json'),
		}),
		new OptimizeCssAssetsPlugin({
			assetNameRegExp: /\.css$/g,
			cssProcessor: require('cssnano'),
			cssProcessorOptions: { safe: true, discardComments: { removeAll: true } },
			canPrint: true
		}),
		// new ParallelUglifyPlugin({
		// 	output: {
		// 		comments: false,
		// 	},
		// 	uglifyJS: {
		// 		compress: {
		// 			warnings: false,
		// 			drop_console: true,
		// 		}
		// 	}
		// }),
		new UglifyJsPlugin({
			parallel: true,
			uglifyOptions: {
				ie8: true,
				output: {
					comments: false,
					beautify: true,
				},
				compress: {
					drop_console: true,
					properties: false,
				},
				warnings: false
			}
		}),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: path.resolve(__dirname, '../src/template/index.html'),
			inject: true,
		}),
		new CopyPlugin([
			{ from: path.resolve(__dirname, '../dist/iconfont'), to: path.resolve(__dirname, '../dist/css/iconfont') },
		]),
	]
};

var newConfig = merge(config, dllProdconfig);
webpack(newConfig, function (err, stats) {
	console.log(stats.toString({
		colors: true,
		modules: false,
		children: false,
		chunks: false,
		chunkModules: false,
		performance: false,
	}));
});



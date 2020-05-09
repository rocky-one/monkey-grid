
var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var rootPath = path.join(__dirname);
var CleanWebpackPlugin = require('clean-webpack-plugin');
var setConfig = require('./webpack.base.config.js');
var merge = require('webpack-merge');
var config = setConfig('dll', 'development', 'vendor');

var webpackDll = {
	output: {
		path: path.join(__dirname, '../dist/js/vendor'),
		publicPath: '/js/vendor',
		filename: '[name].[hash:8].js',
		chunkFilename: '[name].[chunkhash:8].js',
		library: '[name]',
	},
	mode: 'development',
	//插件
	plugins: [
		new CleanWebpackPlugin(['dist/js/vendor'], {
			root: process.cwd(),
			verbose: true,
			dry: false,
			exclude: [],
		}),
		new webpack.DllPlugin({
			path: path.join(rootPath, './manifest.json'),//path是manifest文件的输出路径
			name: '[name]',//name是dll暴露的对象名，要跟output.library保持一致；
			context: __dirname,//context是解析包路径的上下文，这个要跟build中配置保持一致。
		}),
		new HtmlWebpackPlugin({
			filename: path.join(__dirname, '../src/template/index.html'),
			template: 'src/index.html',
			inject: true
		}),
	],
};
var newConfig = merge(config, webpackDll);
webpack(newConfig, function (err, stats) {
	console.log(stats.toString({
		chunks: false,
		colors: true
	}));
});
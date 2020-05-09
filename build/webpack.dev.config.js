
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
var webpackDevServer = require('webpack-dev-server');
var setConfig = require('./webpack.base.config.js');
var merge = require('webpack-merge');
var opn = require('opn');
var config = setConfig('dlldev', 'development', 'main');
var { devport } = require('./constBase.js');
var dllDevConfig = {
	devtool: 'cheap-module-source-map',
	optimization: {
		splitChunks: {
			cacheGroups: {
				commons: {
					name: "main",
					chunks: "initial",
					minChunks: 2
				}
			}
		}
	},
	plugins: [
		new webpack.DllReferencePlugin({
			context: path.resolve(__dirname),
			manifest: require('./manifest.json'),

		}),
		new webpack.HotModuleReplacementPlugin(),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: path.resolve(__dirname, '../src/template/index.html'),
			inject: true,
			// excludeChunks: ['themes']
		})
	]
};
var newConfig = merge(config, dllDevConfig);
//  热替换
Object.keys(newConfig.entry).forEach(function (name) {
	newConfig.entry[name] = [
		`webpack-dev-server/client?http://localhost:${devport}/`,
		"webpack/hot/only-dev-server"
	].concat(newConfig.entry[name])
});
// 代理配置
var proxyConfig = {
	target: 'http://localhost:8080',
	secure: false,
	changeOrigin: true,
}
var compiler = webpack(newConfig);
var server = new webpackDevServer(compiler, {
	hot: true,
	port: devport,
	// publicPath: '/',
	host: '0.0.0.0',
	contentBase: path.join(__dirname, '../dist/'),
	historyApiFallback: true,
	stats: {
		colors: true,
		modules: false,
		children: false,
		chunks: false,
		chunkModules: false,
	},
	progress: true,
	// proxy: {
	// 	'/c1/*':proxyConfig,
	// 	'/auth/*':proxyConfig,
	// 	'/contextMenu':proxyConfig,
	// 	'/attrModel':proxyConfig,
	// 	'/dimension':proxyConfig,
	// }
});


opn(`http://localhost:${devport}/`);
server.listen(devport, function () {
	opn(`http://localhost:${devport}/`);
});


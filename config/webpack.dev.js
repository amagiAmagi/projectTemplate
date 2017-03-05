/**
 * @author: Brave <u9648u6653u52c7@gmail.com>
 * @date: 2016-08-06
 */

var _ = require('lodash');
var path = require('path');
var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var openBrowserPlugin = require('open-browser-webpack-plugin');
var utils = require('../scripts/utils');
var baseConfig = require('./index');
var webpackBaseConfig = require('./webpack.base');
var entries = webpackBaseConfig.entry;

webpackBaseConfig.entry = null;

webpackBaseConfig.plugins = utils.createHtmlByHtmlWebpackPlugin(entries, {
	baseName: baseConfig.htmlTemplateName,
	filters: ['vendor'],
	chunks: ['vendor', 'common']
});

var config = {
	entry: (function (entries) {
		for ( var key in entries ) {
			if ( entries.hasOwnProperty(key) ) {
				entries[key] = ['webpack-dev-server/client?http://' + baseConfig.dev.hostname + ':' + baseConfig.dev.port,
					"webpack/hot/dev-server"].concat(entries[key]);
			}
		}
		return entries;
	})(entries),
  
	module: {
		rules: [
			{
				test: /\.jsx?$/,
        enforce: 'pre',
				loader: "eslint-loader",
        options: {
          formatter: require('eslint-friendly-formatter')
        },
				exclude: /node_modules/
			}
		]
	},
	plugins: [
		new webpack.optimize.CommonsChunkPlugin({
			name: 'common',
			filename: 'js/common.js',
			minChunks: 3,
			chunks: _.filter(_.keys(entries), function (value) {
				return !(/vendor/.test(value));
			})
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor',
			filename: 'js/vendor.js',
			chunks: ['common'],
			minChunks: Infinity
		}),
		new ExtractTextPlugin({
      filename: 'css/[name].css',
      allChunks: true
    }),
		new webpack.HotModuleReplacementPlugin(),
		new openBrowserPlugin({url: 'http://' + baseConfig.dev.hostname + ':' + baseConfig.dev.port})
	],
	devtool: '#eval-source-map'
};

module.exports = webpackMerge(webpackBaseConfig, config);
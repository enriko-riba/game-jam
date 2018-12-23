import * as webpack from 'webpack';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as  CopyWebpackPlugin from 'copy-webpack-plugin';
import * as  ExtractTextPlugin  from 'extract-text-webpack-plugin';
import * as  CleanWebpackPlugin from 'clean-webpack-plugin';
import { BundleAnalyzerPlugin} from 'webpack-bundle-analyzer';

const config: webpack.Configuration = {
      
    entry: {
        main:   "./app.ts",
        common: ["@tweenjs/tween.js", "pixi.js", "pixi-filters", "toaster-js"],
        //frb: ["firebase/app","firebase/auth", "firebaseui"],
        //pixi:       "pixi.js"
    },
    
    output: {
        filename: "./[name].bundle.js",
    },

    resolve: {
        extensions: [".ts", ".js", ".css", ".scss"]
    },

    module: {
        rules: [
            { test: /\.js$/, loader: "source-map-loader", enforce: 'pre' },
            { test: /\.ts$/, loader: "ts-loader" },
            //{ test: /\.css$/, use: ['style-loader', 'css-loader']},
            { test: /\.css$/, use: ExtractTextPlugin.extract({fallback: 'style-loader', use: ['css-loader', 'sass-loader']})},
            { test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader']},
        ],
    },
   
    optimization: {
        runtimeChunk: 'single',   
        splitChunks: { chunks: 'all'},
        removeAvailableModules: true,
        removeEmptyChunks: true,
        mergeDuplicateChunks: true,
        flagIncludedChunks: true,
        providedExports: true,
        usedExports: true,
    },

    plugins: [
        new HtmlWebpackPlugin({
            template:"./index.html",
            minify: {
                collapseWhitespace: false,
                collapseInlineTagWhitespace: true,
                removeComments: true, 
                removeRedundantAttributes: true
            }}),
        new CopyWebpackPlugin([
            { from: 'site.css', to: '[name].[ext]' },
            { from: 'assets/', to:'assets'},
        ]),
        new ExtractTextPlugin({filename: 'style.css'}),
        new webpack.HotModuleReplacementPlugin()
    ],    
};

module.exports = config;
import * as common from './webpack.common';
import * as merge from 'webpack-merge';

const config = merge(common, {
      //  will be passed to webpack-dev-server (only if dev server is used)
      devServer: {
        historyApiFallback: true,
        port: 8000,
        hot: true,
        compress: false,
        stats: { colors: true },
    },
    mode: 'development',    
    devtool: "inline-source-map"
});

module.exports = config;
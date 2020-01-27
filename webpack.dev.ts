import * as common from './webpack.common';
import * as merge from 'webpack-merge';

const config = merge(common, {      
    mode: 'development',    
    devtool: 'cheap-module-eval-source-map'
});

//  will be passed to webpack-dev-server (only if dev server is used)
(config as any).devServer = {
  historyApiFallback: true,
  port: 8000,
  hot: true,
  disableHostCheck: true,
  compress: false,
  stats: { colors: true },
};
module.exports = config;
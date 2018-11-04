import * as common from './webpack.common';
import * as merge from 'webpack-merge';

module.exports = merge(common, {      
    mode: 'production',
    devtool: 'source-map',
});
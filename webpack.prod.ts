import * as common from './webpack.common';
import * as merge from 'webpack-merge';

const config = merge(common, {      
    mode: 'production',
    devtool: 'source-map',
    performance: {
        assetFilter: function(assetFilename) {
          return assetFilename.endsWith('.js');
        }
      }
});
module.exports = config;
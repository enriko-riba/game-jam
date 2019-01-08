import * as common from './webpack.common';
import * as merge from 'webpack-merge';

module.exports = merge(common, {      
    mode: 'production',
    devtool: false,
    performance: {
        assetFilter: function(assetFilename) {
          return assetFilename.endsWith('.js');
        }
      }
});
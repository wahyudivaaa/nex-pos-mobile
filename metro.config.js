const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add web-specific configurations
config.resolver.platforms = ['web', 'native', 'ios', 'android'];
config.resolver.alias = {
  // Ensure react-native resolves to react-native-web on web
  'react-native$': 'react-native-web',
  'react-native/Libraries/EventEmitter/NativeEventEmitter$': 'react-native-web/dist/vendor/react-native/NativeEventEmitter/index.js',
};

// Add support for resolving .web.js files
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.js', 'web.ts', 'web.tsx'];

// Web-specific transformations
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

// Ensure proper module resolution for web
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Enable tree shaking for web builds
if (process.env.NODE_ENV === 'production') {
  config.transformer.minifierConfig = {
    mangle: {
      keep_fnames: true,
    },
    output: {
      ascii_only: true,
      quote_style: 3,
      wrap_iife: true,
    },
    sourceMap: {
      includeSources: false,
    },
    toplevel: false,
    compress: {
      reduce_funcs: false,
    },
  };
}

module.exports = config;
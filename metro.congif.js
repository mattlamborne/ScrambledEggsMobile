const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolution for Node.js core modules
config.resolver.extraNodeModules = {
  stream: require.resolve('stream-browserify'),
  // Add other Node.js core modules you might need:
  
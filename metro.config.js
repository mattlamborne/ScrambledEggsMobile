const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable package exports to fix the Supabase/WS stream issue in Expo SDK 53
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
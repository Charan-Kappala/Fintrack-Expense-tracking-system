const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration to handle react-dom in React Native
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Map react-dom to react-native for React Native platforms
config.resolver.alias = {
  'react-dom': 'react-native',
};

module.exports = config;
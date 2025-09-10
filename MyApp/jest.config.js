module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*|@react-navigation|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|react-native-get-random-values|react-native-reanimated)/)'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};

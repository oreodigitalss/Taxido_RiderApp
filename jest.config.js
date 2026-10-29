module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((@)?react-native|@react-native|react-redux|@reduxjs|react-native-reanimated|react-native-reanimated-carousel|react-native-worklets|react-native-gesture-handler|react-native-screens|react-native-safe-area-context)/)',
  ],
};

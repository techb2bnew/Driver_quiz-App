module.exports = {
  preset: '@react-native/jest-preset',
  // AsyncStorage v3 ships ES modules, which jest must transform too.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-async-storage)/)',
  ],
};

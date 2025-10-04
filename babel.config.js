module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin', // <-- required for Reanimated 2+
  ],
  // plugins: [
  //   ["react-native-worklets-core/plugin"],
  //   // other plugins like 'react-native-reanimated/plugin' if used
  // ],
};

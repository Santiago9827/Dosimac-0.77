module.exports = {
  presets: ['babel-preset-expo'],
  plugins: ['react-native-reanimated/plugin',"nativewind/babel"],
  env: {
    production: {
      plugins: ['react-native-paper/babel'],
      // plugins: ["nativewind/babel"],
    },
  },
};

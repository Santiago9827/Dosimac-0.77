// module.exports = {
//   presets: ['babel-preset-expo'],
//   plugins: ['react-native-reanimated/plugin', "nativewind/babel"],
//   env: {
//     production: {
//       plugins: ['react-native-paper/babel'],
//       plugins: ["nativewind/babel"],
//     },
//   },
// };
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  const isProd = process.env.NODE_ENV === 'production';

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      ...(isProd ? ['react-native-paper/babel'] : []),
      'react-native-reanimated/plugin',
    ],
  };
};


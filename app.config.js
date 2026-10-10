/** @type {import('expo/config').ExpoConfig} */
module.exports = ({ config }) => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  const plugins = [...(config.plugins ?? [])];

  if (googleMapsApiKey) {
    plugins.push([
      'react-native-maps',
      {
        androidGoogleMapsApiKey: googleMapsApiKey,
        iosGoogleMapsApiKey: googleMapsApiKey,
      },
    ]);
  }

  return {
    ...config,
    plugins,
  };
};

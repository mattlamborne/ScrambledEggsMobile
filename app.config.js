// app.config.js
export default {
  name: "ScrambledEggsMobile",
  slug: "scrambled-eggs-mobile",
  version: "1.0.0",
  orientation: "portrait",
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.scrambieeggs.mobile',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#ffffff"
    }
  },
  extra: {
    eas: {
      projectId: "0466b413-773a-495c-b4f4-e613ef9a4ad7"
    }
  }
};

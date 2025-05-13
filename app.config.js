// app.config.js
export default {
    name: "ScrambledEggsMobile",
    slug: "scrambled-eggs-mobile",
    version: "1.0.0",
    orientation: "portrait",
    // Remove references to icon assets for now
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff"
      }
    }
  };
export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/fonts.css'],
  app: {
    head: {
      title: 'Songes',
    },
  },
  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseSenderId: process.env.FIREBASE_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
    },
  },
});

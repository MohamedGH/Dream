import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const app = initializeApp({
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseSenderId,
    appId: config.public.firebaseAppId,
  });

  const auth = getAuth(app);
  const db = getFirestore(app);

  const providers = {
    google: new GoogleAuthProvider(),
    facebook: new FacebookAuthProvider(),
    twitter: new TwitterAuthProvider(),
    github: new GithubAuthProvider(),
    apple: new OAuthProvider('apple.com'),
    microsoft: new OAuthProvider('microsoft.com'),
    yahoo: new OAuthProvider('yahoo.com'),
  };

  return {
    provide: { auth, db, providers },
  };
});

/*
Activer dans Firebase Console > Authentication > Sign-in method :
- Google, Facebook, Twitter (X), GitHub : activation directe
- Apple : nécessite un compte Apple Developer + Service ID
- Microsoft, Yahoo : fournisseurs OAuth génériques, config client requise

Règles Firestore recommandées :

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /dreams/{dreamId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null && request.auth.uid == resource.data.authorUid;
    }
  }
}
*/

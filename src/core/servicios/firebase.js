// src/core/servicios/firebase.js
// Instancia Base Singleton de Firebase para ContabilidadWii con App Check Enterprise (JavaScript Puro)

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

export const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || 'contabilidadwii',
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
  databaseURL: import.meta.env.PUBLIC_FIREBASE_DATABASE_URL
};

export const app = getApps()[0] || initializeApp(firebaseConfig);

export let appCheck = null;

if (typeof window !== 'undefined' && import.meta.env.PUBLIC_RECAPTCHA_WEB) {
  // Soportar debug token si está configurado en .env o en entorno local
  if (import.meta.env.PUBLIC_APPCHECK_DEBUG_TOKEN) {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.PUBLIC_APPCHECK_DEBUG_TOKEN;
  } else if (['localhost', '127.0.0.1'].includes(location.hostname)) {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  try {
    const siteKey = import.meta.env.PUBLIC_RECAPTCHA_WEB;
    const provider = new ReCaptchaV3Provider(siteKey);
    appCheck = initializeAppCheck(app, {
      provider,
      // Desactivamos el auto-refresh agresivo para evitar bucles de errores 400 si el dominio aún no está en reCAPTCHA
      isTokenAutoRefreshEnabled: false
    });
  } catch (err) {
    try {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(import.meta.env.PUBLIC_RECAPTCHA_WEB),
        isTokenAutoRefreshEnabled: false
      });
    } catch (e) {
      // Inicialización omitida de forma limpia y transparente
    }
  }
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;

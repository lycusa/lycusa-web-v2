import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let adminDb: Firestore;

function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    try {
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      if (!projectId || !clientEmail || !privateKey) {
        console.warn('Firebase Admin credentials not fully configured');
        return null;
      }

      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      return null;
    }
  } else {
    app = getApps()[0];
  }

  adminDb = getFirestore(app);
  return adminDb;
}

export function getAdminDb(): Firestore | null {
  if (!adminDb) {
    return initializeFirebaseAdmin();
  }
  return adminDb;
}

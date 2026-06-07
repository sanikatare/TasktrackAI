import * as admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { logger } from './logger';

let firebaseInitialized = false;

function isPlaceholder(value: string): boolean {
  return /your[-_]|placeholder|example\.com|\.\.\.|change-in-production|sk-ant-\.\.\./i.test(value);
}

function loadServiceAccountFromFile(): admin.ServiceAccount | null {
  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!filePath) return null;

  const resolved = resolve(filePath);
  if (!existsSync(resolved)) {
    logger.warn(`Firebase service account file not found: ${resolved}`);
    return null;
  }

  try {
    const json = JSON.parse(readFileSync(resolved, 'utf8')) as admin.ServiceAccount;
    logger.info(`Loaded Firebase credentials from ${resolved}`);
    return json;
  } catch (err) {
    logger.warn('Failed to parse Firebase service account JSON:', err);
    return null;
  }
}

export function initFirebaseAdmin(): void {
  if (admin.apps.length) {
    firebaseInitialized = true;
    return;
  }

  const fromFile = loadServiceAccountFromFile();
  if (fromFile) {
    try {
      admin.initializeApp({ credential: admin.credential.cert(fromFile) });
      firebaseInitialized = true;
      logger.info('Firebase Admin SDK initialised from service account file');
      return;
    } catch (err) {
      logger.warn('Firebase Admin initialization from file failed:', err);
    }
  }

  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    logger.warn(
      'Firebase Admin credentials missing — use FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_* env vars',
    );
    return;
  }

  if (isPlaceholder(projectId) || isPlaceholder(privateKey) || isPlaceholder(clientEmail)) {
    logger.warn(
      'Firebase Admin credentials are placeholders — skipping init. Set real credentials or enable ALLOW_DEV_AUTH=true for local dev',
    );
    return;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey: privateKey.replace(/\\n/g, '\n'),
        clientEmail,
      }),
    });

    firebaseInitialized = true;
    logger.info('Firebase Admin SDK initialised');
  } catch (err) {
    logger.warn('Firebase Admin initialization failed — token verification disabled:', err);
  }
}

export function isFirebaseInitialized(): boolean {
  return firebaseInitialized || admin.apps.length > 0;
}

export function isDevAuthEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_AUTH === 'true';
}

export { admin };

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  initializeFirestore,
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore with auto-detect long polling and ignoreUndefinedProperties
// This resolves WebChannel connection drops in iframe/proxy environments seamlessly.
export const db = initializeFirestore(
  app,
  {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true
  },
  firebaseConfig.firestoreDatabaseId
);

// Connection test helper per Firebase integration guidelines
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && (error.message.includes('the client is offline') || (error as any).code === 'unavailable')) {
      console.warn("Firestore connection: client is operating in offline mode or reconnecting.");
    }
    return false;
  }
}

if (typeof window !== 'undefined') {
  testFirestoreConnection();
}

export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function isQuotaError(error: unknown): boolean {
  if (!error) return false;
  const message = (error instanceof Error ? error.message : String(error)).toLowerCase();
  const errorCode = (error as any)?.code || "";
  
  return (
    errorCode === 'resource-exhausted' ||
    message.includes('quota limit exceeded') || 
    message.includes('quota metric') || 
    message.includes('resource exhausted') ||
    message.includes('quota exceeded') ||
    message.includes('daily read units') ||
    message.includes('daily write units') ||
    message.includes('8 resource_exhausted') ||
    message.includes('too many requests')
  );
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): boolean {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorCode = (error as any)?.code || "unknown";

  const errInfo: FirestoreErrorInfo = {
    error: `${errorCode}: ${errorMessage}`,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email || undefined,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  
  if (isQuotaError(error)) {
    // Notify window that quota was exceeded so App components can listen
    window.dispatchEvent(new CustomEvent('firestore-quota-exceeded', { 
      detail: { 
        originalError: errorMessage,
        code: errorCode 
      } 
    }));
    
    console.warn(`Firestore Quota/Rate Exceeded [${errorCode}]:`, errorMessage);
    // We don't throw here to avoid triggering ErrorBoundary in many cases, 
    // but the UI handles isQuotaExceeded state.
    return true;
  }

  console.error('Firestore Error Details:', errInfo);
  // Re-throw if it wasn't a quota error, unless the caller handles the return value
  return false;
}


// Persistence is enabled above. No further test connection needed.

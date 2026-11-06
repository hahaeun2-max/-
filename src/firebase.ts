/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App & Firestore Database
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Operation types for standard error handling
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
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: true,
      tenantId: null,
      providerInfo: []
    }
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Startup connection verification
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is currently offline. Responses will sync when online.');
    }
  }
}
testConnection();

export interface SurveySubmissionPayload {
  ageGroup: string;
  occupation: string;
  taste: number;
  convenience: number;
  dailyIntent: number;
  moment: string;
  selectedBase?: string;
  selectedChago?: string;
  selectedTopping?: string;
  recipeTitle: string;
  diagnosedType: string;
  matchedTasting: string;
}

/**
 * Saves a survey response to the 'survey_responses' collection using an auto-generated ID.
 * This guarantees safe concurrent append-only accumulation without ID collision or race conditions.
 */
export async function saveSurveyResponse(data: SurveySubmissionPayload): Promise<string> {
  const collectionPath = 'survey_responses';
  try {
    const docData = {
      ageGroup: data.ageGroup,
      occupation: data.occupation,
      taste: Math.round(data.taste),
      convenience: Math.round(data.convenience),
      dailyIntent: Math.round(data.dailyIntent),
      moment: data.moment,
      selectedBase: data.selectedBase || '',
      selectedChago: data.selectedChago || '',
      selectedTopping: data.selectedTopping || '',
      recipeTitle: data.recipeTitle,
      diagnosedType: data.diagnosedType,
      matchedTasting: data.matchedTasting,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, collectionPath), docData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
    throw error;
  }
}

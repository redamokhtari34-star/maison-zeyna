/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  INITIAL_DRESSES, 
  INITIAL_CLIENTS, 
  INITIAL_BOOKINGS, 
  INITIAL_JEWELRY, 
  INITIAL_EXPENSES, 
  INITIAL_WITHDRAWALS 
} from '../initialData';
import { Dress, Client, Booking, Jewelry, Expense, CashWithdrawal } from '../types';

// Initialize Firebase using the custom databaseId if provided
import { getAuth } from 'firebase/auth';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);

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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Thin wrapper/helper functions for Firestore read/write
export const saveDocument = async (collectionName: string, id: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${id}`);
  }
};

export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
};

// Seed database with initial data if collections are empty
export const seedDatabaseIfEmpty = async () => {
  try {
    const checkEmpty = async (colName: string) => {
      try {
        const snap = await getDocs(collection(db, colName));
        return snap.empty;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, colName);
        return true;
      }
    };

    // 1. Seed Dresses
    const dressesEmpty = await checkEmpty('dresses');
    if (dressesEmpty) {
      console.log('Seeding initial dresses...');
      for (const item of INITIAL_DRESSES) {
        try {
          await setDoc(doc(db, 'dresses', item.id), item);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `dresses/${item.id}`);
        }
      }
    }

    // 2. Seed Clients
    const clientsEmpty = await checkEmpty('clients');
    if (clientsEmpty) {
      console.log('Seeding initial clients...');
      for (const item of INITIAL_CLIENTS) {
        try {
          await setDoc(doc(db, 'clients', item.id), item);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `clients/${item.id}`);
        }
      }
    }

    // 3. Seed Bookings
    const bookingsEmpty = await checkEmpty('bookings');
    if (bookingsEmpty) {
      console.log('Seeding initial bookings...');
      for (const item of INITIAL_BOOKINGS) {
        try {
          await setDoc(doc(db, 'bookings', item.id), item);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `bookings/${item.id}`);
        }
      }
    }

    // 4. Seed Jewelry
    const jewelryEmpty = await checkEmpty('jewelry');
    if (jewelryEmpty) {
      console.log('Seeding initial jewelry...');
      for (const item of INITIAL_JEWELRY) {
        try {
          await setDoc(doc(db, 'jewelry', item.id), item);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `jewelry/${item.id}`);
        }
      }
    }

    // 5. Seed Expenses
    const expensesEmpty = await checkEmpty('expenses');
    if (expensesEmpty) {
      console.log('Seeding initial expenses...');
      for (const item of INITIAL_EXPENSES) {
        try {
          await setDoc(doc(db, 'expenses', item.id), item);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `expenses/${item.id}`);
        }
      }
    }

    // 6. Seed Withdrawals
    const withdrawalsEmpty = await checkEmpty('withdrawals');
    if (withdrawalsEmpty) {
      console.log('Seeding initial withdrawals...');
      for (const item of INITIAL_WITHDRAWALS) {
        try {
          await setDoc(doc(db, 'withdrawals', item.id), item);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `withdrawals/${item.id}`);
        }
      }
    }

    // 7. Seed Notifications
    const notificationsEmpty = await checkEmpty('notifications');
    if (notificationsEmpty) {
      console.log('Seeding initial notifications...');
      const initialNotifs = [
        { id: 'n-1', message: 'La robe Karakou "Yasmine" (N° 01) est sortie. Récupérée par la cliente Yasmine Benchaoui (Tél: 0550123456). Retour prévu le 2026-07-06.', type: 'out', timestamp: '02/07/2026 14:30' },
        { id: 'n-2', message: 'La robe Blousa Oranaise "Wahrania" (N° 05) est revenue. Retournée par la cliente Meriem Bahloul (Tél: 0555778899).', type: 'in', timestamp: '28/06/2026 11:15' }
      ];
      for (const item of initialNotifs) {
        try {
          await setDoc(doc(db, 'notifications', item.id), item);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `notifications/${item.id}`);
        }
      }
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

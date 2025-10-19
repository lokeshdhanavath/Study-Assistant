import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth } from './firebase';

// Helper function to wait for auth state
const ensureAuth = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if user is already authenticated
    if (auth.currentUser) {
      resolve(true);
      return;
    }

    // Wait for auth state to be loaded
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(!!user);
    });

    // Timeout after 3 seconds
    setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, 3000);
  });
};

// Save study plan to Firestore
export const saveStudyPlanToFirestore = async (planData: any) => {
  try {
    const isAuthenticated = await ensureAuth();
    if (!isAuthenticated) {
      throw new Error('Please sign in to save study plans');
    }

    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    console.log('User UID:', user.uid);
    const userDocRef = doc(db, 'users', user.uid);

    const planWithId = {
      ...planData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    console.log('Attempting to save plan:', planWithId);

    try {
      const userDoc = await getDoc(userDocRef);
      console.log('User document exists:', userDoc.exists());

      if (userDoc.exists()) {
        await updateDoc(userDocRef, {
          studyPlans: arrayUnion(planWithId),
          updatedAt: new Date().toISOString()
        });
        console.log('Plan added to existing user document');
      } else {
        await setDoc(userDocRef, {
          studyPlans: [planWithId],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        console.log('New user document created with plan');
      }

      // Update localStorage for consistency
      updateLocalStorage(planWithId, 'add');
      return planWithId;

    } catch (firestoreError: any) {
      console.error('Firestore operation failed:', firestoreError);
      
      // Check if it's a permissions error
      if (firestoreError.code === 'permission-denied') {
        console.log('Firestore permission denied - check security rules');
        throw new Error('Database permissions denied. Please check Firestore security rules.');
      }
      
      throw firestoreError;
    }

  } catch (error) {
    console.error('Error saving study plan to Firestore:', error);
    throw error;
  }
};

// Load study plans from Firestore
export const loadStudyPlansFromFirestore = async () => {
  try {
    const isAuthenticated = await ensureAuth();
    if (!isAuthenticated) {
      console.log('No authenticated user for loading plans');
      return loadFromLocalStorage();
    }

    const user = auth.currentUser;
    if (!user) return loadFromLocalStorage();

    console.log('Loading plans for user:', user.uid);
    const userDocRef = doc(db, 'users', user.uid);

    try {
      const userDoc = await getDoc(userDocRef);
      console.log('User document loaded:', userDoc.exists());

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const studyPlans = userData.studyPlans || [];
        console.log('Loaded study plans from Firestore:', studyPlans.length);
        
        // Sync to localStorage
        syncLocalStorage(studyPlans);
        return studyPlans;
      }
      
      console.log('No user document found in Firestore');
      return loadFromLocalStorage();

    } catch (firestoreError: any) {
      console.error('Firestore load failed:', firestoreError);
      
      if (firestoreError.code === 'permission-denied') {
        console.log('Firestore permission denied - using localStorage');
        return loadFromLocalStorage();
      }
      
      throw firestoreError;
    }

  } catch (error) {
    console.error('Error loading study plans:', error);
    return loadFromLocalStorage();
  }
};

// Delete study plan from Firestore - FIXED VERSION
export const deleteStudyPlanFromFirestore = async (planId: string) => {
  try {
    const isAuthenticated = await ensureAuth();
    if (!isAuthenticated) {
      throw new Error('Please sign in to delete study plans');
    }

    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    console.log('🗑️ Deleting plan:', planId, 'for user:', user.uid);
    const userDocRef = doc(db, 'users', user.uid);

    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const updatedStudyPlans = (userData.studyPlans || []).filter((plan: any) => plan.id !== planId);
      
      await updateDoc(userDocRef, {
        studyPlans: updatedStudyPlans,
        updatedAt: new Date().toISOString()
      });

      console.log('✅ Plan deleted from Firestore');
      updateLocalStorage(null, 'delete', planId);
      return true;
    }
    
    console.log('❌ No user document to delete from');
    return false;

  } catch (error: unknown) {
    console.error('💥 Error deleting study plan:', error);
    
    // For permission errors, still try to delete from localStorage
    if (error instanceof Error && error.message.includes('permission-denied')) {
      console.log('🔄 Deleting from localStorage only');
      updateLocalStorage(null, 'delete', planId);
      return true;
    }
    
    throw error;
  }
};

// Helper functions for localStorage
const updateLocalStorage = (plan: any | null, operation: 'add' | 'delete', planId?: string) => {
  try {
    const currentData = JSON.parse(localStorage.getItem('userData') || '{}');
    let studyPlans = currentData.studyPlans || [];

    if (operation === 'add' && plan) {
      studyPlans = [plan, ...studyPlans];
    } else if (operation === 'delete' && planId) {
      studyPlans = studyPlans.filter((p: any) => p.id !== planId);
    }

    localStorage.setItem('userData', JSON.stringify({
      ...currentData,
      studyPlans: studyPlans
    }));
    console.log('LocalStorage updated for operation:', operation);
  } catch (error) {
    console.log('LocalStorage update failed:', error);
  }
};

const syncLocalStorage = (studyPlans: any[]) => {
  try {
    const currentData = JSON.parse(localStorage.getItem('userData') || '{}');
    localStorage.setItem('userData', JSON.stringify({
      ...currentData,
      studyPlans: studyPlans
    }));
    console.log('LocalStorage synced with', studyPlans.length, 'plans');
  } catch (error) {
    console.log('LocalStorage sync failed:', error);
  }
};

const loadFromLocalStorage = () => {
  try {
    const localData = JSON.parse(localStorage.getItem('userData') || '{}');
    const plans = localData.studyPlans || [];
    console.log('Loaded from localStorage:', plans.length, 'plans');
    return plans;
  } catch (error) {
    console.log('LocalStorage load failed:', error);
    return [];
  }
};
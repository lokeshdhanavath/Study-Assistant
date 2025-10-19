'use client';
import { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword
} from 'firebase/auth';
import { signIn } from 'next-auth/react';
import { auth, db } from '@/lib/firebase'; // Make sure db is exported from your firebase config
import { doc, setDoc, getDoc } from 'firebase/firestore';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // FIX: Sync user data to Firebase Firestore (cloud storage)
 const syncUserDataToFirestore = async (userId: string) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    // Get current localStorage data
    const localData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (userDoc.exists()) {
      // Firestore exists - merge data (prefer Firestore data)
      const firestoreData = userDoc.data();
      const mergedData = {
        ...localData,
        ...firestoreData,
        // Prefer Firestore study plans over local
        studyPlans: firestoreData.studyPlans || localData.studyPlans || [],
        // Prefer Firestore progress data
        progress: firestoreData.progress || localData.progress || { 
          dailyProgress: 0, 
          weeklyProgress: 0, 
          overallProgress: 0, 
          currentStreak: 0, 
          longestStreak: 0 
        },
        // Prefer Firestore preferences
        preferences: firestoreData.preferences || localData.preferences || { 
          theme: 'system', 
          notifications: true, 
          language: 'en' 
        }
      };
      
      // Update localStorage with merged data
      localStorage.setItem('userData', JSON.stringify(mergedData));
      console.log('Data synced from Firestore to localStorage');
      
      // Also update Firestore with any new local data that might be missing
      await updateDoc(userDocRef, {
        ...mergedData,
        updatedAt: new Date().toISOString()
      });
      
    } else {
      // First time user - create Firestore doc from localStorage or create default
      const initialData = {
        progress: localData.progress || { 
          dailyProgress: 0, 
          weeklyProgress: 0, 
          overallProgress: 0, 
          currentStreak: 0, 
          longestStreak: 0 
        },
        preferences: localData.preferences || { 
          theme: 'system', 
          notifications: true, 
          language: 'en' 
        },
        activity: localData.activity || { 
          completedTasks: [], 
          currentLevel: 1, 
          points: 0, 
          lastActive: new Date().toISOString() 
        },
        onboarding: localData.onboarding || { 
          completed: false, 
          currentStep: 0 
        },
        studyPlans: localData.studyPlans || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(userDocRef, initialData);
      localStorage.setItem('userData', JSON.stringify(initialData));
      console.log('New user data created in Firestore');
    }
    
  } catch (error) {
    console.error('Firestore sync error:', error);
    // Fallback to localStorage if Firestore fails
    const fallbackData = {
      progress: { dailyProgress: 0, weeklyProgress: 0, overallProgress: 0, currentStreak: 0, longestStreak: 0 },
      preferences: { theme: 'system', notifications: true, language: 'en' },
      activity: { completedTasks: [], currentLevel: 1, points: 0, lastActive: new Date().toISOString() },
      onboarding: { completed: false, currentStep: 0 },
      studyPlans: []
    };
    localStorage.setItem('userData', JSON.stringify(fallbackData));
  }
};

  // FIX: Updated authentication with Firestore sync
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      showMessage('Please fill in all fields', 'error');
      return;
    }

    if (!isLogin && password.length < 6) {
      showMessage('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      if (isLogin) {
        // Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Login successful:', userCredential.user);
        
        // FIX: Sync data from Firestore when logging in
        await syncUserDataToFirestore(userCredential.user.uid);
        
        showMessage('Welcome back! Successfully logged in.', 'success');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        // Sign up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Signup successful:', userCredential.user);
        
        // FIX: Create user data in Firestore
        await syncUserDataToFirestore(userCredential.user.uid);
        
        showMessage('Account created successfully! Welcome to StudyMate.', 'success');
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      switch (error.code) {
        case 'auth/user-not-found':
          showMessage('No account found with this email. Please sign up first.', 'error');
          break;
        case 'auth/wrong-password':
          showMessage('Incorrect password. Please try again.', 'error');
          break;
        case 'auth/email-already-in-use':
          showMessage('This email is already registered. Please login instead.', 'error');
          break;
        case 'auth/invalid-email':
          showMessage('Invalid email address format.', 'error');
          break;
        case 'auth/weak-password':
          showMessage('Password is too weak. Use at least 6 characters.', 'error');
          break;
        case 'auth/too-many-requests':
          showMessage('Too many failed attempts. Please try again later.', 'error');
          break;
        case 'auth/network-request-failed':
          showMessage('Network error. Please check your connection.', 'error');
          break;
        default:
          showMessage(`Authentication failed: ${error.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      await signIn('github', { callbackUrl: 'http://localhost:3000' });
    } catch (error) {
      console.error('GitHub login error:', error);
      showMessage('GitHub login failed. Please try again.', 'error');
      setLoading(false);
    }
  };

  // Loading components
  const PulseLoader = () => (
    <div className="flex items-center justify-center gap-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <span>Processing...</span>
    </div>
  );

  if (!isClient) {
    return (
      <div className="min-h-screen login-container flex items-center justify-center p-4">
        <div className="login-card max-w-md w-full p-8 rounded-xl shadow-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen login-container flex items-center justify-center p-4">
      <div className="login-card max-w-md w-full p-8 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            {loading ? (
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="text-2xl text-white">🎓</span>
            )}
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back' : 'Join StudyMate'}
          </h2>
          <p className="login-muted mt-2">
            {isLogin ? 'Sign in to continue your learning journey' : 'Create your account to get started'}
          </p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`p-4 rounded-lg mb-6 border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' 
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="login-input w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
              placeholder="Enter your password"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-button w-full py-3 rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 font-medium shadow-lg"
          >
            {loading ? (
              <PulseLoader />
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t login-border"></div>
          <span className="px-4 login-muted text-sm">or continue with</span>
          <div className="flex-1 border-t login-border"></div>
        </div>

        {/* GitHub Login */}
        <button
          onClick={handleGitHubLogin}
          disabled={loading}
          className="w-full bg-gray-900 text-white dark:bg-gray-700 dark:text-gray-100 py-3 rounded-lg hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-3 font-medium border login-border disabled:opacity-50"
        >
          {loading ? 'Connecting...' : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd"/>
              </svg>
              GitHub
            </>
          )}
        </button>

        {/* Toggle between Login/Signup */}
        <div className="text-center mt-8 pt-6 border-t login-border">
          <p className="login-muted">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage({ text: '', type: '' });
              }}
              disabled={loading}
              className="ml-2 text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
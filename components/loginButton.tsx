'use client';
import { signOut, useSession } from 'next-auth/react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState, useEffect } from 'react';
import { AuthForm } from './AuthForm';

export function LoginButton() {
  const { data: session } = useSession();
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const confirmed = confirm('Are you sure you want to sign out?');
    if (!confirmed) return;

    setSigningOut(true);
    
    try {
      if (session) {
        await signOut();
      }
      if (firebaseUser) {
        await firebaseSignOut(auth);
      }
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Sign out error:', error);
      setSigningOut(false);
    }
  };

  const getUserDisplayName = () => {
    if (session?.user) {
      return session.user.name || session.user.email?.split('@')[0] || 'User';
    }
    if (firebaseUser) {
      return firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
    }
    return '';
  };

  const getUserAvatar = () => {
    if (session?.user?.image) return session.user.image;
    if (firebaseUser?.photoURL) return firebaseUser.photoURL;
    return null;
  };

  // Close modal when clicking outside
  useEffect(() => {
    if (showAuthForm) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setShowAuthForm(false);
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showAuthForm]);

  if (session || firebaseUser) {
    const displayName = getUserDisplayName();
    const avatar = getUserAvatar();

    return (
      <div className="flex items-center gap-3">
        {avatar ? (
          <img 
            src={avatar} 
            alt="Profile" 
            className="w-8 h-8 rounded-full border-2 border-border"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium border-2 border-border">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">Welcome back</span>
          <span className="text-xs text-muted-foreground">{displayName}</span>
        </div>
        <button 
          onClick={handleSignOut}
          disabled={signingOut}
          className="bg-transparent hover:bg-red-500/10 text-red-600 hover:text-red-700 px-3 py-1 rounded-lg text-sm border border-red-300 dark:border-red-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
        >
          {signingOut ? (
            <>
              <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              Signing Out...
            </>
          ) : (
            'Sign Out'
          )}
        </button>
      </div>
    );
  }

  return (
    <>
      <button 
        onClick={() => setShowAuthForm(true)}
        className="login-button px-6 py-2 rounded-lg hover:opacity-90 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
      >
        Sign In
      </button>

      {/* Auth Modal */}
      {showAuthForm && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300"
          onClick={() => setShowAuthForm(false)}
        >
          <div 
            className="relative animate-in slide-in-from-bottom-8 duration-300 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowAuthForm(false)}
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 transition-colors shadow-lg z-10"
            >
              ×
            </button>
            <AuthForm />
          </div>
        </div>
      )}
    </>
  );
}
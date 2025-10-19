import { initializeApp } from "firebase/app";
import { getAuth, GithubAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // ADD THIS IMPORT

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAw1RmvGg2VRc9LxPCaO3M6BwxV45FR7w",
  authDomain: "studymate-1315d.firebaseapp.com",
  projectId: "studymate-1315d",
  storageBucket: "studymate-1315d.firebasestorage.app",
  messagingSenderId: "692263217381",
  appId: "1:692263217381:web:8a4dd1ffa92fa8d125cc0c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firebase Firestore and get a reference to the service
export const db = getFirestore(app); // ADD THIS LINE

export const githubProvider = new GithubAuthProvider();
export default app;
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/11.7.1/firebase-analytics.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js';
import { getFirestore, collection } from 'https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCw465imuFfgRiBjVwKQNRK-gGDm5i1SSY',
  authDomain: 'simon-says-01.firebaseapp.com',
  projectId: 'simon-says-01',
  storageBucket: 'simon-says-01.firebaseapp.com',  // corrected domain
  messagingSenderId: '134105981219',
  appId: '1:134105981219:web:399c09bfd09cde183eec96',
  measurementId: 'G-PJ2205S127',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Firestore collection reference
const scoresCollection = collection(db, 'scores');

export { app, auth, analytics, db, scoresCollection };
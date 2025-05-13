import { auth, scoresCollection, db } from './firebase-config.js';
import { 
  signOut, 
  signInWithPopup,
  GoogleAuthProvider, 
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js';
import { 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from 'https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js';

// DOM Elements
const gameButtons = {
  green: document.getElementById('green'),
  red: document.getElementById('red'),
  yellow: document.getElementById('yellow'),
  blue: document.getElementById('blue'),
};
const startButton = document.getElementById('start-button');
const currentScoreElement = document.getElementById('current-score');
const highScoreElement = document.getElementById('high-score');
const statusTextElement = document.getElementById('status-text');
const finalScoreElement = document.getElementById('final-score');
const highScoreMessageElement = document.getElementById('high-score-message');
const loginMessageElement = document.getElementById('login-message');
const playAgainButton = document.getElementById('play-again-button');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const userInfoElement = document.getElementById('user-info');
const userNameElement = document.getElementById('user-name');
const userEmailElement = document.getElementById('user-email');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const refreshLeaderboardButton = document.getElementById('refresh-leaderboard');
const leaderboardTable = document.getElementById('leaderboard-table');
const leaderboardBody = document.getElementById('leaderboard-body');
const leaderboardLoading = document.getElementById('leaderboard-loading');
const leaderboardEmpty = document.getElementById('leaderboard-empty');
const leaderboardLogin = document.getElementById('leaderboard-login');

// Bootstrap Modal
let gameOverModal;
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Bootstrap modal
  gameOverModal = new bootstrap.Modal(document.getElementById('game-over-modal'));
  
  // Load leaderboard if user is signed in
  if (auth.currentUser) {
    loadLeaderboard();
  }
});

// Game state
let sequence = [];
let playerSequence = [];
let score = 0;
let highScore = 0;
let isPlaying = false;
let isShowingSequence = false;
let round = 0;
let soundEnabled = true;
let darkModeEnabled = localStorage.getItem('darkMode') === 'true';

// Audio elements
const sounds = {
  green: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3'),
  red: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound2.mp3'),
  yellow: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound3.mp3'),
  blue: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3'),
  success: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3'),
  failure: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3'),
};

// Apply dark mode if enabled
if (darkModeEnabled) {
  document.body.classList.add('dark-mode');
  darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// Event Listeners
startButton.addEventListener('click', startGame);
playAgainButton.addEventListener('click', startGame);
loginButton.addEventListener('click', signInWithGoogle);
logoutButton.addEventListener('click', () => signOut(auth));
darkModeToggle.addEventListener('click', toggleDarkMode);
refreshLeaderboardButton.addEventListener('click', loadLeaderboard);

// Add event listeners to game buttons
Object.keys(gameButtons).forEach((color) => {
  gameButtons[color].addEventListener('mousedown', () => buttonPress(color));
  gameButtons[color].addEventListener('mouseup', () => buttonRelease(color));
  gameButtons[color].addEventListener('touchstart', (e) => {
    e.preventDefault();
    buttonPress(color);
  });
  gameButtons[color].addEventListener('touchend', (e) => {
    e.preventDefault();
    buttonRelease(color);
  });
});

// Button press function
function buttonPress(color) {
  if (isPlaying && !isShowingSequence) {
    gameButtons[color].classList.add('clicked');
    gameButtons[color].classList.add('active');
    playSound(color);
    playerSequence.push(color);
    checkPlayerInput();
  }
}

// Button release function
function buttonRelease(color) {
  gameButtons[color].classList.remove('clicked');
  gameButtons[color].classList.remove('active');
}

// Play sound function
function playSound(color) {
  if (soundEnabled) {
    sounds[color].currentTime = 0;
    sounds[color].play();
  }
}

// Start game function
function startGame() {
  sequence = [];
  playerSequence = [];
  score = 0;
  isPlaying = true;
  round = 0;

  updateScoreDisplay();
  startButton.disabled = true;
  statusTextElement.textContent = 'Watch the sequence...';

  // Start the first round after a short delay
  setTimeout(() => {
    nextRound();
  }, 1000);
}

// Next round function
function nextRound() {
  round++;
  playerSequence = [];
  addToSequence();

  statusTextElement.textContent = 'Watch the sequence...';

  // Show the sequence to the player
  showSequence();
}

// Add to sequence function
function addToSequence() {
  const colors = ['green', 'red', 'yellow', 'blue'];
  const randomIndex = Math.floor(Math.random() * colors.length);
  sequence.push(colors[randomIndex]);
}

// Show sequence function
async function showSequence() {
  isShowingSequence = true;

  // Show each button in the sequence with delay
  for (let i = 0; i < sequence.length; i++) {
    const color = sequence[i];
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Light up button
    gameButtons[color].classList.add('active');
    playSound(color);

    // Turn off button after delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    gameButtons[color].classList.remove('active');
  }

  isShowingSequence = false;
  statusTextElement.textContent = 'Your turn! Repeat the sequence.';
}

// Check player input function
function checkPlayerInput() {
  const currentIndex = playerSequence.length - 1;

  // Check if the player's input matches the sequence
  if (playerSequence[currentIndex] !== sequence[currentIndex]) {
    // Player made a mistake
    gameOver();
    return;
  }

  // Check if the player completed the current sequence
  if (playerSequence.length === sequence.length) {
    // Player completed the sequence successfully
    score++;
    updateScoreDisplay();

    // Short delay before starting the next round
    setTimeout(() => {
      nextRound();
    }, 1000);
  }
}

// Game over function
function gameOver() {
  isPlaying = false;
  playSound('failure');

  startButton.disabled = false;
  statusTextElement.textContent = 'Game Over! Press Start to play again.';

  // Update final score in modal
  finalScoreElement.textContent = score;

  // Check if this is a new high score
  let isNewHighScore = false;
  if (score > highScore) {
    highScore = score;
    highScoreElement.textContent = highScore;
    isNewHighScore = true;
    highScoreMessageElement.classList.remove('d-none');
  } else {
    highScoreMessageElement.classList.add('d-none');
  }

  // Show login message if not signed in
  if (!auth.currentUser) {
    loginMessageElement.classList.remove('d-none');
  } else {
    loginMessageElement.classList.add('d-none');

    // Save score to Firestore
    saveScore(score);
  }

  // Show game over modal
  if (gameOverModal) {
    gameOverModal.show();
  }
}

// Update score display function
function updateScoreDisplay() {
  currentScoreElement.textContent = score;
  highScoreElement.textContent = highScore;
}

// Toggle dark mode function
function toggleDarkMode() {
  darkModeEnabled = !darkModeEnabled;
  document.body.classList.toggle('dark-mode');

  // Update toggle button icon
  if (darkModeEnabled) {
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }

  // Save preference to localStorage
  localStorage.setItem('darkMode', darkModeEnabled);
}

// Firebase Auth Functions
// Sign in with Google
function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .catch(error => {
      console.error('Error signing in with Google:', error);
    });
}

// Auth state change listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    loginButton.classList.add('d-none');
    logoutButton.classList.remove('d-none');
    userInfoElement.classList.remove('d-none');

    // Display user info
    userNameElement.textContent = user.displayName;
    userEmailElement.textContent = user.email;

    // Get user's high score
    getUserHighScore(user.uid);

    // Load leaderboard
    loadLeaderboard();
  } else {
    // User is signed out
    loginButton.classList.remove('d-none');
    logoutButton.classList.add('d-none');
    userInfoElement.classList.add('d-none');

    // Reset user info
    userNameElement.textContent = '';
    userEmailElement.textContent = '';

    // Update leaderboard view
    leaderboardTable.classList.add('d-none');
    leaderboardEmpty.classList.add('d-none');
    leaderboardLogin.classList.remove('d-none');
    leaderboardLoading.classList.add('d-none');
  }
});

// Firestore Functions
// Save score to Firestore
async function saveScore(score) {
  const user = auth.currentUser;
  if (!user) return;

  const scoreData = {
    userId: user.uid,
    displayName: user.displayName,
    email: user.email,
    score: score,
    timestamp: serverTimestamp(),
  };

  try {
    // Check if this is a new high score for the user
    const userScoresQuery = query(
      scoresCollection,
      where('userId', '==', user.uid),
      orderBy('score', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(userScoresQuery);
    
    if (snapshot.empty || snapshot.docs[0].data().score < score) {
      // This is a new high score or first score
      await addDoc(scoresCollection, scoreData);
      console.log('Score saved successfully');
      loadLeaderboard();
    } else {
      console.log('Not a new high score');
    }
  } catch (error) {
    console.error('Error saving score:', error);
  }
}

// Get user's high score
async function getUserHighScore(userId) {
  try {
    const userScoresQuery = query(
      scoresCollection,
      where('userId', '==', userId),
      orderBy('score', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(userScoresQuery);
    
    if (!snapshot.empty) {
      const userHighScore = snapshot.docs[0].data().score;
      highScore = userHighScore;
      highScoreElement.textContent = highScore;
    }
  } catch (error) {
    console.error('Error getting user high score:', error);
  }
}

// Load leaderboard
async function loadLeaderboard() {
  if (!auth.currentUser) {
    leaderboardTable.classList.add('d-none');
    leaderboardEmpty.classList.add('d-none');
    leaderboardLogin.classList.remove('d-none');
    leaderboardLoading.classList.add('d-none');
    return;
  }

  leaderboardTable.classList.add('d-none');
  leaderboardEmpty.classList.add('d-none');
  leaderboardLogin.classList.add('d-none');
  leaderboardLoading.classList.remove('d-none');

  try {
    const leaderboardQuery = query(
      scoresCollection,
      orderBy('score', 'desc'),
      limit(10)
    );
    
    const snapshot = await getDocs(leaderboardQuery);
    
    leaderboardLoading.classList.add('d-none');

    if (snapshot.empty) {
      leaderboardEmpty.classList.remove('d-none');
      return;
    }

    // Clear existing rows
    leaderboardBody.innerHTML = '';

    // Add new rows
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const row = document.createElement('tr');

      // Highlight current user
      if (data.userId === auth.currentUser.uid) {
        row.classList.add('table-primary');
      }

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${data.displayName}</td>
        <td>${data.score}</td>
      `;

      leaderboardBody.appendChild(row);
    });

    leaderboardTable.classList.remove('d-none');
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    leaderboardLoading.classList.add('d-none');
    leaderboardEmpty.classList.remove('d-none');
  }
}
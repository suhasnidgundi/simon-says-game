# Simon Says Game

A classic Simon Says game built with Firebase, HTML/CSS/JavaScript, and Bootstrap 5.

## Features

- Classic Simon Says gameplay
- User authentication with Google via Firebase
- High score tracking with Firestore
- Responsive design for desktop and mobile
- Sound effects and visual feedback
- Optional dark mode

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- Firebase account
- Firebase CLI installed (`npm install -g firebase-tools`)

### Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication with Google sign-in method
3. Create a Firestore database (start in test mode)
4. Register your web app in the Firebase console to get your configuration
5. Replace the Firebase configuration in `firebase-config.js` with your own

### Local Development

1. Clone this repository
2. Update Firebase configuration in `firebase-config.js`
3. Install Firebase CLI if not already installed: `npm install -g firebase-tools`
4. Login to Firebase: `firebase login`
5. Initialize Firebase in the project directory: `firebase init`
   - Select Hosting and Firestore
   - Choose your Firebase project
   - Use "public" as your public directory
   - Configure as a single-page app: No
   - Set up automatic builds and deploys: No
6. Open `index.html` in your browser for local development

### Deployment

Deploy to Firebase Hosting:

```bash
firebase deploy
```

## Project Structure

- `index.html` - Main HTML file
- `style.css` - CSS styles
- `script.js` - Game logic and Firebase integration
- `firebase-config.js` - Firebase configuration
- `assets/` - Sounds and other assets
- `firebase.json` - Firebase configuration for deployment

## Game Rules

1. Press the "Start Game" button to begin
2. Watch the sequence of colors
3. Repeat the sequence by clicking the colored buttons
4. Each round adds one more color to the sequence
5. Game ends when you make a mistake
6. Your score is the number of rounds you completed successfully

## Credits

Created by [Your Name]
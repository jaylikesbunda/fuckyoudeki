// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, serverTimestamp, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB9q5EYU1TM4ujo8fN9f3f5pikop_JPpV4",
    authDomain: "fuckyoudeki-im.firebaseapp.com",
    databaseURL: "https://fuckyoudeki-im-default-rtdb.firebaseio.com",
    projectId: "fuckyoudeki-im",
    storageBucket: "fuckyoudeki-im.appspot.com",
    messagingSenderId: "934074641567",
    appId: "1:934074641567:web:aeaf5ef007ee5c513106aa",
    measurementId: "G-9PC7WJFKB7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, 'messages');
const deathPredictionsRef = ref(db, 'deathPredictions');
const answersRef = ref(db, 'deathPredictionAnswers');
const messageHistory = [];
const MAX_MESSAGES = 5; // Number of messages to track
const BASE_COOLDOWN = 1000; // 1 second
const MAX_COOLDOWN = 300000; // 5 minutes
let currentCooldown = BASE_COOLDOWN;
let spamStrikes = 0;
const MAX_SPAM_STRIKES = 3;
const repeatedMessages = new Map();

// Function to submit a death prediction
export function submitDeathPrediction(username, prediction) {
    return push(deathPredictionsRef, {
        username: username,
        prediction: prediction,
        timestamp: serverTimestamp()
    });
}

// Function to listen for new death predictions
export function onNewDeathPrediction(callback) {
    onChildAdded(deathPredictionsRef, (snapshot) => {
        const predictionData = snapshot.val();
        callback(predictionData);
    });
}

function calculateCooldown() {
    const now = Date.now();
    // Remove old messages from history
    while (messageHistory.length > 0 && now - messageHistory[0].timestamp > 60000) {
        messageHistory.shift();
    }
    
    if (messageHistory.length >= MAX_MESSAGES) {
        const timeSpan = now - messageHistory[0].timestamp;
        const messagesPerMinute = (messageHistory.length / timeSpan) * 60000;
        
        // Check for repeated messages
        const lastMessage = messageHistory[messageHistory.length - 1].message;
        const repeatCount = repeatedMessages.get(lastMessage) || 0;
        
        if (repeatCount > 2) {
            // Harsh penalty for repeating the same message more than twice
            spamStrikes += 2;
            currentCooldown = Math.min(currentCooldown * 8, MAX_COOLDOWN);
        } else if (messagesPerMinute > 10) { // If more than 10 messages per minute
            spamStrikes++;
            if (spamStrikes > MAX_SPAM_STRIKES) {
                // Exponential increase for obvious spam
                currentCooldown = Math.min(currentCooldown * 4, MAX_COOLDOWN);
            } else {
                // Normal increase
                currentCooldown = Math.min(currentCooldown * 2, MAX_COOLDOWN);
            }
        } else {
            spamStrikes = Math.max(0, spamStrikes - 1); // Decrease spam strikes
            currentCooldown = Math.max(currentCooldown / 2, BASE_COOLDOWN);
        }
    }
    
    return currentCooldown;
}

// Function to submit answers to questions
export function submitAnswer(username, question, answer) {
    return push(answersRef, {
        username: username,
        question: question,
        answer: answer,
        timestamp: serverTimestamp()
    });
}

// Function to get statistics for a specific question
export function getStatisticsForQuestion(question, callback) {
    get(answersRef).then((snapshot) => {
        if (snapshot.exists()) {
            const answers = snapshot.val();
            const filteredAnswers = Object.values(answers).filter(a => a.question === question);
            callback(filteredAnswers);
        } else {
            callback([]);
        }
    }).catch((error) => {
        console.error("Error fetching statistics:", error);
        callback([]);
    });
}
function hashStringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360; // Full spectrum of colors
    const saturation = 60 + ((hash >> 1) % 40); // Saturation between 60% and 100%
    const lightness = 50 + ((hash >> 2) % 30); // Lightness between 50% and 80%
    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    return color;
}


window.displayMessage = function(username, message, timestamp) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');
    
    const formattedDateTime = new Date(timestamp).toLocaleString();

    const messageText = document.createElement('div');
    messageText.classList.add('message-text');

    const usernameSpan = document.createElement('span');
    usernameSpan.style.color = hashStringToColor(username);
    usernameSpan.innerHTML = `<strong>${username}</strong>: `;

    const slurPatterns = [
        // N-word variations
        /\b(n+[i1l!]+[g6q]{1,2}[e3a@]?r*|n+[i1l!]?[g6q]{1,2}[a@4]h?|n+[i1l!]?[g6q]+)\b/gi,
        // Other racial slurs
        /\b(k+[i1l!]+k+[e3]+|w+[e3]+t+b+[a@4]+c*k*|c+h+[i1l!]+n+k+|g+[o0]+[o0]+k+|s+p+[i1l!]+c+)\b/gi,
        // Homophobic slurs
        /\b(f+[a@4]+g+([o0]+t+)?|d+[y1i!]+k+[e3]+|q+u+[e3]+[e3]+r+)\b/gi,
    ];

    // Function to censor a matched slur
    const censorSlur = (match) => '*'.repeat(match.length);

    // Apply censoring for each slur pattern
    let censoredMessage = message;
    slurPatterns.forEach(pattern => {
        censoredMessage = censoredMessage.replace(pattern, censorSlur);
    });

    const messageContent = document.createElement('span');
    messageContent.textContent = censoredMessage;

    const timestampSpan = document.createElement('span');
    timestampSpan.classList.add('timestamp');
    timestampSpan.textContent = formattedDateTime;

    messageText.appendChild(usernameSpan);
    messageText.appendChild(messageContent);

    messageContainer.appendChild(messageText);
    messageContainer.appendChild(timestampSpan);
    
    const messagesContainer = document.getElementById('messages');
    messagesContainer.insertBefore(messageContainer, messagesContainer.firstChild);
    
    messagesContainer.scrollTop = 0;
};

window.submitMessage = function() {
    console.log('submitMessage called with Firebase');
    const now = Date.now();
    const cooldown = calculateCooldown();
    
    if (messageHistory.length > 0 && now - messageHistory[messageHistory.length - 1].timestamp < cooldown) {
        console.log('Rate limit exceeded');
        const waitTime = Math.ceil((cooldown - (now - messageHistory[messageHistory.length - 1].timestamp)) / 1000);
        openErrorWindow(`Please wait ${waitTime} seconds before sending another message.`);
        return;
    }

    const username = document.getElementById('username').value || 'Anonymous';
    const message = document.getElementById('message').value;
    const characterLimit = 280;

    if (message.length > characterLimit) {
        console.log('Validation failed: Message exceeds character limit');
        openErrorWindow(`Message is too long. Maximum allowed characters are ${characterLimit}.`);
        return;
    }

    if (message) {
        console.log('Submitting message to Firebase:', { username, message });
        
        // Check for repeated messages
        const repeatCount = repeatedMessages.get(message) || 0;
        repeatedMessages.set(message, repeatCount + 1);
        
        if (repeatCount > 2) {
            console.log('Spam detected: Message repeated too many times');
            openErrorWindow('Spam detected. Please vary your messages.');
            return;
        }

        push(messagesRef, {
            username: username,
            message: message,
            timestamp: serverTimestamp()
        }).then(() => {
            console.log('Message submitted to Firebase:', { username, message });
            messageHistory.push({ message, timestamp: now });
            if (messageHistory.length > MAX_MESSAGES) {
                messageHistory.shift();
            }
            document.getElementById('message').value = ''; // Clear the textarea
        }).catch((error) => {
            console.error('Error submitting message to Firebase:', error);
            openErrorWindow('There was an error submitting your message. Please try again.');
        });
    } else {
        console.log('Validation failed: Message is required');
        openErrorWindow("Please enter a message.");
    }
};

// Listen for new messages added to the database and display them
onChildAdded(messagesRef, (snapshot) => {
    const messageData = snapshot.val();
    console.log('New message added:', messageData); // Log new messages
    window.displayMessage(messageData.username, messageData.message, messageData.timestamp);
});

console.log('Firebase submission integrated with submitMessage');

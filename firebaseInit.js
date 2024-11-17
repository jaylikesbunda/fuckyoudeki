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

export function calculateCooldown() {
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

// Improved hash function for color generation
export function improvedHashStringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
    }
    const hue = Math.abs(hash % 360);
    const saturation = 70 + (Math.abs(hash) % 20); // 70-90%
    const lightness = 45 + (Math.abs(hash) % 30); // 45-75%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Improved message display function
export function displayMessage(username, message, timestamp) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');
    
    const formattedDateTime = new Date(timestamp).toLocaleString();

    const messageText = document.createElement('div');
    messageText.classList.add('message-text');

    const usernameSpan = document.createElement('span');
    usernameSpan.style.color = improvedHashStringToColor(username);
    usernameSpan.innerHTML = `<strong>${escapeHTML(username)}</strong>: `;

    const messageContent = document.createElement('span');
    messageContent.textContent = filterSlurs(message);

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
}

// Helper function to escape HTML
export function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Improved slur filtering function
export function filterSlurs(text) {
    const slurPatterns = [
        /\b(n+[i1!]+[g6q]{1,2}[e3a@]?r*|n+[i1!]?[g6q]{1,2}[a@4]h?|n+[i1!]?[g6q]+)\b/gi,
        /\b(k+[i1!]+k+[e3]+|w+[e3]+t+b+[a@4]+c*k*|c+h+[i1l!]+n+k+|g+[o0]+[o0]+k+|s+p+[i1l!]+c+)\b/gi,
        /\b(f+[a@4]+g+([o0]+t+)?|d+[y1i!]+k+[e3]+|q+u+[e3]+[e3]+r+)\b/gi,
    ];

    return slurPatterns.reduce((filteredText, pattern) => 
        filteredText.replace(pattern, match => '*'.repeat(match.length)), text);
}

// Improved spam detection function
export function detectSpam(message, messageHistory) {
    const now = Date.now();
    const recentMessages = messageHistory.filter(m => now - m.timestamp < 60000);
    
    // Check message frequency
    if (recentMessages.length >= 10) {
        return { isSpam: true, reason: 'Too many messages in a short time' };
    }
    
    // Check for repeated messages
    const repeatedCount = recentMessages.filter(m => m.message === message).length;
    if (repeatedCount >= 3) {
        return { isSpam: true, reason: 'Message repeated too many times' };
    }
    
    // Check for all caps
    if (message.length > 10 && message === message.toUpperCase()) {
        return { isSpam: true, reason: 'Excessive use of capital letters' };
    }
    
    // Check for long repeated characters
    if (/(.)\1{10,}/.test(message)) {
        return { isSpam: true, reason: 'Excessive repeated characters' };
    }
    
    return { isSpam: false };
}

// Improved submit message function
export function submitMessage() {
    const now = Date.now();
    const username = escapeHTML(document.getElementById('username').value || 'Anonymous');
    let message = document.getElementById('message').value.trim();
    const characterLimit = 280;

    if (message.length > characterLimit) {
        openErrorWindow(`Message is too long. Maximum allowed characters are ${characterLimit}.`);
        return;
    }

    if (!message) {
        openErrorWindow("Please enter a message.");
        return;
    }

    const spamCheck = detectSpam(message, messageHistory);
    if (spamCheck.isSpam) {
        openErrorWindow(`Spam detected: ${spamCheck.reason}. Please wait before sending another message.`);
        return;
    }

    // Check for variations of "deki should add captcha to this"
    const dekiRegex = /deki\s+should\s+add\s+captcha\s+to\s+this/i;
    if (dekiRegex.test(message)) {
        message = "bidasci has no life";
    }

    push(messagesRef, {
        username: username,
        message: message,
        timestamp: serverTimestamp()
    }).then(() => {
        messageHistory.push({ message, timestamp: now });
        if (messageHistory.length > MAX_MESSAGES) {
            messageHistory.shift();
        }
        document.getElementById('message').value = '';
    }).catch((error) => {
        console.error('Error submitting message:', error);
        openErrorWindow('There was an error submitting your message. Please try again.');
    });
}

// Listen for new messages added to the database and display them
onChildAdded(messagesRef, (snapshot) => {
    const messageData = snapshot.val();
    console.log('New message added:', messageData); // Log new messages
    displayMessage(messageData.username, messageData.message, messageData.timestamp);
});

console.log('Firebase submission integrated with submitMessage');
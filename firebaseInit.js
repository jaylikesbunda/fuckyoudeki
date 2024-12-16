// Initialize Firebase references and functions
let db, ref, push, onChildAdded, serverTimestamp, get, child;
let messagesRef, deathPredictionsRef, answersRef;

// Wait for Firebase to be initialized from the main script
window.addEventListener('load', () => {
    // Get Firebase functions from window object after initialization
    db = window.db;
    ref = window.ref;
    push = window.push;
    onChildAdded = window.onChildAdded;
    serverTimestamp = window.serverTimestamp;
    get = window.get;
    child = window.child;

    // Initialize refs after Firebase is ready
    messagesRef = ref(db, 'messages');
    deathPredictionsRef = ref(db, 'deathPredictions');
    answersRef = ref(db, 'deathPredictionAnswers');

    // Set up message listener only once Firebase is initialized
    onChildAdded(messagesRef, (snapshot) => {
        const messageData = snapshot.val();
        console.log('New message added:', messageData);
        displayMessage(messageData.username, messageData.message, messageData.timestamp);
    });
});

const messageHistory = [];
const MAX_MESSAGES = 5;
const BASE_COOLDOWN = 1000;
const MAX_COOLDOWN = 300000;
let currentCooldown = BASE_COOLDOWN;
let spamStrikes = 0;
const MAX_SPAM_STRIKES = 3;
const repeatedMessages = new Map();

// Convert export functions to window functions
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

function submitAnswer(username, question, answer) {
    const answersRef = ref(db, 'deathPredictionAnswers');
    return push(answersRef, {
        username: username,
        question: question,
        answer: answer,
        timestamp: serverTimestamp()
    });
}

function getStatisticsForQuestion(question, callback) {
    const answersRef = ref(db, 'deathPredictionAnswers');
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

function improvedHashStringToColor(str) {
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

function displayMessage(username, message, timestamp) {
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

function escapeHTML(str) {
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

function filterSlurs(text) {
    const slurPatterns = [
        /\b(n+[i1!]+[g6q]{1,2}[e3a@]?r*|n+[i1!]?[g6q]{1,2}[a@4]h?|n+[i1!]?[g6q]+)\b/gi,
        /\b(k+[i1!]+k+[e3]+|w+[e3]+t+b+[a@4]+c*k*|c+h+[i1l!]+n+k+|g+[o0]+[o0]+k+|s+p+[i1l!]+c+)\b/gi,
        /\b(f+[a@4]+g+([o0]+t+)?|d+[y1i!]+k+[e3]+|q+u+[e3]+[e3]+r+)\b/gi,
    ];

    return slurPatterns.reduce((filteredText, pattern) => 
        filteredText.replace(pattern, match => '*'.repeat(match.length)), text);
}

function detectSpam(message, messageHistory) {
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

function submitMessage() {
    if (!messagesRef) {
        console.error('Firebase not yet initialized');
        return;
    }

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

// Make functions available globally
window.submitAnswer = submitAnswer;
window.getStatisticsForQuestion = getStatisticsForQuestion;
window.improvedHashStringToColor = improvedHashStringToColor;
window.displayMessage = displayMessage;
window.escapeHTML = escapeHTML;
window.filterSlurs = filterSlurs;
window.detectSpam = detectSpam;
window.submitMessage = submitMessage;

console.log('Firebase initialization complete');
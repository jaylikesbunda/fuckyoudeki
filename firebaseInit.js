// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB9q5EYU1TM4ujo8fN9_3f5pikop_JPpV4",
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


function hashStringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 50%)`; // Generates a color in HSL format
    return color;
}

window.displayMessage = function(username, message, timestamp) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');
    const formattedDateTime = new Date(timestamp).toLocaleString(); // Includes date and time

    const messageText = document.createElement('div');
    messageText.classList.add('message-text');

    const usernameSpan = document.createElement('span');
    usernameSpan.style.color = hashStringToColor(username);
    usernameSpan.innerHTML = `<strong>${username}</strong>: `;

    const messageContent = document.createElement('span');
    messageContent.textContent = message;

    const timestampSpan = document.createElement('span');
    timestampSpan.classList.add('timestamp');
    timestampSpan.textContent = formattedDateTime;

    messageText.appendChild(usernameSpan);
    messageText.appendChild(messageContent);

    messageContainer.appendChild(messageText);
    messageContainer.appendChild(timestampSpan);
    document.getElementById('messages').appendChild(messageContainer);
};


// Override the existing submitMessage function to include Firebase submission
window.submitMessage = function() {
    console.log('submitMessage called with Firebase'); // Log submitMessage calls with Firebase
    const username = document.getElementById('username').value || 'Anonymous';
    const message = document.getElementById('message').value;
    if (message) {
        console.log('Submitting message to Firebase:', { username, message }); // Log the message being submitted
        push(messagesRef, {
            username: username,
            message: message,
            timestamp: serverTimestamp()
        }).then(() => {
            console.log('Message submitted to Firebase:', { username, message }); // Log Firebase submission success
        }).catch((error) => {
            console.error('Error submitting message to Firebase:', error); // Log Firebase submission error
        });
        document.getElementById('message').value = ''; // Clear the textarea
    } else {
        console.log('Validation failed: Message is required');
        alert("Please enter a message.");
    }
};

// Listen for new messages added to the database and display them
onChildAdded(messagesRef, (snapshot) => {
    const messageData = snapshot.val();
    console.log('New message added:', messageData); // Log new messages
    window.displayMessage(messageData.username, messageData.message, messageData.timestamp);
});

console.log('Firebase submission integrated with submitMessage');

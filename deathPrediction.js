
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
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
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    const questions = [
        "What's your favorite color?",
        "Do you believe in aliens?",
        "If you could be any animal, what would you be?",
        "If you were a superhero, what would your power be?",
        "What's your favorite type of food?",
        "Have you ever seen a ghost?",
        "If you could time travel, where would you go?",
        "What's your favorite movie?",
    ];
    let currentQuestionIndex = 0;

    function showQuestion(index) {
        const questionElements = document.querySelectorAll('.question');
        questionElements.forEach((element, idx) => {
            element.classList.toggle('active', idx === index);
        });

        // Focus on the input of the current question
        const activeQuestionInput = questionElements[index].querySelector('input');
        if (activeQuestionInput) {
            activeQuestionInput.focus();
        }
    }

    function createQuestionnaire() {
        const questionnaire = document.querySelector('.questionnaire');

        questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question';
            if (index === 0) questionDiv.classList.add('active');

            const questionLabel = document.createElement('label');
            questionLabel.innerText = question;
            questionDiv.appendChild(questionLabel);

            const questionInput = document.createElement('input');
            questionInput.type = 'text';

            // Add event listener for Enter key
            questionInput.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    nextQuestion();
                }
            });

            questionDiv.appendChild(questionInput);

            questionnaire.appendChild(questionDiv);
        });

        const submitButton = document.createElement('button');
        submitButton.id = 'submitBtn';
        submitButton.innerText = 'Next';
        submitButton.addEventListener('click', nextQuestion);

        questionnaire.appendChild(submitButton);

        const resultDiv = document.createElement('div');
        resultDiv.id = 'result';
        resultDiv.innerHTML = `
            <h3>Death Prediction Result</h3>
            <p id="deathDate"></p>
            <p id="countdown"></p>
            <div id="stats"></div>
        `;
        questionnaire.appendChild(resultDiv);

        // Focus on the input of the first question
        showQuestion(0);
    }

    function nextQuestion() {
        const questionInputs = document.querySelectorAll('.question input');
        const currentInput = questionInputs[currentQuestionIndex];

        if (currentInput.value.trim() === '') {
            alert("Please answer the question before proceeding.");
            return;
        }

        // Store answer in Firebase
        const answer = currentInput.value.trim();
        const answerRef = db.ref(`deathanswers/${currentQuestionIndex}`);
        answerRef.push({
            answer: answer,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        currentQuestionIndex++;
        if (currentQuestionIndex >= questions.length) {
            displayResult();
        } else {
            showQuestion(currentQuestionIndex);
        }
    }

    function fetchMostUsedAnswers(callback) {
        const stats = [];
        const answersRef = db.ref('deathanswers');

        answersRef.on('value', (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                const questionIndex = childSnapshot.key;
                const answers = childSnapshot.val();
                const answerCounts = {};

                for (let key in answers) {
                    const answer = answers[key].answer;
                    if (answerCounts[answer]) {
                        answerCounts[answer]++;
                    } else {
                        answerCounts[answer] = 1;
                    }
                }

                const sortedAnswers = Object.entries(answerCounts).sort((a, b) => b[1] - a[1]);
                const mostUsedAnswer = sortedAnswers[0];
                const leastUsedAnswer = sortedAnswers[sortedAnswers.length - 1];
                const topThreeAnswers = sortedAnswers.slice(0, 3);

                stats[questionIndex] = {
                    question: questions[questionIndex],
                    mostUsedAnswer: mostUsedAnswer[0],
                    count: mostUsedAnswer[1],
                    leastUsedAnswer: leastUsedAnswer[0],
                    leastCount: leastUsedAnswer[1],
                    totalResponses: Object.values(answerCounts).reduce((a, b) => a + b, 0),
                    topThree: topThreeAnswers.map(answer => `${answer[0]} (${answer[1]} times)`)
                };
            });
            callback(stats);
        });
    }

    function displayResult() {
        document.getElementById('submitBtn').style.display = 'none';
        document.querySelectorAll('.question').forEach(question => question.style.display = 'none');
        const resultDiv = document.getElementById('result');
        resultDiv.style.display = 'flex';
    
        const deathDate = calculateDeathDate();
        document.getElementById('deathDate').innerText = `Your predicted death date is: ${deathDate.toDateString()}`;
    
        updateCountdown(deathDate);
        setInterval(() => updateCountdown(deathDate), 1000);
    
        fetchMostUsedAnswers((stats) => {
            const statsContainer = document.getElementById('stats');
            statsContainer.innerHTML = "<h3>Global Stats:</h3>";
    
            stats.forEach((stat, index) => {
                if (stat) {
                    // Most Used Answer
                    const mostUsedElement = document.createElement('p');
                    mostUsedElement.innerText = `Question: ${stat.question}, Most Used Answer: ${stat.mostUsedAnswer} (${stat.count} times)`;
                    statsContainer.appendChild(mostUsedElement);
    
                    // Least Used Answer
                    const leastUsedElement = document.createElement('p');
                    leastUsedElement.innerText = `Question: ${stat.question}, Least Used Answer: ${stat.leastUsedAnswer} (${stat.leastCount} times)`;
                    statsContainer.appendChild(leastUsedElement);
    
                    // Total Responses
                    const totalResponsesElement = document.createElement('p');
                    totalResponsesElement.innerText = `Question: ${stat.question}, Total Responses: ${stat.totalResponses}`;
                    statsContainer.appendChild(totalResponsesElement);
    
                    // Top 3 Answers
                    const topThreeElement = document.createElement('p');
                    topThreeElement.innerText = `Question: ${stat.question}, Top 3 Answers: ${stat.topThree.join(', ')}`;
                    statsContainer.appendChild(topThreeElement);
                }
            });
        });
    }
    
    function calculateDeathDate() {
        const now = new Date();
        const lifeExpectancy = Math.random() < 0.5 ? 15 : 35; // Choose a life expectancy around 75 or 85 years to add variability
        const daysToAdd = Math.floor(Math.random() * (365 * (lifeExpectancy - 20))) + (365 * 20); // Random number of days between 20 years and chosen life expectancy
        now.setDate(now.getDate() + daysToAdd);
    
        const ominousFactor = Math.random(); // Adding a random factor to make it feel less predictable
        if (ominousFactor < 0.1) {
            // Rarely, reduce the calculated lifespan by up to 5 years for a more ominous prediction
            now.setDate(now.getDate() - Math.floor(Math.random() * 365 * 5));
        }
        return now;
    }

    function updateCountdown(deathDate) {
        const now = new Date();
        const timeDiff = deathDate - now;

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        const countdownText = `Time remaining: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
        const ominousMessage = days < 365 ? " The end is near..." : "";

        document.getElementById('countdown').innerText = countdownText + ominousMessage;
    }

    createQuestionnaire();
    showQuestion(currentQuestionIndex);
});

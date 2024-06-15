import { submitAnswer, getStatisticsForQuestion } from './firebaseInit.js';

document.addEventListener('DOMContentLoaded', () => {
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
    const answers = [];

    function showQuestion(index) {
        const questionElements = document.querySelectorAll('.question');
        questionElements.forEach((element, idx) => {
            element.classList.toggle('active', idx === index);
        });
    }

    function createQuestionnaire() {
        const questionnaire = document.querySelector('.questionnaire');
        if (!questionnaire) {
            console.error('No questionnaire element found');
            return;
        }

        questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question';
            if (index === 0) questionDiv.classList.add('active');

            const questionLabel = document.createElement('label');
            questionLabel.innerText = question;
            questionDiv.appendChild(questionLabel);

            const questionInput = document.createElement('input');
            questionInput.type = 'text';
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
        resultDiv.style.display = 'none';
        resultDiv.innerHTML = `
            <h3>Death Prediction Result</h3>
            <p id="deathDate"></p>
            <p id="countdown"></p>
            <div id="stats"></div>
        `;
        questionnaire.appendChild(resultDiv);
    }

    function nextQuestion() {
        const questionInputs = document.querySelectorAll('.question input');
        const answer = questionInputs[currentQuestionIndex].value.trim();
        if (answer === '') {
            alert("Please answer the question before proceeding.");
            return;
        }

        const username = document.getElementById('username') ? document.getElementById('username').value : 'Anonymous';
        const question = questions[currentQuestionIndex];
        submitAnswer(username, question, answer)
            .then(() => {
                answers.push({ question, answer });

                currentQuestionIndex++;
                if (currentQuestionIndex >= questions.length) {
                    displayResult();
                } else {
                    showQuestion(currentQuestionIndex);
                }
            })
            .catch((error) => {
                console.error('Error submitting answer:', error);
                alert('There was an error submitting your answer. Please try again.');
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

        displayStatistics();
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

    function displayStatistics() {
        const statsDiv = document.getElementById('stats');
        statsDiv.innerHTML = ''; // Clear previous stats

        let currentStatIndex = 0;
        const allStats = [];

        questions.forEach(question => {
            getStatisticsForQuestion(question, (answers) => {
                const stats = answers.reduce((acc, answer) => {
                    acc[answer.answer] = (acc[answer.answer] || 0) + 1;
                    return acc;
                }, {});

                const questionStats = Object.entries(stats).map(([answer, count]) => ({
                    question,
                    answer,
                    count
                }));

                allStats.push(...questionStats);
                if (allStats.length === questions.length) {
                    showNextStat();
                }
            });
        });

        function showNextStat() {
            if (allStats.length === 0) return;

            statsDiv.innerHTML = ''; // Clear previous stat
            const stat = allStats[currentStatIndex];

            const statDiv = document.createElement('div');
            statDiv.classList.add('stat');
            statDiv.innerHTML = `<h4>${stat.question}</h4><p>${stat.answer}: ${stat.count}</p>`;
            statsDiv.appendChild(statDiv);

            // Fade in
            statDiv.style.opacity = 0;
            setTimeout(() => {
                statDiv.style.transition = 'opacity 1s';
                statDiv.style.opacity = 1;
            }, 10);

            // Schedule next stat
            currentStatIndex = (currentStatIndex + 1) % allStats.length;
            setTimeout(showNextStat, 5000); // Change every 5 seconds
        }
    }

    createQuestionnaire();
    showQuestion(currentQuestionIndex);
});

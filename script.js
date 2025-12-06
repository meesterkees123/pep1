// Game state
let score = 0;
let currentQuestion = null;
let timer = null;
let timeLeft = 5;
let correctAnswers = 0;
let totalQuestions = 0;
let isAnswered = false;

// DOM elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const questionText = document.getElementById('question-text');
const answerButtons = document.querySelectorAll('.answer-btn');
const scoreDisplay = document.getElementById('score');
const timerFill = document.getElementById('timer-fill');
const timerText = document.getElementById('timer');
const feedback = document.getElementById('feedback');
const finalScore = document.getElementById('final-score');
const correctCount = document.getElementById('correct-count');
const totalCount = document.getElementById('total-count');

// Generate multiplication table question
function generateQuestion() {
    // Exclude 1, 5, and 10 from both table and multiplier
    const allowedNumbers = [2, 3, 4, 6, 7, 8, 9];
    const table = allowedNumbers[Math.floor(Math.random() * allowedNumbers.length)];
    const multiplier = allowedNumbers[Math.floor(Math.random() * allowedNumbers.length)];
    const correctAnswer = table * multiplier;
    
    // Generate wrong answers
    const wrongAnswers = new Set();
    while (wrongAnswers.size < 3) {
        const wrong = correctAnswer + (Math.floor(Math.random() * 20) - 10);
        if (wrong !== correctAnswer && wrong > 0 && wrong <= 100) {
            wrongAnswers.add(wrong);
        }
    }
    
    // Combine and shuffle answers
    const answers = [correctAnswer, ...Array.from(wrongAnswers)];
    shuffleArray(answers);
    
    return {
        question: `${table} × ${multiplier} = ?`,
        correctAnswer: correctAnswer,
        answers: answers,
        correctIndex: answers.indexOf(correctAnswer)
    };
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Display question
function displayQuestion() {
    questionCount++;
    
    // End game after 20 questions
    if (questionCount > 20) {
        endGame();
        return;
    }
    
    currentQuestion = generateQuestion();
    questionText.textContent = currentQuestion.question;
    
    answerButtons.forEach((btn, index) => {
        btn.textContent = currentQuestion.answers[index];
        btn.classList.remove('correct', 'incorrect', 'disabled');
        btn.disabled = false;
    });
    
    feedback.textContent = '';
    feedback.className = 'feedback';
    isAnswered = false;
    timeLeft = 5;
    updateTimer();
    startTimer();
}

// Start timer
function startTimer() {
    timerFill.style.width = '100%';
    timerFill.className = 'timer-fill';
    
    const interval = setInterval(() => {
        if (isAnswered) {
            clearInterval(interval);
            return;
        }
        
        timeLeft -= 0.1;
        updateTimer();
        
        if (timeLeft <= 0) {
            clearInterval(interval);
            handleTimeout();
        }
    }, 100);
    
    timer = interval;
}

// Update timer display
function updateTimer() {
    const percentage = (timeLeft / 5) * 100;
    timerFill.style.width = percentage + '%';
    timerText.textContent = Math.ceil(timeLeft);
    
    // Change color based on time left
    if (timeLeft <= 1) {
        timerFill.className = 'timer-fill danger';
    } else if (timeLeft <= 2) {
        timerFill.className = 'timer-fill warning';
    } else {
        timerFill.className = 'timer-fill';
    }
}

// Handle timeout
function handleTimeout() {
    if (isAnswered) return;
    
    isAnswered = true;
    totalQuestions++;
    
    // Disable all buttons
    answerButtons.forEach(btn => {
        btn.classList.add('disabled');
        btn.disabled = true;
    });
    
    // Show correct answer
    answerButtons[currentQuestion.correctIndex].classList.add('correct');
    
    feedback.textContent = 'Tijd is op! Het juiste antwoord was: ' + currentQuestion.correctAnswer;
    feedback.className = 'feedback incorrect';
    
    // Move to next question after 2 seconds
    setTimeout(() => {
        displayQuestion();
    }, 2000);
}

// Handle answer selection
function handleAnswer(selectedIndex) {
    if (isAnswered) return;
    
    isAnswered = true;
    totalQuestions++;
    
    // Clear timer
    if (timer) {
        clearInterval(timer);
    }
    
    // Disable all buttons
    answerButtons.forEach(btn => {
        btn.classList.add('disabled');
        btn.disabled = true;
    });
    
    const isCorrect = selectedIndex === currentQuestion.correctIndex;
    
    if (isCorrect) {
        score += 10;
        correctAnswers++;
        answerButtons[selectedIndex].classList.add('correct');
        feedback.textContent = 'Goed gedaan! +10 punten';
        feedback.className = 'feedback correct';
        scoreDisplay.textContent = score;
    } else {
        answerButtons[selectedIndex].classList.add('incorrect');
        answerButtons[currentQuestion.correctIndex].classList.add('correct');
        feedback.textContent = 'Helaas! Het juiste antwoord was: ' + currentQuestion.correctAnswer;
        feedback.className = 'feedback incorrect';
    }
    
    // Move to next question after 2 seconds
    setTimeout(() => {
        displayQuestion();
    }, 2000);
}

// Start game
function startGame() {
    score = 0;
    correctAnswers = 0;
    totalQuestions = 0;
    questionCount = 0;
    scoreDisplay.textContent = score;
    
    startScreen.classList.remove('active');
    gameScreen.classList.add('active');
    endScreen.classList.remove('active');
    
    displayQuestion();
}

// End game
function endGame() {
    if (timer) {
        clearInterval(timer);
    }
    
    gameScreen.classList.remove('active');
    endScreen.classList.add('active');
    
    finalScore.textContent = score;
    correctCount.textContent = correctAnswers;
    totalCount.textContent = totalQuestions;
}

// Event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

answerButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        if (!isAnswered) {
            handleAnswer(index);
        }
    });
});

// Question counter
let questionCount = 0;

// Prevent zoom on double tap (iOS)
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);


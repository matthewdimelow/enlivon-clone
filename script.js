// Live Game Show Platform JavaScript

// Global variables
let currentGame = null;
let gameTimer = null;
let playerScore = 0;
let selectedAnswer = null;
let chatMessages = [];

// Sample game data
const gameData = {
    trivia: {
        title: "Trivia Night",
        questions: [
            {
                question: "What is the capital of France?",
                options: ["London", "Paris", "Berlin", "Madrid"],
                correct: 1
            },
            {
                question: "Which planet is known as the Red Planet?",
                options: ["Venus", "Mars", "Jupiter", "Saturn"],
                correct: 1
            },
            {
                question: "What is the largest ocean on Earth?",
                options: ["Atlantic", "Indian", "Arctic", "Pacific"],
                correct: 3
            },
            {
                question: "Who painted the Mona Lisa?",
                options: ["Van Gogh", "Da Vinci", "Picasso", "Rembrandt"],
                correct: 1
            },
            {
                question: "What is the chemical symbol for gold?",
                options: ["Ag", "Au", "Fe", "Cu"],
                correct: 1
            }
        ]
    },
    word: {
        title: "Word Master",
        questions: [
            {
                question: "Find a word that means 'happy'",
                options: ["Joyful", "Sad", "Angry", "Tired"],
                correct: 0
            },
            {
                question: "Which word is a synonym for 'big'?",
                options: ["Small", "Large", "Tiny", "Little"],
                correct: 1
            }
        ]
    },
    math: {
        title: "Math Challenge",
        questions: [
            {
                question: "What is 15 + 27?",
                options: ["40", "42", "43", "41"],
                correct: 1
            },
            {
                question: "What is 8 × 6?",
                options: ["48", "46", "50", "44"],
                correct: 0
            }
        ]
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    startLiveStats();
});

// Initialize the application
function initializeApp() {
    // Add smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add fade-in animations to sections
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        observer.observe(section);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Contact form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactForm();
        });
    }

    // Chat input enter key
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

// Start live stats updates
function startLiveStats() {
    setInterval(() => {
        updateLiveStats();
    }, 5000);
}

// Update live statistics
function updateLiveStats() {
    const playerCounts = document.querySelectorAll('.stat .number');
    playerCounts.forEach(count => {
        const currentCount = parseInt(count.textContent.replace(',', ''));
        const newCount = currentCount + Math.floor(Math.random() * 10) - 5;
        if (newCount > 0) {
            count.textContent = newCount.toLocaleString();
        }
    });
}

// Join a live show
function joinShow() {
    // Show a modal or redirect to available shows
    const gameInterface = document.getElementById('game-interface');
    if (gameInterface) {
        gameInterface.classList.remove('hidden');
        startRandomGame();
    }
}

// Host a show
function hostShow() {
    alert('Host functionality coming soon! This would open the host dashboard.');
}

// Join a specific show
function joinSpecificShow(gameType) {
    const gameInterface = document.getElementById('game-interface');
    if (gameInterface) {
        gameInterface.classList.remove('hidden');
        startGame(gameType);
    }
}

// Start a random game
function startRandomGame() {
    const gameTypes = ['trivia', 'word', 'math'];
    const randomGame = gameTypes[Math.floor(Math.random() * gameTypes.length)];
    startGame(randomGame);
}

// Start a specific game
function startGame(gameType) {
    currentGame = gameType;
    const gameData = getGameData(gameType);
    
    if (gameData) {
        document.getElementById('game-title').textContent = gameData.title;
        loadQuestion(0);
        startGameTimer();
        addChatMessage('Host', `Welcome to ${gameData.title}! Let's get started!`);
    }
}

// Get game data
function getGameData(gameType) {
    return gameData[gameType] || null;
}

// Load a question
function loadQuestion(questionIndex) {
    const gameData = getGameData(currentGame);
    if (!gameData || !gameData.questions[questionIndex]) {
        endGame();
        return;
    }

    const question = gameData.questions[questionIndex];
    document.getElementById('current-question').textContent = question.question;
    
    const optionsGrid = document.querySelector('.options-grid');
    optionsGrid.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = `${String.fromCharCode(65 + index)}) ${option}`;
        button.onclick = () => selectAnswer(index);
        optionsGrid.appendChild(button);
    });
}

// Select an answer
function selectAnswer(answerIndex) {
    if (selectedAnswer !== null) return; // Prevent multiple selections
    
    selectedAnswer = answerIndex;
    const buttons = document.querySelectorAll('.option-btn');
    
    buttons.forEach((button, index) => {
        if (index === answerIndex) {
            button.classList.add('selected');
        }
        button.disabled = true;
    });
    
    // Check if answer is correct
    const gameData = getGameData(currentGame);
    const currentQuestionIndex = getCurrentQuestionIndex();
    const question = gameData.questions[currentQuestionIndex];
    
    if (answerIndex === question.correct) {
        playerScore += 100;
        addChatMessage('System', 'Correct answer! +100 points');
        updateLeaderboard();
    } else {
        addChatMessage('System', 'Wrong answer! Better luck next time.');
    }
    
    // Show correct answer
    setTimeout(() => {
        buttons.forEach((button, index) => {
            if (index === question.correct) {
                button.style.background = '#10b981';
                button.style.color = 'white';
                button.style.borderColor = '#10b981';
            }
        });
    }, 1000);
    
    // Move to next question after delay
    setTimeout(() => {
        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex < gameData.questions.length) {
            loadQuestion(nextQuestionIndex);
            selectedAnswer = null;
        } else {
            endGame();
        }
    }, 3000);
}

// Get current question index
function getCurrentQuestionIndex() {
    const currentQuestion = document.getElementById('current-question').textContent;
    const gameData = getGameData(currentGame);
    return gameData.questions.findIndex(q => q.question === currentQuestion);
}

// Start game timer
function startGameTimer() {
    let timeLeft = 30;
    const timerElement = document.getElementById('time-left');
    
    gameTimer = setInterval(() => {
        timeLeft--;
        if (timerElement) {
            timerElement.textContent = timeLeft;
        }
        
        if (timeLeft <= 0) {
            clearInterval(gameTimer);
            if (selectedAnswer === null) {
                addChatMessage('System', 'Time\'s up! No answer selected.');
                setTimeout(() => {
                    const nextQuestionIndex = getCurrentQuestionIndex() + 1;
                    const gameData = getGameData(currentGame);
                    if (nextQuestionIndex < gameData.questions.length) {
                        loadQuestion(nextQuestionIndex);
                        selectedAnswer = null;
                        startGameTimer();
                    } else {
                        endGame();
                    }
                }, 2000);
            }
        }
    }, 1000);
}

// End the game
function endGame() {
    clearInterval(gameTimer);
    addChatMessage('Host', `Game over! Final score: ${playerScore} points`);
    
    // Show final results
    setTimeout(() => {
        const questionArea = document.querySelector('.question-area');
        questionArea.innerHTML = `
            <h3>Game Complete!</h3>
            <p>Your final score: ${playerScore} points</p>
            <button class="btn-primary" onclick="closeGame()">Back to Shows</button>
        `;
    }, 2000);
}

// Close the game
function closeGame() {
    const gameInterface = document.getElementById('game-interface');
    if (gameInterface) {
        gameInterface.classList.add('hidden');
        clearInterval(gameTimer);
        currentGame = null;
        playerScore = 0;
        selectedAnswer = null;
    }
}

// Send a chat message
function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    
    if (message) {
        const username = `Player${Math.floor(Math.random() * 1000)}`;
        addChatMessage(username, message);
        chatInput.value = '';
    }
}

// Add a chat message
function addChatMessage(username, message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    messageDiv.innerHTML = `
        <span class="username">${username}:</span>
        <span class="message">${message}</span>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Store message
    chatMessages.push({ username, message, timestamp: new Date() });
}

// Update leaderboard
function updateLeaderboard() {
    const leaderboardList = document.querySelector('.leaderboard-list');
    if (leaderboardList) {
        // Simulate updating leaderboard
        const items = leaderboardList.querySelectorAll('.leaderboard-item');
        items.forEach((item, index) => {
            const scoreElement = item.querySelector('.score');
            if (scoreElement) {
                const currentScore = parseInt(scoreElement.textContent);
                const newScore = currentScore + Math.floor(Math.random() * 50);
                scoreElement.textContent = `${newScore} pts`;
            }
        });
    }
}

// Handle contact form submission
function handleContactForm() {
    const form = document.querySelector('.contact-form');
    const formData = new FormData(form);
    
    // Simulate form submission
    alert('Thank you for your message! We\'ll get back to you soon.');
    form.reset();
}

// Become a host
function becomeHost() {
    alert('Host registration coming soon! This would open the host registration form.');
}

// Smooth scrolling for navigation
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Add loading animation
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loadingDiv);
}

function hideLoading() {
    const loadingDiv = document.querySelector('.loading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Add CSS for loading animation
const loadingCSS = `
.loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #6366f1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;

// Inject loading CSS
const style = document.createElement('style');
style.textContent = loadingCSS;
document.head.appendChild(style);

// Add mobile menu functionality
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.querySelector('.nav-toggle');
    
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
}

// Add mobile menu CSS
const mobileMenuCSS = `
@media (max-width: 768px) {
    .nav-menu {
        position: fixed;
        top: 100%;
        left: 0;
        width: 100%;
        background: white;
        flex-direction: column;
        padding: 2rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        transform: translateY(-100%);
        transition: transform 0.3s ease;
    }
    
    .nav-menu.active {
        transform: translateY(0);
    }
    
    .nav-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .nav-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .nav-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
}
`;

// Inject mobile menu CSS
const mobileStyle = document.createElement('style');
mobileStyle.textContent = mobileMenuCSS;
document.head.appendChild(mobileStyle);

// Add mobile menu event listener
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileMenu);
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to close game
    if (e.key === 'Escape') {
        const gameInterface = document.getElementById('game-interface');
        if (gameInterface && !gameInterface.classList.contains('hidden')) {
            closeGame();
        }
    }
    
    // Number keys 1-4 to select answers
    if (e.key >= '1' && e.key <= '4') {
        const answerIndex = parseInt(e.key) - 1;
        const optionButtons = document.querySelectorAll('.option-btn');
        if (optionButtons[answerIndex] && !optionButtons[answerIndex].disabled) {
            selectAnswer(answerIndex);
        }
    }
});

// Add auto-scroll for chat
function autoScrollChat() {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Add periodic chat messages (simulation)
setInterval(() => {
    if (currentGame && Math.random() < 0.3) {
        const messages = [
            "Great game everyone!",
            "This is so much fun!",
            "I'm learning a lot!",
            "Can't wait for the next question!",
            "This is my first time playing!",
            "I love this game show!"
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        const randomPlayer = `Player${Math.floor(Math.random() * 1000)}`;
        addChatMessage(randomPlayer, randomMessage);
    }
}, 10000);

// Add sound effects (placeholder)
function playSound(type) {
    // This would integrate with actual sound files
    console.log(`Playing ${type} sound`);
}

// Add notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add notification CSS
const notificationCSS = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #6366f1;
    color: white;
    padding: 1rem 2rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 10000;
}

.notification.show {
    transform: translateX(0);
}

.notification.success {
    background: #10b981;
}

.notification.error {
    background: #ef4444;
}
`;

// Inject notification CSS
const notificationStyle = document.createElement('style');
notificationStyle.textContent = notificationCSS;
document.head.appendChild(notificationStyle);

// Export functions for global access
window.joinShow = joinShow;
window.hostShow = hostShow;
window.joinSpecificShow = joinSpecificShow;
window.closeGame = closeGame;
window.sendMessage = sendMessage;
window.becomeHost = becomeHost;
window.selectAnswer = selectAnswer;

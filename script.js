// Game configuration and state variables
let WINNING_SCORE = 20;      // Minimum score needed to win (changes with difficulty)
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;          // Holds the interval for spawning items
let timerInterval;          // Holds the interval for countdown timer
let GAME_DURATION = 30;      // Total seconds per round (changes with difficulty)
let timeLeft = GAME_DURATION;

// Difficulty mode configuration
const DIFFICULTY_SETTINGS = {
  easy: {
    winningScore: 15,
    gameDuration: 30,
    label: 'Easy: Collect 15 cans before time runs out to win!'
  },
  medium: {
    winningScore: 20,
    gameDuration: 25,
    label: 'Medium: Collect 20 cans before time runs out to win!'
  },
  hard: {
    winningScore: 30,
    gameDuration: 20,
    label: 'Hard: Collect 30 cans before time runs out to win!'
  }
};

let selectedDifficulty = 'medium'; // Default to medium

const startButton = document.getElementById('start-game');
const endButton = document.getElementById('end-game');
const achievements = document.getElementById('achievements');
const difficultySelector = document.getElementById('difficulty');
const instructionsElement = document.getElementById('instructions');
const winSound = document.getElementById('win-sound');
const lossSound = document.getElementById('loss-sound');

const winningMessages = [
  'Winner!',
  'Amazing work! You brought water to more families.',
  'Mission complete! You crushed Water Quest.'
];

const losingMessages = [
  'Try again...',
  'Almost there. Give it another shot!',
  'Keep going, every can counts. Try again!'
];

const resultImages = ['img/cw_logo_horizontal.png'];

function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function showGameResult(finalScore) {
  const didWin = finalScore >= WINNING_SCORE;
  const message = didWin ? getRandomItem(winningMessages) : getRandomItem(losingMessages);
  const imageSrc = getRandomItem(resultImages);

  // Play win or loss sound
  if (didWin) {
    winSound.currentTime = 0;
    winSound.play().catch(e => console.log('Win sound play failed:', e));
  } else {
    lossSound.currentTime = 0;
    lossSound.play().catch(e => console.log('Loss sound play failed:', e));
  }

  achievements.innerHTML = `
    <p class="achievement-message">${message}</p>
    <img class="achievement-image" src="${imageSrc}" alt="Game result image" />
  `;
}

function updateTimerDisplay() {
  const timer = document.getElementById('timer');
  if (timer) {
    timer.textContent = timeLeft;
  }
}

function updateCanCounter() {
  const counter = document.getElementById('current-cans');
  if (counter) {
    counter.textContent = currentCans;
  }
}

// Creates the 3x3 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = ''; // Clear any existing grid cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
}

// Ensure the grid is created when the page loads
createGrid();

// Spawns a new item in a random grid cell
function spawnWaterCan() {
  if (!gameActive) return; // Stop if the game is not active
  const cells = document.querySelectorAll('.grid-cell');
  
  // Clear all cells before spawning a new water can
  cells.forEach(cell => (cell.innerHTML = ''));

  // Select a random cell from the grid to place the water can
  const randomCell = cells[Math.floor(Math.random() * cells.length)];

  // Use a template literal to create the wrapper and water-can element
  randomCell.innerHTML = `
    <div class="water-can-wrapper">
      <div class="water-can"></div>
    </div>
  `;
}

// Initializes and starts a new game
function startGame() {
  if (gameActive) return; // Prevent starting a new game if one is already active
  
  // Apply selected difficulty settings
  selectedDifficulty = difficultySelector.value;
  const settings = DIFFICULTY_SETTINGS[selectedDifficulty];
  WINNING_SCORE = settings.winningScore;
  GAME_DURATION = settings.gameDuration;
  
  gameActive = true;
  currentCans = 0;
  timeLeft = GAME_DURATION;
  achievements.textContent = '';
  difficultySelector.disabled = true; // Disable selector during game
  updateCanCounter();
  updateTimerDisplay();
  createGrid(); // Set up the game grid
  endButton.hidden = false;

  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  spawnInterval = setInterval(spawnWaterCan, 1000); // Spawn water cans every second
  timerInterval = setInterval(() => {
    if (!gameActive) return;

    timeLeft -= 1;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  const finalScore = currentCans;
  gameActive = false; // Mark the game as inactive
  clearInterval(spawnInterval); // Stop spawning water cans
  clearInterval(timerInterval); // Stop countdown timer
  document.querySelectorAll('.grid-cell').forEach(cell => (cell.innerHTML = ''));
  showGameResult(finalScore);
  timeLeft = GAME_DURATION;
  updateTimerDisplay();
  endButton.hidden = true;
  difficultySelector.disabled = false; // Re-enable selector for next game
}

// Set up click handler for the start button
startButton.addEventListener('click', startGame);
endButton.addEventListener('click', endGame);

// Update instructions when difficulty changes
difficultySelector.addEventListener('change', () => {
  const settings = DIFFICULTY_SETTINGS[difficultySelector.value];
  instructionsElement.textContent = settings.label;
});

// Increment cans when a visible water can is clicked
document.querySelector('.game-grid').addEventListener('click', (event) => {
  if (!gameActive) return;

  const clickedCell = event.target.closest('.grid-cell');
  if (!clickedCell || !clickedCell.querySelector('.water-can-wrapper')) return;

  currentCans += 1;
  updateCanCounter();
  clickedCell.innerHTML = '';
});

// Initialize instructions with default difficulty
const defaultSettings = DIFFICULTY_SETTINGS[selectedDifficulty];
instructionsElement.textContent = defaultSettings.label;
updateCanCounter();
updateTimerDisplay();

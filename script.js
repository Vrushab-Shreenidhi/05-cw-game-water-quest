// Game configuration and state variables
const DIFFICULTY_SETTINGS = {
  easy: {
    label: 'Easy',
    winningScore: 15,
    gameDuration: 35,
    spawnRate: 1200
  },
  medium: {
    label: 'Medium',
    winningScore: 20,
    gameDuration: 30,
    spawnRate: 1000
  },
  hard: {
    label: 'Hard',
    winningScore: 25,
    gameDuration: 25,
    spawnRate: 700
  }
};

let currentDifficulty = 'medium';
let winningScore = DIFFICULTY_SETTINGS[currentDifficulty].winningScore;
let gameDuration = DIFFICULTY_SETTINGS[currentDifficulty].gameDuration;
let spawnRate = DIFFICULTY_SETTINGS[currentDifficulty].spawnRate;
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;           // Holds the interval for spawning items
let timerInterval;           // Holds the interval for countdown timer
let timeLeft = gameDuration;

const startButton = document.getElementById('start-game');
const endButton = document.getElementById('end-game');
const achievements = document.getElementById('achievements');
const gameInstructions = document.querySelector('.game-instructions');
const difficultySelect = document.getElementById('difficulty-select');
const winSound = new Audio('wonsound.mp3');
const lossSound = new Audio('losssound.mp3');

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

function updateInstructionText() {
  const difficultyLabel = DIFFICULTY_SETTINGS[currentDifficulty].label;
  if (gameInstructions) {
    gameInstructions.textContent = `${difficultyLabel} mode: Collect ${winningScore} or more cans before time runs out to win!`;
  }
}

function applyDifficultySettings() {
  currentDifficulty = difficultySelect.value;
  const settings = DIFFICULTY_SETTINGS[currentDifficulty];
  winningScore = settings.winningScore;
  gameDuration = settings.gameDuration;
  spawnRate = settings.spawnRate;
  timeLeft = gameDuration;
  updateTimerDisplay();
  updateInstructionText();
}

function showGameResult(finalScore) {
  const didWin = finalScore >= winningScore;
  const message = didWin ? getRandomItem(winningMessages) : getRandomItem(losingMessages);
  const imageSrc = getRandomItem(resultImages);

  achievements.innerHTML = `
    <p class="achievement-message">${message}</p>
    <img class="achievement-image" src="${imageSrc}" alt="Game result image" />
  `;

  const resultSound = didWin ? winSound : lossSound;
  resultSound.currentTime = 0;
  resultSound.play().catch(() => {
    // Ignore playback failures (for example, if the browser blocks autoplay).
  });
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
  applyDifficultySettings();
  gameActive = true;
  currentCans = 0;
  timeLeft = gameDuration;
  achievements.textContent = '';
  difficultySelect.disabled = true;
  updateCanCounter();
  updateTimerDisplay();
  createGrid(); // Set up the game grid
  endButton.hidden = false;

  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  spawnInterval = setInterval(spawnWaterCan, spawnRate);
  timerInterval = setInterval(() => {
    if (!gameActive) return;

    timeLeft -= 1;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame(showResult = true) {
  const finalScore = currentCans;
  gameActive = false; // Mark the game as inactive
  clearInterval(spawnInterval); // Stop spawning water cans
  clearInterval(timerInterval); // Stop countdown timer
  difficultySelect.disabled = false;
  document.querySelectorAll('.grid-cell').forEach(cell => (cell.innerHTML = ''));

  if (showResult) {
    showGameResult(finalScore);
  } else {
    achievements.innerHTML = '';
  }

  timeLeft = gameDuration;
  updateTimerDisplay();
  endButton.hidden = true;
}

// Set up click handler for the start button
startButton.addEventListener('click', startGame);
endButton.addEventListener('click', () => endGame(false));
difficultySelect.addEventListener('change', () => {
  if (!gameActive) {
    applyDifficultySettings();
  }
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

updateCanCounter();
applyDifficultySettings();

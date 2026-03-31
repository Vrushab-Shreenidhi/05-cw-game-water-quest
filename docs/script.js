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

let currentCans = 0;
let gameActive = false;
let spawnInterval;
let timerInterval;
let currentDifficulty = 'medium';
let timeLeft = DIFFICULTY_SETTINGS[currentDifficulty].gameDuration;

const startButton = document.getElementById('start-game');
const endButton = document.getElementById('end-game');
const achievements = document.getElementById('achievements');
const difficultySelect = document.getElementById('difficulty');
const instructions = document.getElementById('game-instructions');

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

const resultImages = ['https://raw.githubusercontent.com/Vrushab-Shreenidhi/05-cw-game-water-quest/main/img/cw_logo_horizontal.png'];

function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function showGameResult(finalScore) {
  const difficultyConfig = DIFFICULTY_SETTINGS[currentDifficulty];
  const didWin = finalScore >= difficultyConfig.winningScore;
  const message = didWin ? getRandomItem(winningMessages) : getRandomItem(losingMessages);
  const imageSrc = getRandomItem(resultImages);

  achievements.innerHTML = `
    <p class="achievement-message">${message}</p>
    <img class="achievement-image" src="${imageSrc}" alt="Game result image" />
  `;
}

function updateInstructions() {
  const difficultyConfig = DIFFICULTY_SETTINGS[currentDifficulty];
  if (!instructions) return;
  instructions.textContent = `Mode: ${difficultyConfig.label}. Collect ${difficultyConfig.winningScore} or more cans in ${difficultyConfig.gameDuration}s to win!`;
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

function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    grid.appendChild(cell);
  }
}

createGrid();

function spawnWaterCan() {
  if (!gameActive) return;
  const cells = document.querySelectorAll('.grid-cell');

  cells.forEach(cell => (cell.innerHTML = ''));

  const randomCell = cells[Math.floor(Math.random() * cells.length)];

  randomCell.innerHTML = `
    <div class="water-can-wrapper">
      <div class="water-can"></div>
    </div>
  `;
}

function startGame() {
  if (gameActive) return;
  const selectedDifficulty = difficultySelect ? difficultySelect.value : currentDifficulty;
  currentDifficulty = DIFFICULTY_SETTINGS[selectedDifficulty] ? selectedDifficulty : 'medium';
  const difficultyConfig = DIFFICULTY_SETTINGS[currentDifficulty];

  gameActive = true;
  currentCans = 0;
  timeLeft = difficultyConfig.gameDuration;
  achievements.textContent = '';
  updateCanCounter();
  updateTimerDisplay();
  updateInstructions();
  createGrid();
  endButton.hidden = false;
  if (difficultySelect) {
    difficultySelect.disabled = true;
  }

  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  spawnInterval = setInterval(spawnWaterCan, difficultyConfig.spawnRate);
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
  const difficultyConfig = DIFFICULTY_SETTINGS[currentDifficulty];
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  document.querySelectorAll('.grid-cell').forEach(cell => (cell.innerHTML = ''));
  showGameResult(finalScore);
  timeLeft = difficultyConfig.gameDuration;
  updateTimerDisplay();
  endButton.hidden = true;
  if (difficultySelect) {
    difficultySelect.disabled = false;
  }
}

startButton.addEventListener('click', startGame);
endButton.addEventListener('click', endGame);
if (difficultySelect) {
  difficultySelect.addEventListener('change', (event) => {
    currentDifficulty = event.target.value;
    const difficultyConfig = DIFFICULTY_SETTINGS[currentDifficulty];
    timeLeft = difficultyConfig.gameDuration;
    updateTimerDisplay();
    updateInstructions();
  });
}

document.querySelector('.game-grid').addEventListener('click', (event) => {
  if (!gameActive) return;

  const clickedCell = event.target.closest('.grid-cell');
  if (!clickedCell || !clickedCell.querySelector('.water-can-wrapper')) return;

  currentCans += 1;
  updateCanCounter();
  clickedCell.innerHTML = '';
});

updateCanCounter();
updateInstructions();
updateTimerDisplay();

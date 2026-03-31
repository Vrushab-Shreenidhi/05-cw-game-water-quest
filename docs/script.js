// Game configuration and state variables
const WINNING_SCORE = 20;
let currentCans = 0;
let gameActive = false;
let spawnInterval;
let timerInterval;
const GAME_DURATION = 30;
let timeLeft = GAME_DURATION;

const startButton = document.getElementById('start-game');
const endButton = document.getElementById('end-game');
const achievements = document.getElementById('achievements');

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
  const didWin = finalScore >= WINNING_SCORE;
  const message = didWin ? getRandomItem(winningMessages) : getRandomItem(losingMessages);
  const imageSrc = getRandomItem(resultImages);

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
  gameActive = true;
  currentCans = 0;
  timeLeft = GAME_DURATION;
  achievements.textContent = '';
  updateCanCounter();
  updateTimerDisplay();
  createGrid();
  endButton.hidden = false;

  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  spawnInterval = setInterval(spawnWaterCan, 1000);
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
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  document.querySelectorAll('.grid-cell').forEach(cell => (cell.innerHTML = ''));
  showGameResult(finalScore);
  timeLeft = GAME_DURATION;
  updateTimerDisplay();
  endButton.hidden = true;
}

startButton.addEventListener('click', startGame);
endButton.addEventListener('click', endGame);

document.querySelector('.game-grid').addEventListener('click', (event) => {
  if (!gameActive) return;

  const clickedCell = event.target.closest('.grid-cell');
  if (!clickedCell || !clickedCell.querySelector('.water-can-wrapper')) return;

  currentCans += 1;
  updateCanCounter();
  clickedCell.innerHTML = '';
});

updateCanCounter();
updateTimerDisplay();

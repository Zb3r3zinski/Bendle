const GRID = document.getElementById('grid');
const INPUT = document.getElementById('guess');
const SUBMIT = document.getElementById('submit');
const MESSAGE = document.getElementById('message');
const NEWGAME = document.getElementById('new-game');

let characters = [];
let target = null;
let guesses = [];
let gameOver = false;

async function loadData() {
  const res = await fetch('data.json');
  characters = await res.json();
  startGame();
}
loadData();

function startGame() {
  target = characters[Math.floor(Math.random()*characters.length)];
  guesses = [];
  gameOver = false;
  renderGrid();
  MESSAGE.textContent = '';
  NEWGAME.style.display = 'none';
  INPUT.value = '';
  INPUT.focus();
}

function renderGrid() {
  GRID.innerHTML = '';
  const rows = guesses.length ? guesses : [[]];
  const maxRows = 6;

  for (let r = 0; r < maxRows; r++) {
    const row = rows[r] || [];
    for (let c = 0; c < 5; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      if (row[c]) {
        cell.textContent = row[c].value;
        cell.classList.add(row[c].status);
      }
      GRID.appendChild(cell);
    }
  }
}

function evaluateGuess(guessName) {
  const guess = characters.find(ch => ch.name.toLowerCase() === guessName.toLowerCase());
  if (!guess) return null;

  const result = [
    { value: guess.species, status: guess.species === target.species ? 'green' : characters.some(ch => ch.species === guess.species) ? 'yellow' : 'gray' },
    { value: guess.planet,  status: guess.planet  === target.planet  ? 'green' : characters.some(ch => ch.planet  === guess.planet)  ? 'yellow' : 'gray' },
    { value: guess.firstAppearance, status: guess.firstAppearance === target.firstAppearance ? 'green' : characters.some(ch => ch.firstAppearance === guess.firstAppearance) ? 'yellow' : 'gray' },
    { value: '▼', status: compareOrder(guess, target) },
    { value: 'IMG', status: 'gray' } // obrazek zawsze szary (nie zdradza)
  ];
  return result;
}

function compareOrder(a,b) {
  const idxA = characters.indexOf(a);
  const idxB = characters.indexOf(b);
  if (idxA === idxB) return 'green';
  return idxA < idxB ? 'yellow' : 'gray';
}

SUBMIT.addEventListener('click', submitGuess);
INPUT.addEventListener('keypress', e => { if (e.key === 'Enter') submitGuess(); });

function submitGuess() {
  if (gameOver) return;
  const name = INPUT.value.trim();
  if (!name) return;

  const evaluation = evaluateGuess(name);
  if (!evaluation) {
    MESSAGE.textContent = 'Nie ma takiego obcego!';
    return;
  }

  guesses.push(evaluation);
  renderGrid();
  INPUT.value = '';

  if (name.toLowerCase() === target.name.toLowerCase()) {
    gameOver = true;
    MESSAGE.textContent = `Brawo! To ${target.name}!`;
    NEWGAME.style.display = 'block';
  } else if (guesses.length >= 6) {
    gameOver = true;
    MESSAGE.textContent = `Przegrałeś! Poprawna odpowiedź: ${target.name}`;
    NEWGAME.style.display = 'block';
  } else {
    MESSAGE.textContent = '';
  }
}

NEWGAME.addEventListener('click', startGame);

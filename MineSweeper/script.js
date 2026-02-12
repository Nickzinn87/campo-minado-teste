const board = document.getElementById("board");

const size = 20;        
const minesCount = 100;

const winCondition = (size * size) - minesCount
let revealedCells = 0

let cells = [];
let firstClick = true;

// ======================
// CRIAR TABULEIRO
// ======================
function createBoard() {
  board.innerHTML = "";
  cells = [];
  firstClick = true;
  revealedCells = 0;

  board.style.gridTemplateColumns = `repeat(${size}, 40px)`;

  for (let i = 0; i < size * size; i++) {
    const div = document.createElement("div");
    div.classList.add("cell");

    div.addEventListener("click", () => revealCell(i));

    div.addEventListener("contextmenu", function(event) {
      event.preventDefault();
      flagCell(i);
    });

    board.appendChild(div);

    cells.push({
      element: div,
      mine: false,
      revealed: false,
      adjacent: 0,
      flagged: false
    });
  }
}

// ======================
// COLOCAR MINAS (SEGURAS)
// ======================
function placeMinesSafe(startIndex) {
  const forbidden = new Set([
    startIndex,
    ...getNeighbors(startIndex)
  ]);

  let placed = 0;

  while (placed < minesCount) {
    const index = Math.floor(Math.random() * cells.length);

    if (forbidden.has(index)) continue;
    if (cells[index].mine) continue;

    cells[index].mine = true;
    placed++;
  }
}

// ======================
// CALCULAR ADJACENTES
// ======================
function calculateAdjacents() {
  cells.forEach((cell, index) => {
    if (cell.mine) return;

    cell.adjacent = 0;

    getNeighbors(index).forEach(n => {
      if (cells[n].mine) {
        cell.adjacent++;
      }
    });
  });
}

// ======================
// PEGAR VIZINHOS
// ======================
function getNeighbors(index) {
  const neighbors = [];
  const row = Math.floor(index / size);
  const col = index % size;

  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      if (r === 0 && c === 0) continue;

      const newRow = row + r;
      const newCol = col + c;

      if (
        newRow >= 0 && newRow < size &&
        newCol >= 0 && newCol < size
      ) {
        neighbors.push(newRow * size + newCol);
      }
    }
  }

  return neighbors;
}

// ======================
// REVELAR CÉLULA
// ======================
function revealCell(index) {
  const cell = cells[index];
  if (!cell) return;

  // 🟡 CHORDING (clicar em número já revelado)
  if (cell.revealed) {

    if (cell.adjacent > 0) {
      const neighbors = getNeighbors(index);
      const flaggedCount = neighbors.filter(n => cells[n].flagged).length;

      if (flaggedCount === cell.adjacent) {
        neighbors.forEach(n => {
          if (!cells[n].flagged && !cells[n].revealed) {
            revealCell(n);
          }
        });
      }
    }

    return;
  }

  if (cell.flagged) return;

  // 🟢 PRIMEIRO CLIQUE
  if (firstClick) {
    firstClick = false;
    placeMinesSafe(index);
    calculateAdjacents();
  }

  cell.revealed = true;
  cell.element.classList.add("revealed");

  // 💣 GAME OVER
  if (cell.mine) {
    cell.element.textContent = "💣";
    cell.element.classList.add("mine");

    // revelar todas as minas
    cells.forEach(c => {
      if (c.mine) {
        c.element.textContent = "💣";
        c.element.classList.add("mine");
      }
    });

    setTimeout(() => {
      alert("💥 Game Over!");
      location.reload();
    }, 300);

    return;
  }

  revealedCells++;
  document.getElementById("reveledCells").textContent = revealedCells;

  if (revealedCells >= winCondition) {
    setTimeout(() => {
      alert("🏆 You Win Boooi!");
      location.reload();
    }, 300);
    return;
  }

  // 🔢 MOSTRAR NÚMERO
  if (cell.adjacent > 0) {
    cell.element.textContent = cell.adjacent;
    return;
  }

  // 🌊 CASCATA (adjacent === 0)
  getNeighbors(index).forEach(revealCell);
}

// ======================
// BANDEIRA
// ======================
function flagCell(index) {
  const cell = cells[index];
  if (!cell || cell.revealed) return;

  if (!cell.flagged) {
    cell.flagged = true;
    cell.element.textContent = "🚩";
  } else {
    cell.flagged = false;
    cell.element.textContent = "";
  }
}

// ======================
createBoard();

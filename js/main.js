const GameBoard = () => {
  const B = false;
  const board = [B, B, B, B, B, B, B, B, B];

  function getBoard() {
    return board;
  }

  function updateBoard(position, token) {
    // return false (exit_status), if position is taken
    if (board[position]) return false;

    board[position] = token;
    return true;
  }

  return {
    getBoard,
    updateBoard,
  };
};

const GameController = (player0, player1) => {
  const board = GameBoard();
  let activePlayer = 0;
  let winner = false;
  const players = [
    {
      name: player0,
      token: "X",
    },
    {
      name: player1,
      token: "O",
    },
  ];

  function switchActivePlayer() {
    activePlayer = activePlayer === 0 ? 1 : 0;
  }

  function isDraw() {
    const boardValues = board.getBoard();
    return boardValues.every((val) => val && true);
  }

  function playRound(position) {
    // exit_status
    const status = board.updateBoard(position, players[activePlayer].token);

    if (!status) return false;
    updateWinner();
    switchActivePlayer();
    return true;
  }

  function getActivePlayer() {
    return players[activePlayer].name;
  }

  function updateWinner() {
    // winning combinations
    const combos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],

      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],

      [0, 4, 8],
      [2, 4, 6],
    ];

    const boardValues = board.getBoard();

    const comboValues = combos.map((combo) => {
      return combo.map((position) => boardValues[position]);
    });

    const won = comboValues.some((values) => {
      return values.every((val) => val === players[activePlayer].token);
    });

    if (won) {
      winner = players[activePlayer].name;
    }
  }

  function getWinner() {
    return winner;
  }

  return {
    getBoard: board.getBoard,
    getActivePlayer,
    playRound,
    getWinner,
    isDraw,
  };
};

const Settings = (() => {
  function getPlayerX() {
    const player = localStorage.getItem("playerX");
    if (!player) return "X";
    return player;
  }

  function getPlayerO() {
    const player = localStorage.getItem("playerO");
    if (!player) return "O";
    return player;
  }

  function setPlayerX(player) {
    localStorage.setItem("playerX", player);
  }

  function setPlayerO(player) {
    localStorage.setItem("playerO", player);
  }

  return {
    getPlayerO,
    getPlayerX,
    setPlayerO,
    setPlayerX,
  };
})();

const ScreenController = () => {
  const settings = Settings;
  let game = GameController(settings.getPlayerX(), settings.getPlayerO());

  function updateScreen() {
    const positions = [...document.querySelectorAll("[data-position]")];
    const board = game.getBoard();

    positions.forEach((element) => {
      const position = element.getAttribute("data-position");

      if (!board[position]) {
        element.textContent = "";
        return;
      }

      element.textContent = board[position];
    });

    const turn = document.querySelector("#turn");

    if (game.getWinner()) {
      turn.textContent = game.getWinner() + " won !";
      return;
    }

    if (game.isDraw()) {
      turn.textContent = "It's a draw";
      return;
    }

    turn.textContent = "It's " + game.getActivePlayer() + " turn";
  }

  function addEvents() {
    const positions = [...document.querySelectorAll("[data-position]")];

    positions.forEach((position) => {
      position.addEventListener("click", clickHandlerPosition);
    });

    const restartButton = document.querySelector("button#restart");
    restartButton.addEventListener("click", clickHandlerRestart);

    const settingsButton = document.querySelector("button#settings-button");
    settingsButton.addEventListener("click", clickHandlerSettings);

    const form = document.querySelector("form#settings-dialog");
    form.addEventListener("submit", formSubmitHandler);
  }

  function formSubmitHandler(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const playerX = formData.get("settings-playerx");
    const playerO = formData.get("settings-playero");

    settings.setPlayerX(playerX);
    settings.setPlayerO(playerO);

    form.reset();
    document.querySelector("dialog").close();
  }

  function clickHandlerPosition(e) {
    if (game.getWinner() || game.isDraw()) return;

    if (game.playRound(e.target.getAttribute("data-position"))) {
      updateScreen();
    }
  }

  function clickHandlerSettings(_) {
    document.querySelector("dialog").showModal();

    const inputPlayerX = document.querySelector("input#settings-playerx");
    const inputPlayerO = document.querySelector("input#settings-playero");

    inputPlayerX.value = settings.getPlayerX();
    inputPlayerO.value = settings.getPlayerO();
  }

  function clickHandlerRestart() {
    game = GameController(settings.getPlayerX(), settings.getPlayerO());
    updateScreen();
  }

  updateScreen();
  addEvents();
};

ScreenController();

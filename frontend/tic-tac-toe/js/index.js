const HUMAN_ID = 0;
const AI_ID = 1;

const GAME_SYMBOLS = {
  'X': HUMAN_ID,
  'O': AI_ID
}

const BOARD_LENGTH = 9;

class Game {
  constructor() {
    this.playerScore = 0;
    this.computerScore = 0;

    this.reset();
  }

  reset() {
    this.turn = null;
    this.board = new Board();

    this._updateInfoBoard();
    this.board.renderBoard((squareId) => this._onSquareClick(squareId));

    this._endTurn();
  }

  /**
   * Callback for square click event
   *
   * @callback onSquareClickCallback
   * @param {number} squareId
   */
  _onSquareClick(squareId) {
    if (this.board.canPlay(squareId) && this.turn === HUMAN_ID) {
      this.board.makeMove(squareId, HUMAN_ID);

      this._endTurn();
    }
  }

  _computerTurn() {
    setTimeout(() => {
      const aiMove = this._findAiMove();

      this.board.makeMove(aiMove, AI_ID);

      this._endTurn();
    }, 300);
  }

  /**
   * Returns the AI move square Id
   *
   * @returns {number} The calculated square Id
   */
  _findAiMove() {
    const { availableMoves } = this.board.status;
    const algorithmDepth = 10;

    const moveRank = Object.keys(availableMoves).map(move => {
      const board = new Board(this.board.rawBoard);
      board.simulateMove(move, AI_ID);

      const moveScore = this._negamax(
        board,
        algorithmDepth,
        Number.NEGATIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        HUMAN_ID
      );

      return [move, moveScore];
    });

    let bestScore = Number.POSITIVE_INFINITY;

    const bestMoves = moveRank.reduce((acc, [move, score]) => {
      if (Math.min(bestScore, score) === score) {
        bestScore = score;

        acc.length = 0;
        acc.push(move);
      } else if (bestScore === score) {
        acc.push(move);
      }

      return acc;
    }, []);

    let candidateMove = null;

    if (bestMoves.length === 1) {
      candidateMove = bestMoves[0];
    } else {
      candidateMove = bestMoves.splice(Math.floor(Math.random() * bestMoves.length), 1);
    }

    return candidateMove;
  }

  /**
   * The AI algorithm implementation
   *
   * [Negamax Reference](https://en.wikipedia.org/wiki/Negamax)
   *
   * @param {Board} board The board state
   * @param {number} depth The algorithm depth
   * @param {number} alpha alpha pruning
   * @param {number} beta beta prouning
   * @param {HUMAN_ID | AI_ID} playerId current player Id
   */
  _negamax(board, depth, alpha, beta, playerId) {
    const { status: nodeStatus } = board;

    if (depth === 0 || nodeStatus.isOver) {
      let nodeHeuristicValue = 0;

      if (!nodeStatus.isTie) {
        if (nodeStatus.winnerId === playerId) {
          nodeHeuristicValue = 100 - depth;
        } else {
          nodeHeuristicValue = -100 - depth;
        }
      }

      return nodeHeuristicValue;
    }

    let value = Number.NEGATIVE_INFINITY;

    Object.keys(nodeStatus.availableMoves).forEach(move => {
      board.simulateMove(move, playerId);

      const nextPlayer = (playerId === HUMAN_ID) ? AI_ID : HUMAN_ID;

      value = Math.max(value, -this._negamax(board, depth - 1, -beta, -alpha, nextPlayer));
      alpha = Math.max(alpha, value);

      board.undoMove(move);

      if (alpha >= beta) {
        return; // cut-off
      }

    });

    return value;
  }

  _endTurn() {
    const { isOver, winnerId, isTie } = this.board.status;

    if (isOver) {
      if(winnerId === HUMAN_ID) {
        this._updateGameStatusBoard('You\'ve won!');
        this.playerScore++;

      }
      else if(winnerId === AI_ID) {
        this._updateGameStatusBoard('You\'ve lost!');
        this.computerScore++;
      }
      else if(isTie) {
        this._updateGameStatusBoard('There is a draw!');
      }

      setTimeout(() => {
        this._updateInfoBoard();

        this.reset();
      }, 2000);
    }
    else {
      if (this.turn === HUMAN_ID) {
        this._updateGameStatusBoard('AI turn');

        this._toggleBoard(true);

        this.turn = AI_ID;
        this._computerTurn();
      } else {
        this._updateGameStatusBoard('Your turn');

        this._toggleBoard();

        this.turn = HUMAN_ID;
      }
    }
  }

  _updateInfoBoard() {
    const aiScoreBoard = document.getElementById('bot-score-board');
    aiScoreBoard.innerText = this.computerScore;

    const humanScoreBoard = document.getElementById('human-score-board');
    humanScoreBoard.innerText = this.playerScore;
  }

  _toggleBoard(disableIt = false) {
    const container = document.getElementById('game-container');

    if (disableIt) {
      container.classList.add('disabled');
    } else {
      container.classList.remove('disabled');
    }
  }

  _updateGameStatusBoard(text) {
    const statusBoard = document.getElementById('game-status-board');

    statusBoard.innerText = text;
  }

  static getPlayerSymbol(playerId) {
    return Object.keys(GAME_SYMBOLS).filter(objKey => GAME_SYMBOLS[objKey] === playerId);
  }
}

class Board {
  /**
   * Initial board state
   *
   * @constructor
   * @typedef {Array<HUMAN_ID | AI_ID | undefined>} boardArray
   * @param {boardArray} board
   */
  constructor(board = Array.from({ length: BOARD_LENGTH })) {
    /**
     * The board data array.
     * Each array item represents an square.
     * If the square is empty then its value will be equal to `undefined`.
     * If the square is not empty then its value will be equal to the player Id which played
     * in that square.
     *
     * @type {boardArray}
     */
    this.rawBoard = board;
  }

  /**
   * Gets the board status obj
   */
  get status() {
    const winner = this._winner;
    const avMoves = this._getAvailableMoves();
    const avMovesCount = Object.keys(avMoves).length;

    return {
      winnerId: winner,
      availableMoves: avMoves,
      isTie: winner === null && avMovesCount === 0,
      isOver: winner !== null || avMovesCount === 0
    }
  }


  /**
   * Mutates the current state and updates the specified square with the player Id.
   * This function also renders the player symbol in the specified square.
   *
   * @param {number} squareId
   * @param {HUMAN_ID | AI_ID} playerId
   */
  makeMove(squareId, playerId) {
    const newBoard = [...this.rawBoard];
    newBoard[squareId] = playerId;

    const square = document.querySelector(`.square[data-id="${squareId}"]`);
    square.innerText = Game.getPlayerSymbol(playerId);

    this.rawBoard = newBoard;
  }

  /**
   * Mutates the current state and updates the specified square with the player Id.
   * This function does not touch the DOM.
   *
   * @param {number} squareId
   * @param {HUMAN_ID | AI_ID} playerId
   */
  simulateMove(squareId, playerId) {
    const newBoard = [...this.rawBoard];
    newBoard[squareId] = playerId;

    this.rawBoard = newBoard;
  }

  /**
   * Mutates the current state and sets the specified square to `undefined`.
   *
   * @param {number} squareId
   */
  undoMove(squareId) {
    const newBoard = [...this.rawBoard];
    newBoard[squareId] = undefined;

    this.rawBoard = newBoard;
  }

  /**
   * Renders an empty game board into the DOM.
   *
   * @param {onSquareClickCallback} onSquareClickCallback
   */
  renderBoard(onSquareClickCallback) {
    const squareElemList = document.querySelectorAll('.square');

    for (const square of squareElemList) {
      square.textContent = '';

      square.addEventListener('click', () => onSquareClickCallback(square.dataset.id));
    }
  }

  /**
   * Verifies if the specified square is `undefined` (empty).
   * @param {number} squareId
   */
  canPlay(squareId) {
    return this.rawBoard[squareId] === undefined;
  }


  /**
   * Gets the available moves in the current board state
   *
   * @returns {Object<number, boolean>} The available moves obj
   */
  _getAvailableMoves() {
    const avMoves = {};

    this.rawBoard.forEach((_, squareId) => {
      if (this.canPlay(squareId)) {
        avMoves[squareId] = true;
      }
    });

    return avMoves;
  }


  /**
   * Gets the game winner
   *
   * Board layout:
   * ```javascript
   * [0, 1, 2]
   * [3, 4, 5]
   * [6, 7, 8]
   * ```
   *
   * @returns {HUMAN_ID | AI_ID | null} the winner's player id or null if there isn't a winner
   */
  get _winner() {
    const board = this.rawBoard;

    if (board.length > 3) {
      // Rows
      if (board[0] !== undefined && board[0] === board[1] && board[1] === board[2]) {
        return board[0];
      } else if (board[3] !== undefined && board[3] === board[4] && board[4] === board[5]) {
        return board[3];
      } else if (board[6] !== undefined && board[6] === board[7] && board[7] === board[8]) {
        return board[6];
      }

      // Columns
      if (board[0] !== undefined && board[0] === board[3] && board[3] === board[6]) {
        return board[0];
      } else if (board[1] !== undefined && board[1] === board[4] && board[4] === board[7]) {
        return board[1];
      } else if (board[2] !== undefined && board[2] === board[5] && board[5] === board[8]) {
        return board[2];
      }

      // Diagonals
      if (board[0] !== undefined && board[0] === board[4] && board[4] === board[8]) {
        return board[0];
      } else if (board[6] !== undefined && board[6] === board[4] && board[4] === board[2]) {
        return board[6];
      }
    }

    return null;
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();

  const resetBtn = document.getElementById('reset-btn');

  resetBtn.addEventListener('click', () => {
    game.playerScore = 0;
    game.computerScore = 0;
    game.reset();
  })
});

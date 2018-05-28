var TttGame = function() {
  var playerSide = null;
  var computerSide = null; 
  var playerScore = 0, computerScore = 0;
  var activeState = {
    turn: '',
    board: []
  };  
  var boardSize = 3;
  
  this.run = function(pSide, botScore, pScore) { 
   
    if(pSide === 'side_X' || pSide === 'X') {
      playerSide = 'X';
      computerSide = 'O';
    } 
    else {
      playerSide = 'O';
      computerSide = 'X';
    } 
    
    if(typeof botScore !== 'undefined') {
      computerScore = botScore;
      updateInfoBoard();
    }
    
    if(typeof pScore !== 'undefined') {
      playerScore = pScore;
      updateInfoBoard();
    }
    
    initVars();
    
    $('.squares').text('');
    
    if (playerSide === 'X') playerTurn();
    else computerTurn();
  }
  
  function initVars() {   
    activeState.board = [];
    activeState.board = new Array(boardSize).fill(0).map(function(row) {
      return new Array(boardSize).fill(0);
    });
    
    activeState.turn = '';
  }
  
  function playerTurn() {     
    activeState.turn = playerSide;
    $('#current-turn').text('Your turn');
    $('#current-turn').removeClass('ai-turn');
    $('.squares').removeClass('disabled');
    
    $('.squares').click(function() {
     
      var squareData = [$(this).data('line'), $(this).data('col')];
      
      if(canPlay(squareData, activeState.board)) {        
        activeState = makeMove(activeState, squareData);
          
        endTurn();
      }    
    });
  }
  
  function computerTurn() {
    $('#current-turn').text('AI turn');
    $('#current-turn').addClass('ai-turn');
    
    activeState.turn = computerSide;
    
    setTimeout(function() {
      var aiMove = findAiMove(activeState);
    
      activeState = makeMove(activeState, aiMove);
    
      endTurn();
    }, 500);    
  }
  
  function findAiMove(state) {    
    // Block moves
    // Fork
    if((state.board[0, 0] === playerSide && state.board[2, 0] === playerSide)
       && canPlay([2, 2], state.board)) {      
      return [2 , 2];
    } 
    else if((state.board[0, 0] === playerSide &&
           state.board[2, 2] === playerSide)
            && canPlay([0, 2], state.board)) {      
      return [0 , 2];
    }
    else if((state.board[0, 2] === playerSide &&
           state.board[0, 0] === playerSide)
            && canPlay([2, 0], state.board)) {      
      return [2 , 0];
    }
    // Column
    for(i = 0; i < boardSize; i++){
      if(state.board[0][i] === playerSide && state.board[1][i] === playerSide) {
        if(canPlay([2, i], state.board)) return [2, i];
      }
      else if(state.board[1][i] === playerSide && state.board[2][i] === playerSide) {
        if(canPlay([2, i], state.board)) return [0, i];
      }
      else if(state.board[2][i] === playerSide && state.board[0][i] === playerSide) {        
        if(canPlay([1, i], state.board)) return [1, i];
      }
    }

    // Line
    for(i = 0; i < boardSize; i++){
      if(state.board[i][0] === playerSide && state.board[i][1] === playerSide) {
        if(canPlay([i, 2], state.board)) return [i, 2];
      }
      else if(state.board[i][1] === playerSide && state.board[i][2] === playerSide) {
        if(canPlay([i, 0], state.board)) return [i, 0];
      }
      else if(state.board[i][2] === playerSide && state.board[i][0] === playerSide) {        
        if(canPlay([i, 1], state.board)) return [i, 1];
      }
    }

    // Diagonals

    // Main Diagonal
    if(state.board[0][0] === playerSide && state.board[1][1] === playerSide) {
      if(canPlay([2, 2], state.board)) return [2, 2];
    }
    else if(state.board[1][1] === playerSide && state.board[2][2] === playerSide) {
      if(canPlay([0, 0], state.board)) return [0, 0];
    }
    else if(state.board[0][0] === playerSide && state.board[2][2] === playerSide) {       
      if(canPlay([1, 1], state.board)) return [1, 1];
    }

    // Aux Diagonal
    else if(state.board[0][2] === playerSide && state.board[1][1] === playerSide) {
      if(canPlay([2, 0], state.board)) return [2, 0];
    }
    else if(state.board[1][1] === playerSide && state.board[2][0] === playerSide) {
      if(canPlay([0, 2], state.board)) return [0, 2];
    }
    else if(state.board[0][2] === playerSide && state.board[2][0] === playerSide) {
      if(canPlay([1, 1], state.board)) return [1, 1];
    }
    
    // Attack moves 
    var optimalAiMoves = [
        [0, 0],
        [1, 1],
        [0 ,2],
        [2, 0],
        [2, 2],
        [2, 1]
    ];
    
    if(isFirstMove(activeState)) {
      return optimalAiMoves[Math.floor(Math.random() * optimalAiMoves.length)];      
    }   
    else {
      // Column
      for(i = 0; i < boardSize; i++){
        if(state.board[0][i] === computerSide && state.board[1][i] === computerSide) {
          if(canPlay([2, i], state.board)) return [2, i];          
        }
        else if(state.board[1][i] === computerSide && state.board[2][i] === computerSide) {          
          if(canPlay([0, i], state.board)) return [0, i];     
        }
        else if(state.board[2][i] === computerSide && state.board[0][i] === computerSide) {
          if(canPlay([1, i], state.board)) return [1, i];     
        }
      }

      // Line
      for(i = 0; i < boardSize; i++){
        if(state.board[i][0] === computerSide && state.board[i][1] === computerSide) {
          if(canPlay([i, 2], state.board)) return [i, 2];     
        }
        else if(state.board[i][1] === computerSide && state.board[i][2] === computerSide) {
          if(canPlay([i, 0], state.board)) return [i, 0];
        }
        else if(state.board[i][2] === computerSide && state.board[i][0] === computerSide) {
          if(canPlay([i, 1], state.board)) return [i, 1];
        }
      }

      // Diagonals

      // Main Diagonal
      if(state.board[0][0] === computerSide && state.board[1][1] === computerSide) {
        if(canPlay([2, 2], state.board)) return [2, 2];
      }
      else if(state.board[1][1] === computerSide && state.board[2][2] === computerSide) {
        if(canPlay([0, 0], state.board)) return [0, 0];
      }
      else if(state.board[0][0] === computerSide && state.board[2][2] === computerSide) {
        if(canPlay([1, 1], state.board)) return [1, 1];
      }

      // Aux Diagonal
      else if(state.board[0][2] === computerSide && state.board[1][1] === computerSide) {
        if(canPlay([2, 0], state.board)) return [2, 0];
      }
      else if(state.board[1][1] === computerSide && state.board[2][0] === computerSide) {        
        if(canPlay([0, 2], state.board)) return [0, 2];
      }
      else if(state.board[0][2] === computerSide && state.board[2][0] === computerSide) {
        if(canPlay([1, 1], state.board)) return [1, 1];
      }
    }
    
    // Second move - Intermediary Moves
    var avMoves = getAvailableMoves(state);
    var counter = 0;
    var rndMove = [];  
    if(canPlay([1, 1], state.board)) {       
      return [1, 1];
    }    
    else if(avMoves.length > 1) {          
      while(counter < optimalAiMoves.length) {
        var tmpMove = optimalAiMoves[Math.floor(Math.random() * optimalAiMoves.length)];
        if(canPlay(tmpMove, state.board))
        {
          rndMove = tmpMove;
          break;
        }
        
        counter++;        
      } 
      
      if(counter >= optimalAiMoves.length) { // Can't find any optimal move
        counter = 0;
        while(counter < avMoves.length) {
          var tmpMove = avMoves[Math.floor(Math.random() * avMoves.length)];
          if(canPlay(tmpMove, state.board))
          {
            rndMove = tmpMove;
            break;
          } 
          
          counter++;
        }       
      }
      
      return rndMove;
    }    
    else if(avMoves.length === 1) { // Last move
      return avMoves[0];
    }
  }
  
  function endTurn() {     
    if(checkGameOver(activeState)) {
      var winner = getWinner(activeState);
      var newGame = new TttGame();      
      
      if(winner === playerSide) {        
        $('#current-turn').text('You\'ve won!');
        setTimeout(function() {
          updateInfoBoard();
          newGame.run(playerSide, computerScore, ++playerScore);
        }, 2000);
        
      }
      else if(winner === computerSide) {        
        $('#current-turn').text('You\'ve lost!');
        setTimeout(function() {          
          newGame.run(playerSide, ++computerScore, playerScore);
        }, 2000);
      }
      else if(winner === 'tie') {        
        $('#current-turn').text('There is a draw!');
        setTimeout(function() {          
          newGame.run(playerSide, computerScore, playerScore);
        }, 2000);
      }
    }
    else {
      if(activeState.turn === playerSide) {
      
        $('.squares').off();
        $('.squares').toggleClass('disabled');
        computerTurn();
      }
      else {
        $('.squares').toggleClass('disabled');

        playerTurn();
      }
    }
  }
  
  function getWinner(state) {
    var board = state.board;
    var win = checkColumn(board) || checkRow(board) || checkDiagonal(board);
    
    if(getAvailableMoves(state).length === 0 && typeof win === 'undefined') {
      return 'tie';
    }
    
    return win;
  }  
  
  function getAvailableMoves(state) {
    var board = state.board;
    var avMoves = [];
    
    for(i = 0; i < boardSize; i++) {
      for(j = 0; j < boardSize; j++) {
        if(board[i][j] === 0) {
          avMoves.push([i , j]);
        }
      }
    }
    
    return avMoves;
  }
  
  function isFirstMove(state) {
    var board = state.board;
    
    for(i = 0; i < boardSize; i++) {
      for(j = 0; j < boardSize; j++) {
        if(board[i][j] === playerSide || board[i][j] === computerSide) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  function checkColumn(board) {
    for(i = 0; i < 3; i++) { 
      if(board[0][i] !== 0) {
        if((board[0][i] === board[1][i]) && (board[1][i] === board[2][i])) {
          return board[0][i];
        }
      }
    }
  }
  
  function checkRow(board) {    
    for(i = 0; i < 3; i++) {   
      if(board[i][0] !== 0) {
        if((board[i][0] === board[i][1]) && (board[i][1] === board[i][2])) {
          return board[i][0];
        }
      }
    }
  }
  
  function checkDiagonal(board) {   
    if(board[0][0] !== 0) {
      if((board[0][0] === board[1][1]) && (board[1][1] === board[2][2])) {
        return board[0][0];
      }  
    }
    
    if(board[2][0] !== 0) {
      if((board[2][0] === board[1][1]) && (board[1][1] === board[0][2])) {
        return board[2][0];
      }
    }
  }

  function checkGameOver(state) {     
    return (typeof getWinner(state) !== 'undefined');
  }
  
  function canPlay(move, board) {    
    if(board[move[0]][move[1]] !== 0) return false;
    else return true;
  }
  
  function makeMove(state, move) {
    var newState = $.extend(true, {}, state);
    
    newState.board[move[0]][move[1]] = (state.turn === playerSide) ? playerSide : computerSide; 
    
    drawMove(move, (state.turn === playerSide) ? playerSide : computerSide);
    
    return newState;
  }
  
  function drawMove(move, side) {      
    $('div[data-line='+ move[0] +'][data-col='+ move[1] +']').text(side);    
  }
  
  function updateInfoBoard() {
    $('#bot-score').text(computerScore);
    $('#player-score').text(playerScore);    
  }
}

$(document).ready(function() {
  var game = new TttGame();
  
  $('.side-select').click(function() { 
    var selectedSide = $(this).val();
    
    $('#game-setup').hide();
    $('#game-board').show('fast', function() {
      game.run(selectedSide, 0, 0);      
    });
  });
  
  $('.hard-reset').click(function() {
    $('#game-setup').show();
    $('#game-board').hide();
  });
});
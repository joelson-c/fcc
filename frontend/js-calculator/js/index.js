$(document).ready(function() {
  var operations = [0];
  var SIGNS = /(?:\+|-|\/|\*|\^)/;
  var FUNCTIONS = /(?:negate|sqrt|fact)(?!\(\)\d)/i;

  $('button').click(function() {
    var btnValue = $(this).val();

    if(btnValue === 'ac') {
      operations = [0];
    }
    else if(btnValue === 'ce') {
      operations = clearNumbers();

      if(operations.length === 1 || operations[1] === null || operations[1] === undefined) {
        operations = [0];
      }
    }
    else if(btnValue === 'negate') {
      addFunction('negate');
    }
    else if(btnValue === 'square') {
      addFunction('sqrt');
    }
    else if(btnValue === 'factor') {
      addFunction('fact');
    }
    else {
      if(SIGNS.test(btnValue) && btnValue !== '=') {
        if(operations[operations.length - 1] !== btnValue) {
          operations.push(btnValue);
        }
      }
      else if(btnValue === '=') {
        var operationResult = 0;

        operations.forEach(function(elem, idx) {
          if(SIGNS.test(elem) && operations[idx + 1] !== undefined) {
            switch(elem) {
              case '+':
                if(operationResult === 0) {
                  operationResult += getNumBeforeSign(idx) + getNumAfterSign(idx);
                }
                else {
                  operationResult += getNumAfterSign(idx);
                }
                break;
              case '-':
                if(operationResult === 0) {
                  operationResult += getNumBeforeSign(idx) - getNumAfterSign(idx);
                }
                else {
                  operationResult -= getNumAfterSign(idx);
                }
                break;
              case '*':
                if(operationResult === 0) {
                  operationResult += getNumBeforeSign(idx) * getNumAfterSign(idx);
                }
                else {
                  operationResult *= getNumAfterSign(idx);
                }
                break;
              case '/':
                if(operationResult === 0) {
                  operationResult += getNumBeforeSign(idx) / getNumAfterSign(idx);
                }
                else {
                  operationResult /= getNumAfterSign(idx);
                }
                break;
              case '^':
                if(operationResult === 0) {
                  operationResult += Math.pow(getNumBeforeSign(idx),getNumAfterSign(idx));
                }
                else {
                  operationResult += Math.pow(operationResult, getNumAfterSign(idx));
                }
                break;
            }
          }
          else if(FUNCTIONS.test(elem) && operations[idx + 1] === undefined) {
            operationResult = parseFunctions(elem);
          }
        });

        operations = [operationResult];
        $('.operations').text(operationResult);
      }
      else {
        if(operations.length === 1 && operations[0] == 0 && btnValue !== '.' ||
           FUNCTIONS.test(operations[operations.length - 1])) {
          operations = [btnValue];
        }
        else {
          operations.push(btnValue);
        }
      }
    }

    function addFunction(funcName) {
      var slicedNum = operations.slice(getLastTypedNumIdx()).join('');

      operations = clearNumbers();

      if(FUNCTIONS.test(slicedNum)) {
        slicedNum = parseFunctions(slicedNum);
      }

      if(funcName === 'negate' && slicedNum < 0) {
        operations.push(Math.abs((+slicedNum)));
      }
      else {
        operations.push(funcName + '(' + (+slicedNum) + ')');
      }
    }

    function clearNumbers() {
      var newArr = operations;

      for(i = newArr.length; i >= 0; i--) {
        if(SIGNS.test(newArr[i])) {
          break;
        }
        else {
           newArr[i] = null;
        }
      }

      return newArr;
    }

    function getLastTypedNumIdx() {
      var numIdx = 0;
      for (i = operations.length; i > 0; i--) {
        if(SIGNS.test(operations[i])) {
          numIdx = i + 1;
          break;
        }
      }

      return numIdx;
    }

    function getNumBeforeSign(signIdx) {
      var num = [];

      for(i = signIdx - 1; i >= 0; i--) {

        if(Number.isNaN((+operations[i])) === false || operations[i] === '.') {
          num.push(operations[i]);
        }
        else if(SIGNS.test(operations[i]) === false) {
          num.push(parseFunctions(operations[i]));
        }
        else if(SIGNS.test(operations[i])) {
          break;
        }
      }

      return Number(num.reverse().join(''));
    }

    function getNumAfterSign(signIdx) {
      var num = [];
      for(i = signIdx + 1; i < operations.length; i++) {
        if(Number.isNaN((+operations[i])) === false && SIGNS.test(operations[i]) === false) {
          num.push(operations[i]);
        }
        else if(SIGNS.test(operations[i]) === false) {
          num.push(parseFunctions(operations[i]));
        }
        else if(SIGNS.test(operations[i])) {
          break;
        }
      }

      return (+num.join(''));
    }

    function parseFunctions(numFunc) {
      if(FUNCTIONS.test(numFunc)) {
        var toParseNum = numFunc.match(/[^a-z()]+/i)[0];
        var calcFunc = numFunc.match(FUNCTIONS)[0];

        switch(calcFunc) {
          case 'negate':
            return (-toParseNum);

          case 'sqrt':
            return Math.sqrt(toParseNum);

          case 'fact':
            var factoredNum = 1;
            var numToFact = toParseNum;

            for(i = numToFact; i > 0; i--) {
              factoredNum *= i;
            }

            return factoredNum;
        }
      }

      return numFunc;
    }

    $('.operations').text(operations.join(''));
  });
});

let expression = [0];

/* Sign definition example:
* @example
* ```js
* {
*   sign_id: html_sign_name
* }
* ```
*/
const SIGNS = {
  plus: '+',
  minus: '-',
  times: '*',
  division: '/',
  pow: '^'
};

/* Function definition example:
* @example
* ```js
* {
*   html_func_name: (param) => param + 1
* }
* ```
*/
const FUNCTIONS = {
  negate: (param) => -param,
  square_root: (param) => Math.sqrt(param),
  fact: (param) => {
    let factoredNum = 1;
    const numToFact = param;

    for (let i = numToFact; i > 0; i--) {
      factoredNum *= i;
    }

    return factoredNum;
  }
};

const buttons = document.querySelectorAll('button');
buttons.forEach(btn => {
  if (btn.value === '=') {
    btn.addEventListener('click', resolveExpression);
  } else {
     btn.addEventListener('click', onBtnClick);
  }
});

function onBtnClick(event) {
  const btnValue = event.target.value;

  if (btnValue === "ac") {
    expression = [0];
  } else if (btnValue === "ce") {
    if (expression.length === 1) {
      expression = [0];
    } else {
      expression.pop();
    }
  } else if (isElemAFunction(btnValue)) {
    addFunction(btnValue);
  } else {
    if (isElemASign(btnValue)) {
      const lastItem = expression[expression.length - 1];

      if (lastItem !== btnValue && !isElemASign(lastItem)) {
        expression.push(btnValue);
      }
    } else {
      if (expression[0] == 0 && btnValue !== ".") {
        expression = [btnValue];
      } else {
        expression.push(btnValue);
      }
    }
  }

  updateExpressionDisplay();
}

function resolveExpression() {
  let expResult = 0;
  const signRegExp = /(\+|-|\/|\*|\^)/g;

  const expStr = expression.join("");
  const formattedExp = expStr.split(signRegExp).map(elem => isElemASign(elem) ? elem : Number(elem));

  if (formattedExp.length > 1) {
    expResult = formattedExp.reduce((acc, elem, idx) => {
      if (isElemASign(elem)) {
        const numAfterSign = formattedExp[idx + 1];

        switch (elem) {
          case SIGNS.plus:
            acc += numAfterSign;
            break;
          case SIGNS.minus:
            acc -= numAfterSign;
            break;
          case SIGNS.times:
            acc *= numAfterSign;
            break;
          case SIGNS.division:
            acc /= numAfterSign;
            break;
          case SIGNS.pow:
            acc += Math.pow(acc, numAfterSign);
            break;
        }
      }

      return acc;
    }, formattedExp[0]);
  } else {
    expResult = formattedExp[0];
  }

  expression = [expResult];
  updateExpressionDisplay();
}

function addFunction(funcName) {
  const { value: lastTypedNum, idx: lastTypedNumIdx } = getLastTypedNum();

  expression = expression.slice(0, lastTypedNumIdx);
  expression.push(parseFunction(funcName, lastTypedNum));
}

function getLastTypedNum() {
  let numIdx = 0;
  for (let i = expression.length; i > 0; i--) {
    if (isElemASign(expression[i])) {
      numIdx = i + 1;
      break;
    }
  }

  return {
    value: expression.slice(numIdx).join(""),
    idx: numIdx
  };
}

function parseFunction(funcName, param) {
  if (FUNCTIONS[funcName] !== undefined) {
    return FUNCTIONS[funcName](param);
  }

  return param;
}

function isElemAFunction(elem) {
  return FUNCTIONS[elem] !== undefined;
}

function isElemASign(elem) {
  return /^(\+|-|\/|\*|\^)$/.test(elem);
}

function updateExpressionDisplay() {
  const opContainer = document.querySelector('.expression');
  opContainer.textContent = expression.join("");
}
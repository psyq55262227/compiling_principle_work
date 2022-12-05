const pairing = {
  '<': ['>', '='],
  '>': ['='],
  '!': ['='],
  '+': ['+'],
  '-': ['-'],
  '=': ['='],
}

const otherOperator = ['*', '/'];
const allOperator = [...new Set([...Object.keys(pairing),...Object.values(pairing).flat(2),...otherOperator])]

/**
 * 判定是否为字母
 * @param {string} ch 
 * @returns 
 */
const isLetter = (ch) => {
  const test = new RegExp(/^[a-zA-Z]+$/)
  return test.test(ch)
}

/**
 * 判定是否为数字
 * @param {string} num 
 * @returns 
 */
const isNumber = (num) => {
  if (num === '0' || num === '0x') return true
  // const test = new RegExp(/^[0-9]+.?[0-9]*/)
  // return test.test(num)
  return /^-{0,1}\d*\.{0,1}\d+$/.test(num) || /0[xX][0-9a-fA-F]+/.test(num)
}

/**
 * 判断是否为分界符
 * @param {string} ch 
 * @returns 
 */
const isSymbol = (ch) => {
  const symbol = ['(', ')', ',', ';', '<', '>', '{', '}', '[', ']']
  return symbol.findIndex((item) => item === ch)
}

/**
 * 判断是否为关键字
 * @param {string} word 
 * @returns {number}
 */
const isKeyWord = (word) => {
  const keyWord = [
    'if',
    'else',
    'for',
    'while',
    'do',
    'continue',
    'return',
    'break',
    'int',
    'const',
    'main',
    'void',
  ]
  return keyWord.findIndex((item) => item === word)
}
/**
 * 判断输入的是否非法
 * @param {*} programme 
 * @param {*} i 
 * @returns 
 */
const isWrong = (programme, i) => {
  if (isNumber(programme[i][0])) {
    // 判断是不是在产生式右边
    if (i > 0 && programme[i - 1][0] === '=') {
      return false
    } else{
      for(let j = 1 ; j < programme[i].length ; j++){
        if (isLetter(programme[i][j]) || programme[i][j] === '_') {
          return true
        }
      }
    }
  }
  return false
}
/**
 * 去掉多余的空格和换行和注释，并返回分割后的字符
 */ 
const getWords = (programme) => {
  let temp = '',
    res = '',
    flag = false,
    i = 0
  // 去掉注释
  let programmeArr = programme.split('')
  while (i < programmeArr.length) {
    const current = programme.slice(i, i + 2)
    if (current === '//') {
      while (programmeArr[i] !== '\n') {
        i++
      }
    } else if (current === '/*') {
      while (programme.slice(i - 2, i) !== '*/') {
        i++
      }
    } else {
      temp += programmeArr[i++]
    }
  }
  // 处理空格和换行

  temp.split('').map((item) => {
    if (item === '\t') {
      item = ' '
    }
    if (item !== ' ' && item !== '\n') {
      res += item
      flag = false
    } else if (!flag && item !== '\n') {
      res += item
      flag = true
    }
  })
  return res.split(' ')
}

const getIdentify = (program) => {
  let res = []
  if (program === '') return console.log('-------------------请输入程序')
  program = getWords(program)
  console.table(program)
  for (let j = 0; j < program.length; j++) {
    let temp = program[j]
    if (isWrong(program, j)) {
      console.log(
        `程序里第${j}个词${temp}为非法输入，词法分析出错，已为您强制退出程序`
      )
      process.exit()
    }
    for (let i = 0; i < temp.length && temp[i] !== ' '; i++) {
      // 判定标识符
      if (isLetter(temp[i]) || temp[i] === '_') {
        let currentWord = ''
        while (
          i < temp.length &&
          (isLetter(temp[i]) || isNumber(temp[i]) || temp[i] === '_')
        ) {
          currentWord += temp[i++]
        }
        i--
        res.push({
          type: isKeyWord(currentWord) !== -1 ? '保留字' : '标识符',
          val: currentWord,
        })
      } else if (isNumber(temp[i])) {
        let currentWord = temp[i]
        while (i < temp.length && isNumber(currentWord)) {
          i++
          currentWord += temp[i] ? (temp[i] === ';' ? '' : temp[i]) : ''
        }
        i--
        res.push({ type: '数字', val: currentWord })
      } else if (Object.keys(pairing).some((e) => e === temp[i])) {
        if (
          i + 1 < temp.length &&
          pairing[temp[i]].some((e) => e === temp[i + 1])
        ) {
          res.push({ type: '运算符', val: temp.slice(i, i + 2) })
          i++
        } else {
          res.push({ type: '运算符', val: temp[i] })
          if(i + 1 < temp.length && allOperator.some((item)=>item===temp[i+1])){
            console.table(res);
            console.log(`${temp[i+1]}为非法标识符，已强制退出程序`)
            process.exit()
          }
        }
      } else if (otherOperator.some((e) => e === temp[i])) {
        res.push({ type: '运算符', val: temp[i] })
      } else if (isSymbol(temp[i]) !== -1) {
        res.push({ type: '分界符', val: temp[i] })
      } else {
        console.table(res);
        console.log(`${temp[i]}为非法标识符，已强制退出程序`)
        process.exit()
      }
    }
  }
  return res
}
const solution = (program) => {
  const res = getIdentify(program)
  console.log('-------------------开始分析程序')
  console.table(res);
  console.log('-------------------词法分析结果为：正确')
}
solution(`int a;
int main()
{
	a = 10;
                b = 0x11ff;
                c = 027;
                // d = 20;
               /* e = 30; 
              */

	if ( a><0 ) 
               {
		return a;
	}
	else{
		return 0;
	}
}`)
// solution(`int a;
// int main()
// {
// 	a = 10;
//                 b = 1;
//                 c = 027;
//                 // d = 20;
//                /* e = 30; 
//               */

// 	if ( a>0 ) 
//                {
// 		return a;
// 	}
// 	else{
// 		return 0;
// 	}
// }`)

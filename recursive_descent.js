const test1 = ``
const test2 = 'i+(i-i)/i#'
const test3 = '(i+i)#'
const test6 = '((i+i)/i)#'
const test4 = 'ii+i#'
const test5 = 'i-i#'
const test = test4

const solution = (str) => {
  let index = 0,
    flag = false

  const handleError = (func, ch) => {
    console.log(
      `出错，在${func}的产生式推导中出现了语法问题：${
        ch ?? '字符串已到末尾，但未形成完整编译'
      }`
    )
    process.exit()
    flag = true
  }
  // E→TE’
  const E = (ch) => {
    if (ch === '(' || ch === 'i') {
      console.log("E::TE'")
      T(str[index])
      Ep(str[index])
    } else {
      handleError('E', ch)
      E(str[++index])
    }
  }
  // T→FT’
  const T = (ch) => {
    if (ch === 'i' || ch === '(') {
      console.log("T::FT'")
      F(str[index])
      Tp(str[index])
    } else {
      handleError('T', ch)
      T(str[++index])
    }
  }
  // E’→ATE’|ε
  const Ep = (ch) => {
    if (ch === ')' || ch === '$') {
      console.log("E'::ε")
    } else if (ch === '+' || ch === '-') {
      console.log("E'::ATE'")
      A(str[index])
      T(str[index])
      Ep(str[index])
    } else {
      handleError('Ep', ch)
      Ep(str[++index])
    }
  }
  // T’→MFT’ |ε
  const Tp = (ch) => {
    if (ch === ')' || ch === '+' || ch === '-' || ch === '$') {
      console.log("T'::ε")
    } else if (ch === '*' || ch === '/') {
      console.log("T'::MFT'")
      console.log(ch)
      M(str[index])
      F(str[index])
      Tp(str[index])
    } else {
      handleError('Tp', ch)
      Tp(str[++index])
    }
  }
  // F→(E) | i
  const F = (ch) => {
    index++
    switch (ch) {
      case 'i':
        console.log('F::i')
        break
      case '(':
        console.log('F->(E)')
        E(str[index])
        break
      default:
        handleError('F', ch)
        F(str[index])
    }
  }
  // A → + | -
  const A = (ch) => {
    index++
    switch (ch) {
      case '+':
        console.log('A::+')
        break
      case '-':
        console.log('A::-')
        break
      default:
        handleError('A', ch)
        A(str[index])
    }
  }
  // M → * | /
  const M = (ch) => {
    index++
    switch (ch) {
      case '*':
        console.log('M::*')
        break
      case '/':
        console.log('M::/')
        break
      default:
        handleError('M', ch)
        M(str[index])
    }
  }
  const main = () => {
    console.log('-------------------------开始语法分析')
    E(str[index])
    console.log(
      `-------------------------完成语法分析, 当前语句${flag ? '不' : ''}合法`
    )
  }
  main()
}
solution(test)

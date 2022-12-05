const startSymbol = 'E';
const originProductions = ["E->TX", "X->ATX|ε", "T->FY", "Y->MFT|ε", "F->(E)|i", "A->+|-", "M->*|/"]
const inputStr = "i++i*i#";
let productions = new Map<string,string[]>();  // 产生式
let FirstSet = new Map<string,Set<string>>(); // FIRST集
let FirstSetForAny = new Map<string,Set<string>>(); // 生成任何符号串的FIRST
let FollowSet = new Map<string,Set<string>>();  // FOLLOW集
let table = [[]]; // 预测分析表
let VnSet = new Set<string>();  // 非终结符Vn集合
let VtSet = new Set<string>();  // 终结符Vt集合
let action = '';
const emptyChar = 'ε'

function Stack(){
  this.stack = []
}
Stack.prototype.push = function(v: string){
  this.stack = [...this.stack, v];
}
Stack.prototype.peak = function(){
  return this.stack[this.stack.length-1];
}
Stack.prototype.pop = function(){
  return this.stack.pop();
}
Stack.prototype.join = function(char){
  return this.stack.join(char);
}

const solution = () => {
  if(!inputStr||inputStr.length===0)  return console.log('请输入字符串');
  divideChar();
  isLL1();
  First();
  Follow();
  createTable();
  console.log(FirstSet);
  console.log(FollowSet);
  console.table(table)
  analysisLL1();
}
/**
 * 分离产生式, 划分Vn和Vt
 */
const divideChar = () => {
  // 将产生式分开 + 收集非终结符
  originProductions.map((rule)=>{
    // 将 "|" 相连的式子分开
    const items = rule.split('->')[1].split('|');
    // 获取产生式左部
    const Vch = rule[0];
    // 获取该产生式左部的所有右部列表
    const list = productions.has(Vch)?productions.get(Vch):[];
    // 将刚刚获取的右部添加到右部列表
    items.map((item)=>list!.push(item));
    // 保存到产生式集合中
    productions.set(Vch, [...new Set(items)]);
    // 将产生式左部添加到非终结符集合
    VnSet.add(Vch);
  })
  // 收集终结符
  VnSet.forEach((Vn)=>{
    const VnProductions = productions.get(Vn)??[];
    VnProductions.map((production)=>{
      production.split('').map((letter)=>{
        // 遍历产生式右部的式子, 如果式子中的字母不为非终结符,那就是终结符
        if(!VnSet.has(letter)){
          VtSet.add(letter);
        }
      })
    })
  })
}

/**
 * 判断是否为ll1文法
 */
const isLL1 = () => {
  productions.forEach((production,vn)=>{
    let headSet = new Set();
    production.forEach((item)=>{
      // A -> AB
      if(item[0]===vn){
        console.error(`该文法非LL1文法，存在左递归：${vn}->${production}`);
        process.exit();
      }
      if(headSet.has(item[0])){
        console.error(`该文法非LL1文法，存在左公因式`);
        process.exit();
      }
      headSet.add(item[0])
    })
  })
}

/**
 * 生成非终结符的FIRST集的递归入口
 */
const First = () => {
  VnSet.forEach((Vn)=>{
    getFirst(Vn);
  });
  VnSet.forEach((Vn:string)=>{
    const VnProductions = productions.get(Vn);
    VnProductions.forEach((s)=>getFirstForProduction(s))
  });
}

/**
 * 生成非终结符的FIRST集
 */
const getFirst = (ch: string) => {
  // 获取ch当前的First集
  const chSet = FirstSet.has(ch)?FirstSet.get(ch):new Set<string>();
  // 若ch为终结符
  if(VtSet.has(ch)){
    chSet!.add(ch);
    FirstSet.set(ch,chSet!);
    return;
  }
  // 若ch为非终结符
  // 获取ch的产生式右部集合
  const production = productions.get(ch)??[];
  production.map((rule)=>{
    let i = 0;
    while(i < rule.length){
      const tn = rule[i];
      if(tn===ch){
        console.error(`该文法非LL1文法，存在左递归：${ch}->${rule}`);
        process.exit();
      }
      // 递归求其first集
      getFirst(tn);
      const tvSet = FirstSet.get(tn)??new Set<string>();
      // 将tv的first集加入左部
      tvSet.forEach((item: string)=>{
        if(item!==emptyChar){
          chSet!.add(item);
        }
      })
      // 若不包含空串，则直接退出，否则继续处理下一个符号
      if(!tvSet.has(emptyChar)){
        break;
      }else{
        i++;
      }
    }
    if(i===rule.length){
      chSet.add(emptyChar);
    }
  })
  FirstSet.set(ch,chSet!);
}

/**
 * 生成对应于某右部产生式的First
 */
const getFirstForProduction = (s: string) => {
  const set = FirstSetForAny.has(s)?FirstSetForAny.get(s):new Set<string>();
  let i = 0;
  while(i<s.length){
    const tn = s[i];
    if(!FirstSet.has(tn)){
      getFirst(tn);
    }
    const tvSet = FirstSet.get(tn)??new Set<string>();
    // 将非空first集加入左部
    tvSet.forEach((item)=>{
      if(item!==emptyChar){
        set.add(item);
      }
    });
    // 若tv的first包含空串，则继续处理下一个字符
    if(tvSet.has(emptyChar)){
      i++;
    }else{
      break;
    }
    // 若所有符号的first集都包含空串，则加入空串
    if(i===s.length){
      set.add(emptyChar);
    }
  }
  FirstSetForAny.set(s,set);
}

/**
 * 生成follow集
 */
const Follow = () => {
  for(let i = 0 ; i < 3; i++){
    VnSet.forEach((Vn)=>getFollow(Vn));
  }
}

/**
 * 找到目标ch后
 * @param ch 目标字符
 * @param left 目标字符所在的产生式左部
 * @param production 目标字符所在的产生式的一部分
 * @returns 
 */
const findFollow = (ch:string, left: string, production: string) => {
  const chFollowSet = FollowSet.get(ch)??new Set<string>();
  // 长度为零，代表已经到末尾，则将左部的FOLLOW集加入ch的FOLLOW集
  if(production.length===0){
    const leftFollowSet = FollowSet.get(left);
    if(leftFollowSet){
      leftFollowSet.forEach((followItem)=>{
        chFollowSet.add(followItem)
      })
      FollowSet.set(ch, chFollowSet);
    }
    return;
  }
  const followChar = production[0];
  // 如果followChar为终结符，则直接将其加入FOLLOW
  if(VtSet.has(followChar)){
    chFollowSet.add(followChar);
    FollowSet.set(ch, chFollowSet);
    return;
  }
  // 若后跟非终结符，将该非终结符的非空FIRST集加入ch的FOLLOW
  const firstSet = FirstSet.get(followChar)??new Set<string>();
  firstSet.forEach((item)=>{
    if(item!==emptyChar){
      chFollowSet.add(item);
    }
  })
  FollowSet.set(ch, chFollowSet);
  // 若该非终结符含空串，则继续往后看
  if(firstSet.has(emptyChar)){
    findFollow(ch, left, production.slice(1,production.length));
  }
}

const getFollow = (ch: string) => {
  const chFollowSet = FollowSet.has(ch)?FollowSet.get(ch):new Set<string>();
  // 如果ch为开始符号，则加入空字符
  if(ch===startSymbol){
    chFollowSet.add(emptyChar);
  }
  // 查找所有产生式，找到出现ch的地方
  productions.forEach((vnProductions, vn)=>{
    vnProductions.forEach((production)=>{
      // vn->αBβ
      for(let i = 0 ; i < production.length ; i++ ){
        // 找到ch出现的地方
        if(production[i]===ch){
          findFollow(ch, vn, production.slice(i+1))
        }
      }
    })
  })
}

/**
 * 生成预测分析表
 */
const createTable = () => {
  const VtArr = [...VtSet], VnArr = [...VnSet];
  table = new Array(VnArr.length+1).fill('').map((item)=>new Array(VtArr.length+1).fill(''));
  table[0][0] = "Vn \\ Vt";
  for(let i = 0 ; i < VtArr.length ; i++ ){
    table[0][i+1] = VtArr[i]===emptyChar?'#':VtArr[i];
  }
  for(let i = 0 ; i < VnArr.length ; i++ ){
    table[i+1][0] = VnArr[i];
  }

  // 插入生成式
  VnSet.forEach((vn)=>{
    const vnProductions = productions.get(vn);
    vnProductions.forEach((production)=>{
      const set = FirstSetForAny.get(production);
      set.forEach((ch)=>{
        insertIntoTable(vn, ch, production);
      })
      if(set.has(emptyChar)){
        const followSet = FollowSet.get(vn);
        followSet.forEach((item)=>{
          insertIntoTable(vn, item, production);
        })
      }
    })
  })
}

/**
 * 插入生成式
 * @param vn 
 * @param ch 
 * @param production 要插入的生成式
 */
const insertIntoTable = (vn: string, ch: string, production: string) => {
  if(ch===emptyChar){
    ch = '#';
  }
  // 找到vn所在的table下标
  const i = table.findIndex((item)=>item[0]===vn);
  // 找到ch所在的table下标
  const j = table[0].findIndex((item)=>item===ch);
  table[i][j]=production;
}

/**
 * 
 * @param vn 待查找的vn
 * @param vt 待查找的vt
 * @returns 预测分析表中对应格子的内容
 */
const findItemFromTable = (vn: string, vt: string): string => {
  const vnIndex = table.findIndex((item)=>item[0]===vn);
  const vtIndex = table[0].findIndex((item)=>item===vt);
  return vnIndex===-1||vtIndex===-1?'':table[vnIndex][vtIndex];
}

/**
 * LL1文法分析
 */
const analysisLL1 = () => {
  const record = [['栈','当前串','操作']];
  const stack = new Stack();  // 符号栈
  stack.push('#');
  stack.push(startSymbol)
  let index = 0;  // 输入字符指针
  let action = '';  // 动作
  let matched = stack.peak();
  while(matched!=='#'){
    if(index===inputStr.length){
      console.log('栈中元素未完全匹配，LL1文法分析失败');
      console.table(record);
      return;
    }
    const curInputItem = inputStr[index];
    const tableItem = findItemFromTable(matched, curInputItem);
    if(curInputItem===matched){
      action = `匹配到${matched}`;
      stack.pop();
      index++;
    }else 
    // 如果预测分析表中无对应内容
    if(tableItem===''){
      // 如果栈中匹配到的字符可以为空串，则解析为空
      if(FirstSet.get(matched).has(emptyChar)){
        action = `${matched}->${emptyChar}`;
        stack.pop();
      }else{
        // 否则出现问题，终止分析
        action = 'null';
        record.push([stack.join(''),inputStr.slice(index),  action]);
        console.table(record);
        console.log(`存在问题：${curInputItem}，该问题位于串的第${index+1}位置`)
        return;
      }
    }else
    if(tableItem===emptyChar){
      stack.pop();
      action = `${matched}->${emptyChar}`;
    }else{
      action = `${matched}->${tableItem}`;
      stack.pop();
      for(let i = tableItem.length -1 ; i >=0 ; i-- ){
        stack.push(tableItem[i]);
      }
    }
    matched = stack.peak();
    record.push([stack.join(''), inputStr.slice(index), action]);
  }
  console.table(record);
  if(index+1<inputStr.length){
    return console.log('分析ll1文法失败，未能完整匹配串')
  }
  console.log('分析ll1文法成功');
}

solution()
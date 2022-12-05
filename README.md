# compiling_principle_work

编译原理大作业的JS/TS实现。需安装node环境。

- 实验1：词法分析器程序分析 `SysY.js`
  启动方式：`node sysy.js`
  实现方式比较hack，不太健壮但能用（x）已知缺陷是无法识别非法的数字，如0x11ff
- 实验2：递归下降子程序分析 `recursive_descent.js`
  启动方式：`node recursive_descent.js`
  参考：https://blog.csdn.net/weixin_43971710/article/details/107554472
- 实验3 LL1文法分析器 + 实验7 LL1文法判定：`ll1.ts`
  启动方式：需先运行`yarn`，再运行`ts-node ll1.ts`
  参考：https://blog.csdn.net/weixin_45635149/article/details/119779508
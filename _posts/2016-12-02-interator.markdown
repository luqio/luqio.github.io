---
layout: post
title:  "es6-二、变量的解构赋值"
date: 2016-12-6 2:10:45 +0800
categories: jekyll es6
---
#### 1、数组的解构
1.1、为变量赋值，可以从数组中提取值，按照对应位置，对变量赋值。     
{% highlight ruby %}
var [a, b, c] = [1, 2, 3];
let [foo, [[bar], baz]] = [1, [[2], 3]];
#=>foo // 1
#=>bar // 2
#=>baz // 3
let [x, , y] = [1, 2, 3];
#=>x // 1
#=>y // 3    
#=>let [head, ...tail] = [1, 2, 3, 4];
#=>head // 1
#=>tail // [2, 3, 4]    
let [x, y, ...z] = ['a'];
#=>x // "a"
#=>y // undefined
#=>z // []
#=>默认值
[x, y = 'b'] = ['a']; // x='a', y='b'
[x, y = 'b'] = ['a', undefined]; // x='a', y='b'       
{% endhighlight %}
1.2、fibs是一个Generator函数，原生具有Iterator接口。解构赋值会依次从这个接口获取值。
{% highlight ruby %}
function* fibs() {
  var a = 0;
  var b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}     
var [first, second, third, fourth, fifth, sixth] = fibs();
#=>sixth // 5
{% endhighlight %}
Generator函数本意是iterator生成器，函数运行到yield时退出，并保留上下文，在下次进入时可以继续运行，关于Generator可以看这篇 https://hacks.mozilla.org/2015/05/es6-in-depth-generators/ ,现在这个特性作为协程使用将异部流程改造成同步，参见 http://www.html-js.com/article/Meikidd
1.3、默认值设置注意：
__注意，ES6内部使用严格相等运算符（===），判断一个位置是否有值。所以，如果一个数组成员不严格等于undefined，默认值是不会生效的。__
{% highlight ruby %}
[x, y = 'b'] = ['a', undefined]; // x='a', y='b'
var [x = 1] = [undefined];
x // 1
var [x = 1] = [null];
x // null
#=>如果一个数组成员是null，默认值就不会生效，因为null不严格等于undefined
{% endhighlight %}
#### 2、对象的解构   
和数组一样，解构也可以用于嵌套结构的对象。
{% highlight ruby %}
var obj = {
  p: [
    'Hello',
    { y: 'World' }
  ]
};
var { p: [x, { y }] } = obj;
x // "Hello"
y // "World"
#=>注意，这时p是模式，不是变量，因此不会被赋值。
var node = {
  loc: {
    start: {
      line: 1,
      column: 5
    }
  }
};
var { loc: { start: { line }} } = node;
line // 1
loc  // error: loc is undefined
start // error: start is undefined
#=>上面代码中，只有line是变量，loc和start都是模式，不会被赋值。
let obj = {};
let arr = [];
({ foo: obj.prop, bar: arr[0] } = { foo: 123, bar: true });
obj // {prop:123}
arr // [true]
var {x, y = 5} = {x: 1};
x // 1
y // 5
var {x = 3} = {x: undefined};//x=3
{% endhighlight %}
2.1、对象的解构赋值，可以很方便地将现有对象的方法，赋值到某个变量。
let { log, sin, cos } = Math;
由于数组本质是特殊的对象，因此可以对数组进行对象属性的解构。
var arr = [1, 2, 3];
var {0 : first, [arr.length - 1] : last} = arr;
first // 1
last // 3
2.2、let命令下面一行的圆括号是必须的，否则会报错。   
如果要将一个已经声明的变量用于解构赋值，必须非常小心,因为解析器会将起首的大括号，理解成一个代码块，而不是赋值语句。
var x;
{x} = {x: 1};//错误
let foo;
({foo} = {foo: 1}); // 成功
let baz;
({bar: baz} = {bar: 1}); // 成功
采用这种写法时，变量的声明和赋值是一体的。对于let和const来说，变量不能重新声明，所以一旦赋值的变量以前声明过，就会报错。
#### 3、字符串的解构赋值 
字符串也可以解构赋值。这是因为此时，字符串被转换成了一个类似数组的对象。
{% highlight ruby %}
const [a, b, c, d, e] = 'hello';
a // "h"
b // "e"
c // "l"
d // "l"
e // "o"
#=>类似数组的对象都有一个length属性，因此还可以对这个属性解构赋值。
let {length : len} = 'hello';
len // 5
{% endhighlight %}
#### 4、数值和布尔值的解构赋值    
解构赋值时，如果等号右边是数值和布尔值，则会先转为对象。
{% highlight ruby %}
let {toString: s} = 123;
s === Number.prototype.toString // true
let {toString: s} = true;
s === Boolean.prototype.toString // true
{% endhighlight %}
_由于undefined和null无法转为对象，所以对它们进行解构赋值，都会报错。_
{% highlight ruby %}
let { prop: x } = undefined; // TypeError
let { prop: y } = null; // TypeError
{% endhighlight %}
#### 5、函数参数的解构赋值 
{% highlight ruby %}
function add([x, y]){
  return x + y;
}
add([1, 2]); // 3
// 
[[1, 2], [3, 4]].map(([a, b]) => a + b);
// [ 3, 7 ]
//
function move({x = 0, y = 0} = {}) {
  return [x, y];
}
//
move({x: 3, y: 8}); // [3, 8]
move({x: 3}); // [3, 0]
move({}); // [0, 0]
move(); // [0, 0]
#=>上面代码中，函数move的参数是一个对象，通过对这个对象进行解构，得到变量x和y的值。如果解构失败，x和y等于默认值。
[1, undefined, 3].map((x = 'yes') => x);
#=>undefined就会触发函数参数的默认值
{% endhighlight %}

#### 圆括号
一个式子到底是模式，还是表达式，没有办法从一开始就知道，必须解析到（或解析不到）等号才能知道。由此带来的问题是，如果模式中出现圆括号怎么处理。ES6的规则是，只要有可能导致解构的歧义，就不得使用圆括号。    
（1）变量声明语句中，不能带有圆括号。   
{% highlight ruby %}
var [(a)] = [1];// 报错
var {x: (c)} = {};// 报错
var ({x: c}) = {};// 报错
var {(x: c)} = {};// 报错
var {(x): c} = {};// 报错
{% endhighlight %}
（2）函数参数中，模式不能带有圆括号。函数参数也属于变量声明，因此不能带有圆括号。    
（3）赋值语句中，不能将整个模式，或嵌套模式中的一层，放在圆括号之中。
{% highlight ruby %}
// 全部报错
({ p: a }) = { p: 42 };
([a]) = [5];
上面代码将整个模式放在圆括号之中，导致报错。
// 报错
[({ p: a }), { x: c }] = [{}, {}];
#=>上面代码将嵌套模式的一层，放在圆括号之中，导致报错。
{% endhighlight %}
_可以使用圆括号的情况只有一种：赋值语句的非模式部分，可以使用圆括号。_
{% highlight ruby %}
[(b)] = [3]; // 正确
({ p: (d) } = {}); // 正确
[(parseInt.prop)] = [3]; // 正确
#=>因为首先它们都是赋值语句，而不是声明语句；其次它们的圆括号都不属于模式的一部分。第一行语句中，模式是取数组的第一个成员，跟圆括号无关；第二行语句中，模式是p，而不是d；第三行语句与第一行语句的性质一致。
{% endhighlight %}

用处：   
（1）交换变量的值    
（2）从函数返回多个值    
{% highlight ruby %}
// 返回一个数组
function example() {
  return [1, 2, 3];
}
var [a, b, c] = example();
// 返回一个对象
function example() {
  return {
    foo: 1,
    bar: 2
  };
}
var { foo, bar } = example();
{% endhighlight %}
（3）函数参数的定义   
（4）提取JSON数据   
（5）函数参数的默认值   
（6）遍历Map结构   
（7）输入模块的指定方法   
{% highlight ruby %}
const { SourceMapConsumer, SourceNode } = require("source-map");
{% endhighlight %}
**本文取自**：<http://es6.ruanyifeng.com/>   

**博客demo地址**： [Jekyll docs][jekyll-docs] for more info on how to get the most out of Jekyll. File all bugs/feature requests at [Jekyll’s GitHub repo][jekyll-gh]. If you have questions, you can ask them on [Jekyll Talk][jekyll-talk].

[jekyll-docs]: http://jekyllrb.com/docs/home
[jekyll-gh]:   https://github.com/jekyll/jekyll
[jekyll-talk]: https://talk.jekyllrb.com/


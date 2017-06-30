---
layout: post
title:  "es6-三、字符串的扩展"
date: 2016-12-6 2:10:45 +0800
categories: jekyll es6
---
#### 1、字符的Unicode表示法   
{% highlight ruby %}
'\z' === 'z'  // true
'\172' === 'z' // true
'\x7A' === 'z' // true
'\u007A' === 'z' // true
'\u{7A}' === 'z' // true
{% endhighlight %}
#### 2、codePointAt() 
codePointAt方法是测试一个字符由两个字节还是由四个字节组成的最简单方法。
{% highlight ruby %}
function is32Bit(c) {
  return c.codePointAt(0) > 0xFFFF;
}
is32Bit("𠮷") // true
is32Bit("a") // false
JavaScript内部，字符以UTF-16的格式储存，每个字符固定为2个字节。对于那些需要4个字节储存的字符（Unicode码点大于0xFFFF的字符），JavaScript会认为它们是两个字符。
var s = "𠮷";
s.length // 2
s.charAt(0) // ''
s.charAt(1) // ''
s.charCodeAt(0) // 55362
s.charCodeAt(1) // 57271var s = '𠮷a';
s.codePointAt(0) // 134071
s.codePointAt(1) // 57271
s.codePointAt(2) // 97
{% endhighlight %}
总之，codePointAt方法会正确返回32位的UTF-16字符的码点。对于那些两个字节储存的常规字符，它的返回结果与charCodeAt方法相同。     
codePointAt方法返回的是码点的十进制值，如果想要十六进制的值，可以使用toString方法转换一下。
#### 2、String.fromCharCode----String.fromCharCode
ES5提供String.fromCharCode方法，用于从码点返回对应字符，但是这个方法不能识别32位的UTF-16字符（Unicode编号大于0xFFFF）。
### 3、字符串的遍历接口  （使得字符串可以被for...of循环遍历。）
{% highlight ruby %}
var text = String.fromCodePoint(0x20BB7);
for (let i = 0; i < text.length; i++) {
  console.log(text[i]);
}
// " "
// " "
for (let i of text) {
  console.log(i);
}
// "𠮷"
#### 4、includes(), startsWith(), endsWith() 
includes()：返回布尔值，表示是否找到了参数字符串。
startsWith()：返回布尔值，表示参数字符串是否在源字符串的头部。
endsWith()：返回布尔值，表示参数字符串是否在源字符串的尾部。
这三个方法都支持第二个参数，表示开始搜索的位置。
var s = 'Hello world!';
s.startsWith('world', 6) // true
s.endsWith('Hello', 5) // true
s.includes('Hello', 6) // false
{% endhighlight %}
上面代码表示，使用第二个参数n时，endsWith的行为与其他两个方法有所不同。它针对前n个字符，而其他两个方法针对从第n个位置直到字符串结束。
#### 5、repeat()
repeat方法返回一个新字符串，表示将原字符重复了n次。
{% highlight ruby %}
'na'.repeat(0) // ""
'hello'.repeat(2) // "hellohello"
'na'.repeat(-0.9) // ""
'na'.repeat(NaN) // ""
'na'.repeat('na') // ""
'na'.repeat('3') // "nanana"
参数若是小数则取整，负数或者Infinity，会报错。但如果参数是0到-1之间的小数，则等同于0，这是因为会先进行取整运算。0到-1之间的小数，取整以后等于-0，repeat视同为0。参数NaN等同于0。如果repeat的参数是字符串，则会先转换成数字。
'na'.repeat(2.9) // "nana"
{% endhighlight %}
### 6、padStart()，padEnd() 
Es7：自动补全长度会在头部或尾部补全。    
at()--chatAt()返回字符串给定位置的字符  
normalize() 
JavaScript只有indexOf方法，可以用来确定一个字符串是否包含在另一个字符串中。ES6又提供了三种新方法。    
includes()：返回布尔值，表示是否找到了参数字符串。    
startsWith()：返回布尔值，表示参数字符串是否在源字符串的头部。    
endsWith()：返回布尔值，表示参数字符串是否在源字符串的尾部。  
padStart()，padEnd():ES7推出了字符串补全长度的功能。如果某个字符串不够指定长度，会在头部或尾部补全。padStart用于头部补全，padEnd用于尾部补全。      
### 7、模板字符串
用反引号（`）标识。它可以当作普通字符串使用，也可以用来定义多行字符串，或者在字符串中嵌入变量。    
如果在模板字符串中需要使用反引号，则前面要用反斜杠转义。   
大括号内部可以放入任意的JavaScript表达式，可以进行运算，以及引用对象属性。
如果模板字符串中的变量没有声明，将报错。
{% highlight ruby %}
$('#result').append(
  'There are <b>' + basket.count + '</b> ' +
  'items in your basket, ' +
  '<em>' + basket.onSale +
  '</em> are on sale!'
);
变成：
$('#result').append(`
  There are <b>${basket.count}</b> items
   in your basket, <em>${basket.onSale}</em>
  are on sale!
`);
#=>所有的空格和缩进都会被保留在输出之中。<ul>标签前面会有一个换行,如果你不想要这个换行，可以使用trim方法消除它。   
#=>模板字符串之中还能调用函数
function fn() {
  return "Hello World";
}
`foo ${fn()} bar`
如果大括号中的值不是字符串，将按照一般的规则转为字符串。比如，大括号中是一个对象，将默认调用对象的toString方法。
__模板字符串甚至还能嵌套。__
const tmpl = addrs => `
  <table>
  ${addrs.map(addr => `
    <tr><td>${addr.first}</td></tr>
    <tr><td>${addr.last}</td></tr>
  `).join('')}
  </table>
`;
const data = [
    { first: '<Jane>', last: 'Bond' },
    { first: 'Lars', last: '<Croft>' },
];
console.log(tmpl(data));
#=>如果需要引用模板字符串本身，在需要时执行，可以像下面这样写。
// 写法一
let str = 'return ' + '`Hello ${name}!`';
let func = new Function('name', str);
func('Jack') // "Hello Jack!"
// 写法二
let str = '(name) => `Hello ${name}!`';
let func = eval.call(null, str);
func('Jack') // "Hello Jack!"
{% endhighlight %}

#### 8、模板编译
{% highlight ruby %}
var template = `
<ul>
  <% for(var i=0; i < data.supplies.length; i++) { %>
    <li><%= data.supplies[i] %></li>
  <% } %>
</ul>
`;
function compile(template){
  var evalExpr = /<%=(.+?)%>/g;
  var expr = /<%([\s\S]+?)%>/g;

  template = template
    .replace(evalExpr, '`); \n  echo( $1 ); \n  echo(`')
    .replace(expr, '`); \n $1 \n  echo(`');

  template = 'echo(`' + template + '`);';

  var script =
  `(function parse(data){
    var output = "";

    function echo(html){
      output += html;
    }

    ${ template }

    return output;
  })`;

  return script;
}
var parse = eval(compile(template));
div.innerHTML = parse({ supplies: [ "broom", "mop", "cleaner" ] });
{% endhighlight %}
#### 9、模板编译--标签模板--String.raw()--模板字符串的限制
**博客demo地址**： [Jekyll docs][jekyll-docs] for more info on how to get the most out of Jekyll. File all bugs/feature requests at [Jekyll’s GitHub repo][jekyll-gh]. If you have questions, you can ask them on [Jekyll Talk][jekyll-talk].

[jekyll-docs]: http://jekyllrb.com/docs/home
[jekyll-gh]:   https://github.com/jekyll/jekyll
[jekyll-talk]: https://talk.jekyllrb.com/


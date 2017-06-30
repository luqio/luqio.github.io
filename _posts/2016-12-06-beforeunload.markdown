---
layout: post
title:  "浏览器关闭的几种事件"
date: 2016-12-6 2:10:45 +0800
categories: jekyll es6
---
> 1、popstate，当前活动历史项(history entry)改变会触发popstate事件。调用history.pushState()创建新的历史项(history entry)，或调用history.replaceState()替换新的历史项(history entry)，那么popstate事件的state属性会包含历史项(history entry)状态对象(state object)的拷贝。      
需要注意的是调用history.pushState()或history.replaceState()不会触发popstate事件。只有在做出浏览器动作时，才会触发该事件，如用户点击浏览器的回退按钮（或者在Javascript代码中调用history.back()）   
不同的浏览器在加载页面时处理popstate事件的形式存在差异。页面加载时Chrome和Safari通常会触发(emit )popstate事件，但Firefox则不会
{% highlight ruby %}
window.onpopstate = function(event) {
  alert("location: " + document.location + ", state: " + JSON.stringify(event.state));
};
history.pushState({page: 1}, "title 1", "?page=1");
history.pushState({page: 2}, "title 2", "?page=2");
history.replaceState({page: 3}, "title 3", "?page=3");
history.back(); // alerts "location: http://example.com/example.html?page=1, state: {"page":1}"
history.back(); // alerts "location: http://example.com/example.html, state: null
history.go(2);  // alerts "location: http://example.com/example.html?page=3, state: {"page":3}
{% endhighlight %}
>+hashchange，**参考**：<https://developer.mozilla.org/zh-CN/docs/Web/Events/popstate/>  
> 
2、onbeforeunload。移动端不支持  
{% highlight ruby %}
    window.onbeforeunload = function(e){
      if($('isvaluechange').innerHTML == 1){
        if(Prototype.Browser.IE){
          return "当前内容尚未保存，是否放弃？";
        }else{
          e.returnValue="当前内容尚未保存，是否放弃？";
          return "当前内容尚未保存，是否放弃？";
        }
      }
    };
{% endhighlight %}
> 
3、当前页面是否可见（比如webview的叠加）：
可以通过document.hidden属性判断当前页面是否是激活状态。
兼容性：IE10+，Firefox10+,Chrome14+,Opera12.1+,Safari7.1+
兼容性写法示例：
{% highlight ruby %}
var hiddenProperty = 'hidden' in document ? 'hidden' :    
    'webkitHidden' in document ? 'webkitHidden' :    
    'mozHidden' in document ? 'mozHidden' :    
    null;
var visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
var onVisibilityChange = function(){
    if (!document[hiddenProperty]) {    
        console.log('页面非激活');
    }else{
        console.log('页面激活')
    }
}
document.addEventListener(visibilityChangeEvent, onVisibilityChange);
{% endhighlight %} 

**博客demo地址**： [Jekyll docs][jekyll-docs] for more info on how to get the most out of Jekyll. File all bugs/feature requests at [Jekyll’s GitHub repo][jekyll-gh]. If you have questions, you can ask them on [Jekyll Talk][jekyll-talk].

[jekyll-docs]: http://jekyllrb.com/docs/home
[jekyll-gh]:   https://github.com/jekyll/jekyll
[jekyll-talk]: https://talk.jekyllrb.com/


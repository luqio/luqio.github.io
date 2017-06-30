---
layout: post
title:  "静态资源优化方案(F.I.S)"
date: 2016-12-21 8:01:00 +0800
categories: optimize
---
#### 1、静态资源优化方案
* 1.1 配置超长时间的本地缓存 —— 节省带宽，提高性能   
* 1.2 采用内容摘要作为缓存更新依据 —— 精确的缓存控制    
* 1.3 静态资源CDN部署 —— 优化网络请求    
* 1.4 更资源发布路径实现非覆盖式发布 —— 平滑升级       
用 F.I.S 包装了一个小工具，完整实现整个回答所说的最佳部署方案，并提供了源码对照，可以感受一下项目源码和部署代码的对照。      
源码项目：fouber/static-resource-digest-project · GitHub     
部署项目：fouber/static-resource-digest-project-release · GitHub     
部署项目可以理解为线上发布后的结果，可以在部署项目里查看所有资源引用的md5化处理。    
#### 2、FIS
*   FIS是专为解决前端开发中自动化工具、性能优化、模块化框架、开发规范、代码部署、开发流程等问题的工具框架。  
http://www.cnblogs.com/wangfupeng1988/p/4784203.html    
http://fex-team.github.io/fis-site/docs/beginning/getting-started.html    
__fis install: 此命令安装一些公共库组件比如 jQuery、echarts，我们提供的组件都放在 https://github.com/fis-components 仓库中。       
fis release: 命令用于编译并发布的你的项目，拥有多个参数调整编译发布操作。       
fis server: 命令可以启动一个本地调试服务器用于预览fis release产出的项目。__       

作者：张云龙 

链接：https://www.zhihu.com/question/20790576/answer/32602154    
来源：知乎   
著作权归作者所有，转载请联系作者获得授权。    
**博客demo地址**： [Jekyll docs][jekyll-docs] for more info on how to get the most out of Jekyll. File all bugs/feature requests at [Jekyll’s GitHub repo][jekyll-gh]. If you have questions, you can ask them on [Jekyll Talk][jekyll-talk].

[jekyll-docs]: http://jekyllrb.com/docs/home
[jekyll-gh]:   https://github.com/jekyll/jekyll
[jekyll-talk]: https://talk.jekyllrb.com/


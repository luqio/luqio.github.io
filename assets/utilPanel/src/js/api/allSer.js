// allSer.js

define(["utilConfig"], function(utilConfig) {
    var $ = jQuery;
    return {
        // 获取投票的信息
        imgcrop: function(opt, callback,ErrorCallBack) {
            var url = "http://beta.youku.com/u/imgcrop";
            this.novaCall(url,opt,callback,ErrorCallBack);
            
        },
        novaCall:function(url, params, callback,ErrorCallBack){
             ErrorCallBack = ErrorCallBack == undefined?function(){}:ErrorCallBack;
             $.ajax({
                 type: 'GET',
                 url: url,
                 data: params,
                 jsonp:'callback',
                 dataType:'jsonp',
                 success: callback,
                 error: function(xhr, type){
                     console.log('Ajax error!');
                 }
             })
         }
    };
});

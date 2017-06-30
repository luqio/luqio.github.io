// extendFunc.js
// 扩展function

define(function() {
    return {
        // 扩展bind方法
        extendBind: function() {
            if (!function() {}.bind) {
                Function.prototype.bind = function(context) {
                    var self = this
                        , args = Array.prototype.slice.call(arguments);
                        
                    return function() {
                        return self.apply(context, args.slice(1));    
                    }
                };
            }
        }
    }
});

requirejs(["libs/css!../../o/css/main.min.css","libs/fastclick","utils/extendFunc","imgUpLoad/imgUpLoad" ],
           function(utilPanelcss,utilPanelfastclick,utilPanelExtendFunc,utilPanelimgUpLoad){
   var $ = jQuery;
   // 低版本扩展bind方法
   utilPanelExtendFunc.extendBind();
   if (document.addEventListener) {
        utilPanelfastclick.attach(document.body);
   };
   function createUtils(containers){
         $(containers).each(function(index,container){
                var $container = $(container);
                var cla = $container.attr("class");
                cla = cla.split(" ");
                var patt1=new RegExp("YK_interactUtil_container_");
                for(var i=0; i<cla.length; i++){
                  if(patt1.test(cla[i])){
                     var args = cla[i].replace("YK_interactUtil_container_", "").split("_");
                     break; 
                  }
                }
                switch(args[0]){
                     case "imgUpLoad":
                          new utilPanelimgUpLoad($container, args);
                          break;
                     default:
                         $(window).trigger("getUtilfail", ["未知的工具类型"]);
                         break;
                }
         })
   }
   window.utilPanel={};
   window.utilPanel.createUtils=createUtils;
   $(function(){
         //var YK_interactUtil
         var containers = $('[class*="YK_interactUtil_container"]');
         utilPanel.createUtils(containers) 
   }) 

})

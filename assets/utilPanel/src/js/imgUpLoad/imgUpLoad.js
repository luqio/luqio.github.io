define(["template/template","utils/YkJsBridgeSDK.2.0","libs/jquery.Jcrop"],
      function(utilPanelTemplate,utilPanelJsBridgeSDK,utilPanelJcrop){
    var $ = jQuery;
    var imgUpLoadModule = function(container, args) {
                this.container = $(container);
                
            /*    this.scene = args[1]; // [0,1,2,3] 分别对应h5详情，cms， app h5 详情页
                this.platform = args[2]; //"1",
                this.platform_type = args[3]; //"11",
                this.device = args[4]; //"1",*/
                
                this.init();
    };
   imgUpLoadModule.prototype = {
         constructor: imgUpLoadModule,
         init: function(){ 
            this.initButton();
            this.bindInput();  
         },
         /*初始化上传表单*/
         initButton: function(){
            var that = this;
            if(this.container.find(".YK_interact_imgfileUpLoadForm").length==0){
               this.container.css({"position":"relative","overflow":"hidden"});
               this.container.append('<form class="YK_interact_imgfileUpLoadForm" method="post" action="///u/imgcrop?callback=window.imgUploadCallBack" enctype="multipart/form-data" target="ykupImgIframe_a"><input type="file" name="imgfile" class="YK_interact_imgUpLoadInput"/><input type="hidden" name="size" class="size"  value=""/><input type="hidden" name="minw" class="minw"  value=""/><input type="hidden" name="minh" class="minh"  value=""/></form>');
            }
            if($("#ykupImgIframe_a").length==0){
               $("body").append('<iframe style="display:none" id="ykupImgIframe_a" name="ykupImgIframe_a"></iframe>');
            }
            
         },
         /*从外部获取参数*/
         getOptions: function(obj){
             this.options={};
             this.options.dataType=obj.attr("panelTag")?obj.attr("panelTag"):"";
             this.options.needCrop=obj.attr("needCrop")?(obj.attr("needCrop")=="false"?false:true):true;
             this.options.sizeLimit=obj.attr("sizeLimit")?parseInt(obj.attr("sizeLimit")):2048; //图片大小
             this.options.aspectRatio=obj.attr("aspectRatio")?obj.attr("aspectRatio"):16/9;
             this.options.setSelect=obj.attr("setSelect")?obj.attr("setSelect").split(","):[0,0,1600,900];
             this.options.allowSelect=obj.attr("allowSelect")?(obj.attr("allowSelect")=="false"?false:true):true;
             this.options.allowResize=obj.attr("allowResize")?(obj.attr("allowResize")=="false"?false:true):true; 
             this.options.maxSize=obj.attr("maxSize")?obj.attr("maxSize").split(","):[0,0];
             this.options.minSize=obj.attr("minSize")?obj.attr("minSize").split(","):[0,0];
             this.options.minSelect=obj.attr("minSelect")?obj.attr("minSelect").split(","):[0,0];
             this.options.previewWidth=obj.attr("previewWidth")?obj.attr("previewWidth"):239;
             this.options.sizeTip=obj.attr("sizeTip")?obj.attr("sizeTip"):"2M";
             this.options.setPopTip=obj.attr("setPopTip")?obj.attr("setPopTip"):"";
             this.options.minWH = obj.attr("minWH")?obj.attr("minWH").split(","):[0,0];
             
             window.YKFrontEndImgUpLoad = window.YKFrontEndImgUpLoad||{};
             YKFrontEndImgUpLoad.startMaskCallBack = YKFrontEndImgUpLoad.startMaskCallBack||function(){return ""};
             YKFrontEndImgUpLoad.CloseMaskCallBack = YKFrontEndImgUpLoad.CloseMaskCallBack||function(){return ""};
         },
         bindInput: function(){
             var that = this;
              if ((navigator.userAgent.indexOf('MSIE') >= 0) && (navigator.userAgent.indexOf('Opera') < 0)){
                   $(".YK_interact_imgUpLoadInput").addClass("forie");
              }else if(window.navigator.userAgent.indexOf("Chrome") !== -1){
                    $(".YK_interact_imgUpLoadInput").addClass("forChrom");
              }
              /*  点击上传按钮和重新选择按钮
             */
            $(".YK_interact_imgUpLoadInput").unbind();
            $(".YK_interact_imgUpLoadInput").change(function() {
                  var $this = $(this);
                  if($this.val()==""){
                        return;
                  }
                  var pContainer = $this.parents("div").eq(0);
                  if($(".YK_interact_imgUpLoad_popBox").length ==0){ 
                       that.getOptions(pContainer);
                       that.uiCrop();
                       $this.siblings(".size").val(that.options.sizeLimit);
                       $this.siblings(".minw").val(that.options.minWH[0]);
                       $this.siblings(".minh").val(that.options.minWH[1]);
                  }
                   that.resetUI();
                   that.cropimgurl = "";
                   document.domain = "youku.com";
                   that.setUpLoadCallback();
                   that.addloading();
                   //return;
                   $(this).parents("form").submit();//表单提交
             });
         },
         setUpLoadCallback: function(){
                  var that = this;
             //     delete window.imgUploadCallBack;
               //   if(!window.imgUploadCallBack){
                       window.imgUploadCallBack = function(data){
                          that.removeloading();
                          switch(data.error){
                                case 1:
                                     that.upCropstatus = -1;//上传成功未裁剪;
                                     that.cropimgurl = data.src;
                                     $(".YK_interact_imgUpLoad_popBox .YK_interact_utilPanelBtn_save").removeClass("CanNotSave").addClass("CanSave");
                                     var src=[data.src];
                                     that.preLoadImages(src,function(img){
                                          that.upImgCallBack(img[0].src);  
                                     }); 
                                     break;
                                case -2:
                                     utilPanelJsBridgeSDK.runLogin({});
                                     break;
                                case -1:
                                     that.showfailTip("系统错误");
                                     break;
                                case -3:
                                     that.showfailTip("上传图片过大");
                                     break;
                                case -4:
                                     that.showfailTip("格式错误");
                                     break;
                                case -5:
                                     that.showfailTip("请上传指定尺寸的图片");
                                     break;
                                 default:
                                     that.showfailTip("上传失败");
                          }
                 //    }
                }
         },
         uiCrop: function(){
             var html = utilPanelTemplate("imgUpLoad/imgUpLoad");
             $("body").append(html);
             var that = this;
             this.getElem();
             this.reSelectBtn.append('<form id="YK_interact_imgfileCropForm"  method="post" action="///u/imgcrop?callback=window.imgUploadCallBack" enctype="multipart/form-data" target="ykCropImgIframe_a"><input type="file" name="imgfile" class="YK_interact_imgUpLoadInput" id="YK_interact_imgCropInput"/><input type="hidden" name="size"  value="'+that.options.sizeLimit+'"/><input type="hidden" name="minw" class="minw"  value="'+that.options.minWH[0]+'"/><input type="hidden" name="minh" class="minh"  value="'+that.options.minWH[1]+'"/></form><iframe style="display:none" id="ykCropImgIframe_a" name="ykCropImgIframe_a"></iframe>');

             that.bindInput();//重新绑定上传按钮
             that.tipSize.html(that.options.sizeTip);//提示上传多少M
             if(that.options.setPopTip!=""){
                that.popTip.html(that.options.setPopTip);
             }
             $(window).resize(function(){
                that.positionPop();
             })
             this.positionPop();
             this.bindPop();
             YKFrontEndImgUpLoad.startMaskCallBack();//和页面交互:打卡弹框时的callback
         },
         getElem: function(){
             this.objMox=$(".YK_interact_utilPanel_mox");
             this.imgUpLoadPop = $(".YK_interact_imgUpLoad_popBox .YK_interact_utilPanel_pop");
             this.popTip = $(".YK_interact_utilPanelPopTip");
             this.tipSize = $(".YK_interact_utilPanelTipSize");
             this.saveBtn = $(".YK_interact_utilPanelBtn_save");
             this.closeBtn = $(".YK_interact_utilPanel_Popclose");
             this.cancelBtn = $(".YK_interact_utilPanelBtn_cancel");
             this.reSelectBtn = $(".YK_interact_utilPanelBtn_reSelect");
             this.cropImgBox = $(".YK_interact_imgUpLoad_cropBox");
         },
          /*重置裁剪界面*/
         resetUI:function(){
               var that = this;
               that.removeloading();
               that.removefailTip();
               if(that.jcrop_api){ 
                 that.jcrop_api.destroy();
               }
               this.upCropstatus = -2;//上传失败
               this.cropimgurl = "";//上传的图片
               this.afterCropimgurl = "";//裁剪的图片 
                  var html = "";
                  html += '<div class="YK_interact_ImgCrop_imgTargetBox"><span class="YK_interact_ImgCrop_Targetmox"></span><img src=""  style=" height:auto; display:none"  class="YK_interact_imgUpLoad_target"></div>';
                  html += '<div class="YK_interact_imgUpLoad_preview-pane">';
                  html += '<div class="YK_interact_imgUpLoad_preview-container" style="display:none;width:'+this.options.previewWidth+'px">';
                  html += '<img src=""   class="YK_interact_imgUpLoad_jcrop-preview" style="display:none; ">';
                  html += '</div>';
                  html += '</div>';
                  that.cropImgBox.html(html);
                  this.$target = $(".YK_interact_imgUpLoad_target");
                  this.$preview = $('.YK_interact_imgUpLoad_preview-pane');
                  this.$pcnt = $('.YK_interact_imgUpLoad_preview-pane .YK_interact_imgUpLoad_preview-container');
                  this.$pimg = $('.YK_interact_imgUpLoad_preview-pane .YK_interact_imgUpLoad_preview-container img');
                  this.$pcnt.show();
                  var pcntWidth = parseInt(this.$pcnt.css("width"));
                  var ratio = this.options.aspectRatio;
                  if(eval(ratio)>0){
                     this.$pcnt.height((pcntWidth/eval(ratio))+"px");
                  }
                  if(!this.options.needCrop){//不需要裁剪时直接显示一张图片
                        $(".YK_interact_utilPanel_popContent").addClass("notNeedCrop")            
                  }else{
                        $(".YK_interact_ImgCrop_imgTargetBox").addClass("YK_interact_ImgCrop_holder")
                  }
                  //保存按钮
                  this.saveBtn.removeClass("CanSave").addClass("CanNotSave");
         },
         bindPop: function(){
             var that = this;
             this.saveBtn.click(function(){
                  if($(this).hasClass("CanNotSave")){
                     return;
                   }
                  that.setCropCallback();
                  if(typeof that.jcrop_api!="undefined" ){
                      if(that.jcrop_api.tellScaled().w==0){                                                                                              
                        //  alert("请选择裁剪区域");
                          that.showfailTip("请选择裁剪区域");
                          return;
                       }
                      var params = {
                        "cropimgurl": that.cropimgurl,
                        "callback": "afterCropCallback", 
                        "x": that.jcrop_api.tellSelect().x/that.jcrop_api.getScaleFactor()[0],
                        "y": that.jcrop_api.tellSelect().y/that.jcrop_api.getScaleFactor()[1],
                        "_w": that.jcrop_api.getBounds()[0]/that.jcrop_api.getScaleFactor()[0],
                        "_h": that.jcrop_api.getBounds()[1]/that.jcrop_api.getScaleFactor()[1],
                        "h": that.jcrop_api.tellScaled().w,
                        "w": that.jcrop_api.tellScaled().h
                      }
                  }
                 if(that.options.needCrop == true){
                     if(that.cropimgurl!=""  && typeof that.jcrop_api != "undefined"){
                         that.addloadingV2();
                         var url = that.setUrlParam("///u/imgcrop",params);
                         $("#ykupImgIframe_a").attr("src",url);
                     }else{
                         that.showfailTip("请选择裁剪区域");
                     }
                  }
                  if(that.options.needCrop == false){//不需要裁剪则直接关闭弹框
                      that.closePop();
                  }
             });
             this.closeBtn.click(function(){
                  that.closePop();
             });
             this.cancelBtn.click(function(){
                 that.closePop();
             });
         },
          setCropCallback: function(){
                  var that = this;
                 // delete window.afterCropCallback;
                 // if(!window.afterCropCallback){
                       window.afterCropCallback = function(data){
                          that.removeloading();
                          switch(data.error){
                                case 1:
                                     that.afterCropimgurl = data.imgUrl;//设置裁剪后图片
                                     that.upCropstatus = 0;//上传并且裁剪成功
                                     that.closePop() 
                                     break;
                                case -2:
                                     utilPanelJsBridgeSDK.runLogin({});
                                     break;
                                case -1:
                                     that.showfailTip("系统错误");
                                     break;
                                case -3:
                                     that.showfailTip("上传图片过大");
                                     break;
                                case -4:
                                     that.showfailTip("格式错误");
                                     break;
                                 default:
                                     that.showfailTip("裁剪失败");
                          }
                   //  }
                }
         },
         closePop: function(){
               var that = this;
               $(".YK_interact_imgUpLoad_popBox").remove();
                $(".YK_interact_imgUpLoadInput").val("");
               if(that.jcrop_api){ that.jcrop_api.destroy()};
               YKFrontEndImgUpLoad.CloseMaskCallBack(that.upCropstatus,that.cropimgurl,that.afterCropimgurl,that.options.dataType);
         },
         /*上传时的loading*/
         addloading: function(){
               var html = utilPanelTemplate("imgUpLoad/imgUpLoad_loading");
               $(".YK_interact_utilPanel_popContent").append(html);
         },
         removeloading: function(){
                var that = this;
                $(".YK_interact_imgUpLoad_uploaddingImg").remove();
                that.removefailTip();
         },
         /*裁剪时的loading*/
         addloadingV2: function(){
                var that = this;
                that.setTipBox("图片裁剪中","YK_interact_imgUpLoad_upImgLoadingV2");
         },
         /**/
         showfailTip:function(txt){
                var that = this;
                that.setTipBox(txt,"YK_interact_imgUpLoad_upImgFail");
                setTimeout(function(){
                   that.removefailTip(); 
                },2000)
         },
         setTipBox: function(txt,cla){
                var that = this;
                var html = utilPanelTemplate("imgUpLoad/imgUpLoad_tip");
                $(".YK_interact_utilPanel_popContent").append(html);
                $(".YK_interact_utilPanelTipBox").removeClass("YK_interact_imgUpLoad_upImgLoadingV2")
                                                 .removeClass("YK_interact_imgUpLoad_upImgFail")
                                                 .addClass(cla);
                var objTip = $(".YK_interact_utilPanelTip");
                var w = objTip.width();
                objTip.css("margin-left",(-w/2)+"px");
                objTip.find("span").html('<i></i>'+txt);
         },
         removefailTip:function(){
                $(".YK_interact_utilPanelTipBox").remove();
         },
         //上传后裁剪界面初始化
         upImgCallBack:function(imgSrc){
              var that = this;
                   this.$pimg.attr("src",imgSrc).show();
                   this.$pcnt.show();
                   this.$target.attr("src",imgSrc).show();
                   var pcntWidth = parseInt(this.$pcnt.css("width"));
                   var ratio = this.options.aspectRatio;
                   if(eval(ratio)>0){
                    this.$pcnt.height((pcntWidth/eval(ratio))+"px");
                   }
             if(this.options.needCrop){ 
                  this.initCrop(); 
              }else{
                  this.$preview.hide();
              }
         },
         initCrop: function(){
               var that = this;
               var jcrop_api,
                   boundx,
                   boundy,
                   $preview = this.$preview,
                   $pcnt =this.$pcnt,
                   $pimg = this.$pimg,
                   xsize = $pcnt.width(),
                   ysize = $pcnt.height();
                   function updatePreview(c){
                    if(that.options.minSize[0]>boundx || that.options.minSize[1]>boundy){
                         that.showfailTip("图片过小");  
                         that.saveBtn.removeClass("CanSave").addClass("CanNotSave");
                         that.jcrop_api.release();      
                    }
                    if (parseInt(c.w) > 0) {
                         var rx = xsize / c.w;
                         var ry = ysize / c.h;
                          
                         $pimg.css({
                              width: Math.round(rx * boundx) + 'px',
                              height: Math.round(ry * boundy) + 'px',
                              marginLeft: '-' + Math.round(rx * c.x) + 'px',
                              marginTop: '-' + Math.round(ry * c.y) + 'px'
                          });
                       }
                  };
                  $(".YK_interact_imgUpLoad_target").Jcrop({
                     aspectRatio: xsize / ysize,
                   //  setSelect: that.options.setSelect,
                     maxSize:that.options.maxSize,
                     minSize:that.options.minSize,
                     minSelect:that.options.minSelect,
                      touchSupport:true,       
        //      trackDocument:false,
                     bgFade: true,
                     allowSelect: that.options.allowSelect,
                     allowResize: that.options.allowResize,
                     boxWidth:384,
                     boxHeight:384,
                     bgOpacity:0.3,
                     bgColor:"#939393",
                     onChange: updatePreview,
                     onSelect: updatePreview
                  },function(){
                         // Use the API to get the real image size
                     var bounds = this.getBounds();
                     boundx = bounds[0];
                     boundy = bounds[1];
                     // Store the API in the jcrop_api variable
                     that.jcrop_api = this;
                   //  updatePreview(that.jcrop_api.tellSelect());
                     this.setOptions({
                          setSelect:that.options.setSelect
                     })
                     var jW = that.jcrop_api.ui.holder.width();
                     var jH = that.jcrop_api.ui.holder.height();
                     var jtop = (384-jH)/2+1;
                     var jleft = (384-jW)/2+1;
                     that.jcrop_api.ui.holder.css({"top":jtop+"px","left":jleft+"px","float":"left","position":"relative"});
                     that.$preview.css({"top":-jtop+"px","left":(445-jleft)+"px"})
                     
                     // Move the preview into the jcrop container for css positioning
                     $preview.appendTo(that.jcrop_api.ui.holder);
                  });
         },
         positionPop: function(){
              var wh = $(window).height();
              var dh = $(document).height();
              var that = this;
              if(wh>dh){
                 that.objMox.css("height","100%");
              }else{
                 that.objMox.css("height",dh);
              }
              that.imgUpLoadPop.each(function(){
                  that.letDivCenter($(this));
              })
             
        },
         letDivCenter:function(objdiv){   
           var top = ($(window).height() - objdiv.height())/2;   
           var left = ($(window).width() - objdiv.width())/2;   
           var scrollTop = $(document).scrollTop();   
           var scrollLeft = $(document).scrollLeft();   
           objdiv.css( { position : 'absolute', 'top' : top + scrollTop,'marginTop' : '0px' ,'marginLeft':'0px', left : left + scrollLeft } );  
        },
        setUrlParam:function(url,params){
            var param = '';
            if(url.indexOf("?") == -1){
               url += "?";
            }
            for(var i in params){
               param += i+"="+params[i]+"&";
            }
            param = param.substring(0,param.length-1);
            url += param;
            return url;
       },
       preLoadImages:function(images,callback){
         
            var newimages=[], loadedimages=0;
            var images=(typeof images!="object")? [images] : images;
            function imageloadpost(){
                loadedimages++;
                if (loadedimages==images.length){
                   callback(newimages);
                }
            }
            for (var i=0; i<images.length; i++){
                newimages[i]=new Image();
                newimages[i].src=images[i];
                newimages[i].onload=function(){
                      imageloadpost();
                };
                newimages[i].onerror=function(){
                imageloadpost();
                };
            }
      }
         
   };
   return imgUpLoadModule;
})

// Youku/4.7.5 (Android 2.3; Youku_HD; Bridge_SDK; )
// Youku代表Youku UA, 4.7.5代表APP版本号;
// 其他参数放小括号里 用;来分隔

// Android 2.3表示当前设备系统和版本
// Youku_HD 表示当前设备是PAD ,无则代表是Phone
// Bridge_SDK 表示当前UA支持互动SDK,无代表不支持

// userAgent中至少应该包含Youku/4.7.5 (Android 2.3)，否则当other处理

// context: Youku
// version: 4.7.5
// System Type： iOS | Android
// System: 2.3
// Device Type：pad | phone
// Bridge_SDK

// YkCallBridge.2.0.js

(function(global, func) {
    typeof define === "function" && (define.amd || define.cmd) ? define(function() {
        return func(global);
    }) : func(global, true);
})(this, function(global, lazy) {
    // 是否优酷客户端
    var client = {
        youku: false,
        other: false
    };
    // 是否支持优酷SDK，以及版本号
    var youku = {
        bridgeSDK: false,
        version: ""
    }
    // 系统类型（只区分iOS和Android），版本
    var system = {
        iOS: false,
        android: false,
        winMobile: false,
        version: ""
    };
    // 设备类型
    var device = {
        // 为了向前兼容，保留pad和phone的key
        pad: false,
        phone: false,
        iPad: false,
        iPhone: false,
        iPod: false,
        androidPhone: false,
        androidPad: false,
        winPhone: false,
        winPad: false
    };
    var YkJsBridgeSDK = {};
    
    // var reg = /Youku\/([\d\.]+)\s*\((\w+)\s*([\d\.]+);?\s*([\w_]+)?;?\s*([\w_]+)?;?\)?/;

    var bridge = "YoukuJSBridge";
    var IPHONE_PROTOCOL_SCHEME = "youku";
    var IPAD_PROTOCOL_SCHEME = "youkuhd";
    var payInterface = "http://hudong.pl.youku.com/interact/player/do/interactPayNew";
    var CURRENT_PROTOCOL_SCHEME;
    var messagingIframe;
    var loadstatus, runLogin, play, loadUrl, share, jsbsubscrib, getUA, doPay;
    // 初始化客户端信息
    (function() {
        var ua = navigator.userAgent;
        // 测试userAgent
        // var ua = 'Youku/4.7.5 (Android 2.3.5; Youku_HD; Bridge_SDK;)';
        // var ua = 'Youku/4.7.5 (iOS 8.3.5; Youku_HD;)';
        var reg = /Youku\/([\d\.]+)/i;
        var bridgeToken = "Bridge_SDK";
        var sysReg = /(iOS|Android|Windows\s(?:Phone|Pad))\s([\d\.]+)/i;
        var oriSysReg = /CPU\s(?:iPhone\s)?OS\s([\d_]+)/;     // 原始iOS正则检测 sysReg规则不匹配，需重新检测
        var oraSysReg = /Android\s([\d\.])/i;         // 原始Android检测 sysReg 中已经包含，不需要再次检测
        var orwSysReg = /Windows\s(?:Phone|Pad)\s([\d\.])/i;         // 原始windows mobile 检测 sysReg已经包含
        // 优酷的pad标识
        var padToken = "Youku_HD";
        // 判断是否优酷客户端
        if (reg.test(ua)) {
            // 标识在优酷的客户端
            client.youku = true;
            // 取得优酷客户端的版本
            youku.version = RegExp.$1;
            // 检查是否支持bridgeSDK
            if (ua.indexOf(bridgeToken) > -1) {
                youku.bridgeSDK = true;
            }
            // 检测设备类型
            if (ua.indexOf(padToken) > -1) {
                device.pad = true;
                CURRENT_PROTOCOL_SCHEME = IPAD_PROTOCOL_SCHEME;
            } else {
                CURRENT_PROTOCOL_SCHEME = IPHONE_PROTOCOL_SCHEME;
                device.phone = true;
            }
        } else {
            client.other = true;
        }
        // 检测系统类型和版本
        // 先检测youkuUA中的系统信息
        if (sysReg.test(ua)) {
            RegExp.$1 === "iOS" ? system.iOS = true : system.android = true;
            switch(RegExp.$1) {
                case "iOS":
                    system.iOS = true;
                    break;
                case "Android":
                    system.android = true;
                    break;
                case "Windows":
                    system.winMobile = true;
                    break;
                default:
                    break;
            }
            system.version = RegExp.$2;
        // 如果没有的话，再去检测代理UA中的系统信息, iOS
        } else if (oriSysReg.test(ua)) {
            system.iOS = true;
            system.version = RegExp.$1.replace(/_/g, ".");
        }
        // 区分 iPhone iPad Android phone ...
        if (system.iOS) {
            if (ua.indexOf("iPhone") > -1) {
                device.iPhone = true;
            } else if (ua.indexOf("iPad") > -1) {
                device.iPad = true;
            } else if (ua.indexOf("iPod") > -1) {
                device.iPod = true;
            }
        } else if (system.android) {
            if (ua.indexOf("Mobile") > -1) {
                device.androidPhone = true;
            } else {
                device.androidPad = true;
            }
        } else if (system.winMobile) {
            if (ua.indexOf("Phone") > -1) {
                device.winPhone = true;
            } else {
                device.winPad = true;
            }
        }

    })();
    // 创建隐藏的iframe
    function createQueueReadyIframe() {
        var iframe = document.createElement("iframe");
        iframe.style.display = "none";
        document.documentElement.appendChild(iframe);
        return iframe;
    }
    messagingIframe = createQueueReadyIframe();

    // query url param
    function getUrlSearchParams() {
        var qs = (location.search.length > 0 ? location.search.substring(1) : "");
        var params = {};
        var items = qs.length ? qs.split("&") : [];
        var item = null;
        var name = null;
        var value = null;
        for (var i = 0, len = items.length; i < len; i++) {
            item = items[i].split("=");
            name = decodeURIComponent(item[0]);
            value = decodeURIComponent(item[1]);
            if (name.length) {
                params[name] = value;
            }
        }
        return params;
    }
    // encode URL
    function addURLParam(url, name, value) {
        url += (url.indexOf("?") == -1 ? "?" : "&");
        // 当value值为空字符串的时候，替换为null （iOS同学的要求）
        url += encodeURIComponent(name) + "=" + encodeURIComponent(value === "" ? null : value);
        return url;
    }
    // 不编码URL，原样添加
    function addURLParamNotEncode(url, name, value) {
        url += (url.indexOf("?") == -1 ? "?" : "&");
        url += name + "=" + (value === "" ? null : value);
        return url;
    }
    // 浅复制
    function clone(obj, target) {
        var i;
        for (i in obj) {
            // 参数检查
            if (i in target) {
                obj[i] = target[i];
            } else {
                throw new Error("缺少参数: " + "opt." + i);
            }
        }
    }

    // 判断loadURL时是否是播放页
    function isPlayUrl(url) {
        var reg = /\:\/\/v\.youku\.com\/v_show\/id_/;
        return reg.test(url);
    };

    // 解析出vid
    function matchVid(url) {
        var reg = /\/id_(.+)\.html/;
        return reg.exec(url)[1];
    }
    // 对比版本号
    function compareVer(currentVer, targetVer) {
        // currentVer > targetVer return 1
        // currentVer < targetVer return -1;
        // currentVer == targetVer return 0;
        // ver: '4.1.2.3'
        var cArr = currentVer.split(".");
        var tArr = targetVer.split(".");
        var cItem, tItem;
        var result = 0;
        for (var i = 0, len = cArr.length; i < len; i++) {
            cItem = parseInt(cArr[i]);
            tItem = parseInt(tArr[i]);
            if (cItem > tItem) {
                result = 1;
                break;
            } else if (cItem < tItem) {
                result = -1;
                break;
            }
        }
        return result;
    }
    // 原始方法（分支中可被重写)
    getUA = function() {
        return {
            client: client,
            youku: youku,
            system: system,
            device: device
        };
    };
    // 支付
    doPay = function(opt) {
        // opt = {
        //     vip_id: "hudong",
        //     periods: 1,
        //     return_url: "",
        //     salePrice: {
        //         target_user_id: "target_user_id",
        //         order_key: "order_key",
        //         device: ""
        //     },
        //     pay_channel: 100
        // }
        var url = payInterface;
        url = addURLParamNotEncode(url, "target_user_id", opt.salePrice.target_user_id);
        url = addURLParamNotEncode(url, "order_key", opt.salePrice.order_key);
        url = addURLParamNotEncode(url, "source", "alipay");
        url = addURLParam(url, "return_url", opt.return_url);
        url = addURLParam(url, "device", opt.salePrice.device);
        location.href = url;
    };
    // 初始化分支
    (function() {
        // Android youku
        if (client.youku && youku.bridgeSDK && system.android) {
            // 添加全局方法（登录成功后native会调用)
            window.showLoginViewCallback = function(data) {
                window.location.reload();
            };

            // 加载数据是否成功(Android占位)
            loadstatus = function(opt) {};

            // 登录
            // arguments {duid: "", weburl: ""}
            // duid：可选，当通过点击h5订阅按钮，需要标识订阅某个订阅ID并调起native登陆的情况需要传入
            // weburl：必选，需要encode，h5通知sdk登陆成功后要刷新的url
            runLogin = function(opt) {
                YoukuJSBridge.showLoginView(JSON.stringify({}));
            };

            // 播放
            // arguments {source: "", vid: "", showid: "", playlistid: "", cookieid: ""}
            play = function(opt) {
                var url = "youku://play";
                var data = {
                    source: "",
                    vid: ""
                };
                var i;
                clone(data, opt);
                for (i in data) {
                    url = addURLParam(url, i, data[i]);
                }
                if (typeof opt.cookieid !== "undefined") addURLParam(url, "cookieid", opt["cookieid"]);
                window.location.href = url;
            };

            // 加载URL
            // arguments {url: "", shouldOverride: "", width: "", height: "", source: "", webViewPlay: "", dst: ""}
            loadUrl = function(opt) {
                var data = {
                    url: "",
                    shouldOverride: "",
                    width: "",
                    height: "",
                    source: ""
                };
                // 判断要加载的url是否是播放页，如果是播放页则调用播放，跳出
                if (opt.webViewPlay && isPlayUrl(opt.url)) {
                    this.play({source: opt.source, vid: matchVid(opt.url)});
                    return;
                }
                clone(data, opt);
                if (typeof opt.dst !== "undefined") data.dst = opt.dst;
                YoukuJSBridge.loadUrl(JSON.stringify(data));
            };

            // 分享
            // arguments {title: "", weburl: "", imageurl: ""}
            share = function(opt) {
                var data = {
                    url: opt.weburl,
                    title: opt.title,
                    image: opt.imageurl
                }
                YoukuJSBridge.showShareView(JSON.stringify(data));
            }

            // 订阅状态回传
            // arguments {duid: "", status: ""}
            jsbsubscrib = function(opt) {
                // android暂不支持，站位
            }
            // android youku client 4.8.1以上的版本
            if (compareVer(youku.version, '4.8.1') >= 0) {
                // 支付
                doPay = function(opt) {
                    var saleParam = "";
                    var data = {};
                    data.vip_id = opt.vip_id || "hudong|";
                    data.periods = opt.periods || 1;
                    data.pay_channel = opt.pay_channel;
                    saleParam = addURLParam(saleParam, "target_user_id", opt.salePrice.target_user_id);
                    saleParam = addURLParam(saleParam, "order_key", opt.salePrice.order_key);
                    saleParam = addURLParam(saleParam, "native", true);
                    saleParam = saleParam.slice(1);
                    data.vip_id += encodeURIComponent(saleParam);
                    // alert(JSON.stringify(data));
                    YoukuJSBridge.doPay(JSON.stringify(data));
                };
            }
        // iOS youku
        } else if (client.youku && youku.bridgeSDK && system.iOS) {
            loadstatus = function(opt) {
                var url = CURRENT_PROTOCOL_SCHEME + "://" + "jsbwebloadstatus";
                url = addURLParamNotEncode(url, "success", opt.status);
                messagingIframe.src = url;
            };

            runLogin = function(opt) {
                var url = CURRENT_PROTOCOL_SCHEME + "://" + "jsblogin";
                if (typeof opt.duid !== "undefined") url = addURLParamNotEncode(url, "duid", opt.duid);
                if (typeof opt.weburl !=="undefined") url = addURLParam(url, "weburl", opt.weburl);
                messagingIframe.src = url;
            };

            play = function(opt) {
                var url = CURRENT_PROTOCOL_SCHEME + "://" + "jsbplay";
                var data = {
                    source: "",
                    vid: ""
                };
                var i;
                clone(data, opt);
                for (i in data) {
                    url = addURLParamNotEncode(url, i, data[i]);
                }
                url = (typeof opt.showid !== "undefined") ? addURLParamNotEncode(url, "showid", opt["showid"]) : addURLParamNotEncode(url, "showid", "");
                url = (typeof opt.playlistid !== "undefined") ? addURLParamNotEncode(url, "playlistid" ,opt["playlistid"]) : addURLParamNotEncode(url, "playlistid", "");
                messagingIframe.src = url;
            };

            loadUrl = function(opt) {
                var url = CURRENT_PROTOCOL_SCHEME + "://" + "jsbjump";
                // 跳转到百川的协议
                var bcUrl = CURRENT_PROTOCOL_SCHEME + "://" + "jsbjumpbaichuan";
                // 半屏幕webview
                var halfScreenUrl = CURRENT_PROTOCOL_SCHEME + "://" + "jsbjumphalfscreen";

                var data = {
                    weburl: opt.url
                };
                var i;
                if (opt.webViewPlay && isPlayUrl(opt.url)) {
                    this.play({source: opt.source, vid: matchVid(opt.url)});
                    return;
                }
                // 5.4及以上版本才可百川sdk
                if (typeof opt.dst !== "undefined") {
                    if (opt.dst === 1 && compareVer(youku.version, '5.4') >= 0) {
                        bcUrl = addURLParam(bcUrl, "weburl", data.weburl);
                        messagingIframe.src = bcUrl;
                        return;
                    }
                }
                if (typeof opt.dst !== "undefined" && opt.dst === 2) {
                    halfScreenUrl = addURLParam(halfScreenUrl, "weburl", data.weburl);
                    messagingIframe.src = halfScreenUrl;
                    return;
                }
                if (opt.shouldOverride) {
                    window.location.href = opt.url;
                    return;
                }
                for (i in data) {
                    url = addURLParam(url, i, data[i]);
                }
                messagingIframe.src = url;
            };

            share = function(opt) {
                var url = CURRENT_PROTOCOL_SCHEME + "://" + "jsbshare";
                var data = {
                    title: "",
                    weburl: "",
                    imageurl: ""
                };
                var i;
                clone(data, opt);
                for (i in data) {
                    url = addURLParam(url, i, data[i]);
                }
                messagingIframe.src = url;
            };

            jsbsubscrib = function(opt) {
                var url = CURRENT_PROTOCOL_SCHEME + "://" + "jsbsubscrib";
                var data = {
                    duid: "",
                    status: ""
                };
                var i;
                clone(data, opt);
                for (i in data) {
                    url = addURLParamNotEncode(url, i, data[i]);
                }
                messagingIframe.src = url;
            }
        // other
        } else {
            loadstatus = function(opt) {};

            runLogin = function(opt) {
                var param;
                if (window.login) {
                    if (/(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent)) {
                        param = function(){
                            window.location.reload();
                        }
                    } else {
                        param = {
                            type: 'login',
                            uaction: 'login',
                            callBack: function(){
                                window.location.reload();
                            }
                        }
                    };
                    window.login(param);
                } else {
                    window.location.href = 'http://www.youku.com/user_login';
                }
            };

            play = function(opt) {
                //http://v.youku.com/v_show/id_XMTI1NDM3MzAwMA==.html
                var url = "http://v.youku.com/v_show/id_" + opt.vid + ".html";
                window.location.href = url;
            };

            loadUrl = function(opt) {
                window.location.href = opt.url;
            };

            share = function(opt) {
                // 不支持分享
            };

            jsbsubscrib = function(opt) {
                // 不支持订阅回传
                var duid = opt.duid;
                var status = opt.status;
                var url = "http://i.youku.com/u/subToUpdates";
                var statusUrl;
                if (typeof duid === "undefined") throw new Error("缺少duid");
                if (typeof status === "undefined") throw new Error("缺少status");
                if (status !== "on" && status !== "off") throw new Error("status只能为on或off");
                statusUrl = status === "on" ? "follow" : "unfollow";
                url += "?" + statusUrl + "=" + duid;
                messagingIframe.src = url;
            };
        }
    })();

    YkJsBridgeSDK = {
        loadstatus: loadstatus,
        runLogin: runLogin,
        play: play,
        loadUrl: loadUrl,
        share: share,
        jsbsubscrib: jsbsubscrib,
        getUA: getUA,
        doPay: doPay,
        compareVer: compareVer
    }

    // start
    var mussy = useless();
    var getMsy = function(options) {
        var result = {};
        var i,
            len,
            key;
        if (options && options instanceof Array && options.length > 0) {
            for (i = 0, len = options.length; i < len; i++) {
                key = options[i]
                result[key] = mussy[key]
            }
        } else {
            result = mussy;
        }
        return result;
    }
    YkJsBridgeSDK.getMsy = getMsy;
    // end


    return lazy ? global.YkJsBridgeSDK = YkJsBridgeSDK : YkJsBridgeSDK;


    // Some useless code
    function useless() {
        var ua = navigator.userAgent;
        var urlSearchParams = getUrlSearchParams();
        var guidReg = /GUID\s([^\s\;\)]+)/i;
        var mussy = {
            platform: 10,
            platform_type: parseInt(urlSearchParams["platform_type"]) || 99,
            device: 0,  // 默认是PC
            Sc: 99,
            resolution: "",
            userAgent: ua,
            guid: ""
        };
        var i, temp;

        // 取platform

        // 取platform_type

        // 取device
        for (i in device) {
            // pad 和 Phone 是从 youku_HD 检查来，并不能区分系统，所以跳过
            if (i === "pad" || i === "phone") continue;
            
            if (device[i]) {
                switch(i) {
                    case "iPhone":
                        temp = 1;
                        break;
                    case "androidPhone":
                        temp = 2;
                        break;
                    case "iPad":
                        temp = 3;
                        break;
                    case "androidPad":
                        temp = 4;
                        break;
                    case "winPhone":
                        temp = 5;
                        break;
                    case "winPad":
                        temp = 6;
                        break;
                    default:
                        temp = 0;
                        break;
                }
                mussy.device = temp;
                temp = null;
                break;
            }
        }
        // 取Sc
        if (client.youku) mussy.Sc = 1;
        // 取resolution

        // 取guid
        if (guidReg.test(ua)) mussy.guid = RegExp.$1;
         
        return mussy;
    }
});

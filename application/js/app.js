(function($,owner){
	var openDebug = false;
	owner.name = "unitedFront",
	owner.config = {
		// serverUrl:"https://tongzhan.info",
		serverUrl:"http://211.136.105.83"
		// serverUrl:"http://192.168.1.102:8088"
	};
	
	owner.util = {
		isEmpty: function(value,msg) {
			if(value == null || value == "") {
				$.alert(msg);
				return true;
			}else return false;
		},
		
		print: function(url,updata) {
			if(openDebug) {
				var href = location.href.split("www")[1];
				console.log(href + " : line " + arguments['0']);
				for(var k in arguments) {
					console.log(JSON.stringify(arguments[k]));
				}
			}
		},
		
		validPhone: function(phone) {
			var regex = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/
			phone = phone + "";
            return regex.test(phone);
		},
		dateFormat: function(number) {
			var d = new Date(number);
			var format = d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() + '日 '
				+ d.getHours() + '点' + d.getMinutes() + '分' + d.getMinutes() + '秒';
			return format;
		},
		dateFormat2: function(number) {
            var d = new Date(Number(number));
            var format = d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() + '日';
            return format;
        },
		identityCodeValid: function(code) {
                var city={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江 ",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北 ",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏 ",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外 "};
                var tip = "";
                var pass= true;

                if(!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)){
                    tip = "身份证号格式错误";
                    pass = false;
                }

                else if(!city[code.substr(0,2)]){
                    tip = "地址编码错误";
                    pass = false;
                }
                else{
                    //18位身份证需要验证最后一位校验位
                    if(code.length == 18){
                        code = code.split('');
                        //∑(ai×Wi)(mod 11)
                        //加权因子
                        var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
                        //校验位
                        var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
                        var sum = 0;
                        var ai = 0;
                        var wi = 0;
                        for (var i = 0; i < 17; i++)
                        {
                            ai = code[i];
                            wi = factor[i];
                            sum += ai * wi;
                        }
                        var last = parity[sum % 11];
                        if(parity[sum % 11] != code[17]){
                            tip = "校验位错误";
                            pass =false;
                        }
                    }
                }
                if(!pass) mui.alert(tip);
                return pass;
       },
       licenseCodeValid(code) {
       		return true;
       },
       passportValid(code) {
       		return true;
       },
       emailValid(email) {
           return /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(email);
       },
	   truncateString:function(str, len) {
            var str = "" + str;
            if(str.length > len) {
                return str.substring(0,len) + "..."
            }
            return str;
        },
		getURLParam: function(name,url){
			var str = new RegExp(name + "=([^&]+)");
			var flag = str.test(url);
			if(!flag) return '';
			return str.exec(url)[1] || '';
		}
		
	};
	
	owner.setData = function(key, value) {
		if(typeof(plus) == 'undefined') return false;
		plus.storage.setItem(App.name + key,JSON.stringify(value));
	};
	
	owner.getData = function(key) {
		if(typeof(plus) == 'undefined') return null;
		return JSON.parse(plus.storage.getItem(App.name + key) || null);
	}
	
	owner.getErrorText = function(type) {
			var errorText = "访问后台服务失败了";
			switch (type){
				case "timeout":
					errorText = "连接超时，网速有点慢哦";
					break;
				case "error":
					errorText = "后台服务出现了一点小问题";
					break;
				case "abort":
					errorText = "网络连接中断了呢";
					break;
				case "parsererror":
					errorText = "解析数据时出了点问题";
					break;
				default:
					break;
			}
			return errorText;
	};
	// 该方法依赖mui.js和plus.js
	owner.ajax = function(options) {
		var url = options.url || "";
		url = App.config.serverUrl + url;
		App.util.print(options.line,url,options.data || {}); 
		var currentUser = null;
		var wait = null;
		if(typeof(plus) != 'undefined') {
			currentUser = App.getData("currentUser");
			wait = plus.nativeUI.showWaiting("处理中...");
		} 
		var async = true;
		if(false === options.async) async = false;
		mui.ajax(url,{
			async:async,//是否异步
			crossDomain:true,//强制使用5+跨域
			data:options.data || {},
			dataType:'json',//服务器返回json格式数据
			type:'post',//HTTP请求类型
			timeout:10000,//超时时间设置为10秒；
			headers:{
				'Content-Type':'application/x-www-form-urlencoded',
				'req-origin':'html5+app',
				'login-token':currentUser ? currentUser.loginToken || '' : '',
			},	              
			success:function(data){
				if(wait != null) wait.close();
				var href = location.href;
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if(data.success) {
					options.success(data);
				}else{
					if("登陆令牌已失效，请重新登陆！" == data.message) {
						// 如果请求来自于首页，则不跳登陆；
						if(/news\/index\.html$/.test(href)) return;
						if(typeof(plus) !== "undefined") {
                            plus.webview.getLaunchWebview().evalJS("openLoginView()");
                        }
					} else {
                        mui.toast(data.message);
                    }
				}
			},
			error:function(xhr,type,errorThrown){
				if(wait != null) wait.close();
				//异常处理；
				App.util.print(options.lineNo,type,errorThrown);
				mui.toast(App.getErrorText(type));
			}
		})
	}
})(mui,window.App = {});

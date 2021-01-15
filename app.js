
// isThirdPlatform 开发模式：  true 第三方开发， false 独立开发
var isThirdPlatform = true;

//app.js
App({
	onLaunch: function (e) {
		this.globalData.scene = e.scene
		const app = this;
		if( isThirdPlatform ){
			// 第三方平台开发---执行函数
			app.thirdPlatform();
		}
		else{
			// 非第三方平台开发---执行函数
			app.nonThirdPlatform();			
		}

	},
  
	// 1.第三方平台
	thirdPlatform: function(){
		var app = this;

		// 获取第三方平台自定义的数据字段
		let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
		// console.log( 'extConfig = ' + JSON.stringify(extConfig) );
		app.globalData.extConfig = extConfig;
		if( extConfig.extappid ){
			app.checkLogin();
		}
		else{
			app.common.showModal('获取第三方自定义数据失败！');
		}
		
		// 没有首页图片，则使用默认的
		if( !extConfig.indexbanner ){
			app.globalData.extConfig.indexbanner = app.globalData.extConf.indexbanner;
		}
	},

	// 2.非第三方平台
	nonThirdPlatform: function(){
		var app = this;

		// 非第三方， 在下面globalData.extConf中设置固定参数
    app.globalData.extConfig = app.globalData.extConf;
		app.checkLogin();
	},

	checkLogin: function(){
		var app = this;

		var isLogin = wx.getStorageSync('isLogin');
		var sessionid = wx.getStorageSync('sessionid');
		var customeruid = wx.getStorageSync('customeruid');
   
		// console.log('storage  isLogin = ' + isLogin + '     sessionid = ' + sessionid);
		if( isLogin && sessionid ){
			// console.log( '  ********  1  免登录 ');
			app.globalData.isLogin = true;
			app.globalData.sessionid = sessionid;
			app.globalData.customeruid = customeruid;
     
			wx.setStorageSync('isLogin','true');
			wx.setStorageSync('sessionid',sessionid);
			wx.setStorageSync('customeruid',customeruid);
		}
		else{
			// console.log( '  ********  2  登录 ');
			app.ruiposLogin(false);
		}
	},
	// 登录
	ruiposLogin: function(option){
		var app = this;

		wx.login({
			success: function (res) {
				if (res.code) {
          wx.setStorageSync('loginCode', res.code);//用于支付code
					wx.request({
						url: app.config.host + app.config.url + '/newwxa/user/login',
						data: {
							entvesion: app.globalData.extConfig.entvesion,
							entcode: app.globalData.extConfig.entcode,
							extappid: app.globalData.extConfig.extappid,
							code: res.code,
						},
						dataType: 'json',
						method: 'POST',
						header: {
							// 'content-type':'application/json',  //	GET 方法
							'content-type':'application/x-www-form-urlencoded',		//  POST 方法的设置
						},
						success: function(res){
							// console.log( '睿博 login success res = ' + JSON.stringify(res) );
							if( res.data ){
								if( res.data.code==0 ){
									if( res.data.sessionid ){
										var data = res.data;
										app.globalData.isLogin = true;
										app.globalData.customeruid = data.items.customeruid;
                    // console.log(data.sessionid);
										app.globalData.sessionid = data.sessionid;
										wx.setStorageSync('isLogin','true');
										wx.setStorageSync('sessionid',data.sessionid);
										wx.setStorageSync('customeruid',data.items.customeruid);

										wx.setStorageSync('sessionkey',data.sessionkey);
                    wx.setStorageSync('wx_openid', data.items.wx_openid);
                  
                  
                  
										if( option ){
											option.data.sessionid = data.sessionid;
											app.req(option);
										}
									}
									else{
										app.common.showModal('登录失败，请点击重新登录', function(){
											app.ruiposLogin(option);
										});
									}
								}
								else{
									app.common.showModal(res.data.msg);
								}
							}
							else{
								app.common.showModal(res.errMsg);
							}
						},
						fail: function(res){
							// console.log( '睿博 login fail res = ' + JSON.stringify(res) );
							if( res.data && res.data.msg!=='' ){
								app.common.showModal(res.data.msg);
							}
							else if( res.errMsg=='request:fail timeout' ){

								wx.showModal({
									content: '请求超时，点击确定稍后会继续请求。',
									confirmColor: '#fa4d4f',
									success: function(res){
										if( res.confirm ){  // 点击确定按钮
											setTimeout(function(){
												app.ruiposLogin(option);
											},2000);
										}
									}
								})
							}
							else{
								app.common.showModal(res.errMsg);
							}
						}
					})
				}
			},
			fail: function(res){
				app.common.showModal(res.errMsg);
			}
		});
	},

	globalData: {
		extConfig: null,		// 模板会获取真实 ext_json真实参数
		scene:null, //小程序场景值，用于判断进入小程序的方式
		extConf: {				// 开发非模板时固定参数
			"entvesion": "",
			"entcode": "",
			"extappid": "",
      "dytemplate": "",
      // "theme": {
      //   "major": "#FF553E",
      //   "minor": "#FFFBC7",
      //   "assist": "#FCD2D0"
      // },
			"indexbanner": "/image/index_banner.png",
		},

		isLogin: false,
		sessionid: wx.getStorageSync('sessionid'),
		customeruid: wx.getStorageSync('customeruid'), // 顾客uID
		memInfo: null,		// 顾客信息， getMemInfo 的返回数据
		mobileno: null,		// 手机号码

		userInfo: null,
		time: 3000,     	// 消息提示显示时间

		tablecode: '',  	// 桌台号， 订餐时扫码会带该参数

		city: '',			// 当前城市
		store: null,    	// 门店
		location: null, 	// 定位
		selectData: null, 	// 已选商品
		searchGood: null,//
		total: {			// 已选商品和， 包含价格和数量
			total:0,
			money:0
		},
    grantitems:[],//优惠券列表

		buid: null,				// 订单号
		buidIsCreate: false,  	// 支付页面用，该支付订单是否是刚刚提交订单过来支付的，是true， 否则false
		billAgain: false,   	// 点击再来一单时为 true

		// 状态,  0 未接单   1 已接单   2 已完成    3 已退单    -1 已取消
		billStatesConst: {
			'0': '待接单',
			'1': '制作中',
			'2': '已完成',
			'3': '已退单',
			'4': '配送中',
			'-1': '已取消'
		},

		// 支付状态， 0 未支付   1 已支付   2 退款中   3 已退款
		payStatesConst: {
			'0': '未支付',
			'1': '已支付',
			'2': '退款中',
			'-1': '已退款'
		},
		//退款状态
		refeudstateConst:{
			"0": "无状态",
			"1": "申请退款中",
			"2": "拒绝退款",
			"3": "退款中", 
			"4": "取消退款",
			"5": "退款完成"
		},
		//配送状态
		deliverystateConst:{
			"0": "待接单",
			"1": "待配送",
			"2": "配送中",
			"3": "配送完成", 
			"4": "配送取消"
		},
		//底部导航
		tabbarData:{
			selected: 0,
			color: "#7A7E83",
			selectedColor: "#FF0000",
			list: [
				{
					"pagePath": "pages/home/storeIndex/storeIndex",
					"iconPath": "icon-xiaochix",
					"text": "点餐"
				},
				{
					"pagePath": "pages/order/orderList/orderList",
					"iconPath": "icon-dingdanx",
					"text": "订单"
				},
				{
					"pagePath": "pages/user/userHome/userHome",
					"iconPath": "icon-wodex",
					"text": "我的"
				}
			]
		}
	},


	// 固定需要的配置
	config: {
		// zhoumim自己qq申请的开发key值，申请地址: http://lbs.qq.com/qqmap_wx_jssdk/index.html
		qqmapsdkKey: 'XJRBZ-BH46Q-R4W5M-GXKEG-SGL62-PJB6Z',  
    // host: 'https://csdev.weipos.com',
		// url: '/newTestStoresManage',
		
    // host: 'https://wx.weipos.com',
    // url: '/newStoresManage',
    host: 'http://localhost:8082',
    url: '/StoresManage',
	},

	req: function(option){
		var app = this;
		var that = option.that;

		if( option.loading ){

			wx.showLoading({                                                          
				title: option.loadingText ? option.loadingText : '正在加载...',
				mask: true,
				success: function(res){

					app.request(that, option);
				}
			})
		}
		else{
			app.request(that, option);
		}
	},
	request: function(that, option){
		var app = this;

		wx.request({
			url: app.config.host + app.config.url + option.url,
			data: option.data,
			method: option.method ? option.method : 'POST',
			header: option.header ? option.header : {
				'content-type':'application/x-www-form-urlencoded;charset=UTF-8',
			},
			success: function(res){
				// console.log( 'res = ' + JSON.stringify(res) );
				if( res.data ){
					if( res.data.code==0 ){
						option.success(res.data);
					}
					// 10110 用户登陆超时，或者未登陆
					else if( res.data.code==10110 ){
            app.ruiposLogin(option);
						// app.open.tips(that, {
						// 	msg: res.data.msg,
						// 	yesCallback: function(){
						// 		app.ruiposLogin( option );
						// 	}
						// })
					}					
					// 如果是placeOrder提交订单页面的 getMemInfoByBill 方法 [[ **********************
					else if( option.url=='/wxa/user/getMemInfoByBill' && res.data.code==10118 ){
						option.success(res.data);
					}
					// 如果是placeOrder提交订单页面的 getMemInfoByBill 方法 ************************ ]]
					else{
						if( option.successFail ){
							option.successFail(res.data);
						}
						else{
							if(option.url=='/newwxa/user/miniProgramsActivity' && res.data.code==-1){
								return
							}
							var str = res.data.msg;
							that.tips(str);
						}
					}
				}
				else{
					that.tips(res.errMsg);
				}
			},
			fail: function(res){
				// 如果是storeIndex首页，默认广告图显示 [[ **********************
				if( option.url=='/wxa/store/getStoreList' ){
					that.setData({ 
						bannerView: true
					});
				}
				// 如果是storeIndex首页，默认广告图显示 ************************ ]]
				
				// 微信返回的  res.errMsg,  自己接口返回的 res.data.msg
				if( res.data && res.data.msg!=='' ){
					if( option.fail ){
						option.fail();
					}
					else{
						var str = res.data.msg;
						that.tips(str);
					}
				}
				else if( res.errMsg=='request:fail timeout' || res.errMsg.indexOf('request:fail failed to connect')>-1 || res.errMsg.indexOf('Connection timed out') ){
					wx.showModal({
						content: '请求超时，请稍后再试。',
						confirmColor: '#fa4d4f',
						/*success: function(res){
							if( res.confirm ){  // 点击确定按钮
								setTimeout(function(){
									app.req(option);
								},2000);
							}
						}*/
						showCancel: false,
					})
				}
				else{
					that.tips(res.errMsg);
				}
			},
			complete:function(res){
				// console.log( 'complete res = ' + JSON.stringify(res) );
				if( option.loading ){
					wx.hideLoading();
				}
			}
		})

	},
	
	tips: function(msg,callback){
		app.open.tips(that, {
			msg: msg,
	yesCallback: callback
		})
	},


	common:{
		showModal: function(tips, successCallbackFn){

			wx.showModal({
				content: tips,
				showCancel: false,
				confirmColor: '#fa4d4f',
				success: function(res){
					if( res.confirm ){  // 点击确定按钮
						successCallbackFn && successCallbackFn();
					}
				}
			})
		}

	},

	// 见 template.wxml
	open: {
		/**
		 * open 中 page data或事件汇总：
		 * 		tipsShow
		 * 		tipsTitle
		 * 		tipsMsg
		 * 		yesBtn
		 * 		yesBtnText   共用
		 * 		noBtn
		 * 		noBtnText
		 * 		yesCallback  共用
		 * 		noCallback
		 * 		tipsHide 	 事件
		 *
		 * 		timeTipsShow
		 * 		timeTipsMsg
		 * 		timeTipsHide 事件
		 *   	
		 * 		payTipsShow
		 * 		isPaySuccess
		 * 		payTipsMsg
		 * 		yesBtnText
		 * 		yesCallback
		 * 		payTipsHide  事件
		 */

		/**
		 * tips option param:
		 * 		title: 提示文字，非必填
		 * 		msg: 提示消息，必填
		 * 		yesBtnText: 确定按钮文本，非必填，有默认值
		 * 		noBtn: 是否需要取消按钮，非必填
		 * 		noBtnText: 取消按钮文本，noBtn为true时显示，有默认值
		 *   	yesCallback: 确定按钮回调，非必填
		 *    	noCallback: 取消按钮回调，非必填
		 */
		tips: function(that, option){

			that.setData({

				'tipsShow': true,
				'tipsTitle': option.title ? option.title : false,
				'tipsMsg': option.msg ? option.msg : '返回消息丢了，请稍后再试！',

				'yesBtn': true,            // 默认有确定按钮,至少有一个确定按钮
				'yesBtnText': option.yesBtnText ? option.yesBtnText : '确定',

				'noBtn': option.noBtn ? option.noBtn : false ,
				'noBtnText': option.noBtnText ? option.noBtnText : '取消',

			})

			// 确定按钮
			if( option.yesCallback ){
				that.yesCallback = function(){
					option.yesCallback();
					that.tipsHide();
				}
			}
			else{
				that.yesCallback = function(){
					that.tipsHide();
				}
			}

			// 取消按钮
			if( option.noCallback ){
				that.noCallback = function(){
					option.noCallback;
					that.tipsHide();
				}
			}
			else{
				that.noCallback = function(){
					that.tipsHide();
				}
			}

			that.tipsHide = function(){
				that.setData({
					'tipsShow': false
				})
			}

		},

		// 停留指定时间的提示。无按钮 
		timeTips: function(that, timeTipsMsg){

			that.setData({
				'timeTipsShow': true,
				'timeTipsMsg': timeTipsMsg,
			})
			that.timeTipsHide = function(){
				that.setData({
					'timeTipsShow': false
				})
			}

			setTimeout(function(){
				that.timeTipsHide();
			}, 1000 );
		},

		/**
		 * 支付提示
		 * tips option param:
		 * 		msg: 提示消息，必填
		 * 		isPaySuccess: 成功或失败，必填， true成功，false失败
		 * 		yesBtnText: 确定按钮文本，必填
		 *   	yesCallback: 确定按钮回调，非必填，建议有
		 */
		payTips: function(that, option){
			that.setData({
				'payTipsShow': true,
				'isPaySuccess' : option.isPaySuccess,
				'payTipsMsg': option.msg,
				'yesBtnText': option.yesBtnText
			})

			// 重新支付按钮回调
			if( option.yesCallback ){
				that.yesCallback = function(){
					option.yesCallback();
					that.payTipsHide();
				}
			}
			else{
				that.yesCallback = function(){
					that.payTipsHide();
				}
			}

			that.payTipsHide = function(){
				that.setData({
					'payTipsShow': false
				})
			}
		},
		// 无取消按钮的 支付成功提示
		paySuccessTips: function(that, option){
			that.setData({
				'paySuccessTipsShow': true,
				'paySuccessTipsMsg': option.msg,
				'paySuccessYesBtnText': option.yesBtnText
			})
			that.paySuccessYesCallback = function(){
				option.yesCallback();
				that.paySuccessTipsHide();
			}

			that.paySuccessTipsHide = function(){
				that.setData({
					'paySuccessTipsShow': false
				})
			}
		},
		// 单据退款理由
		refueResonTips: function(that, option){
			that.setData({
				'refueResonTipsShow': true,
				'refueResonTipsMsg': option.msg,
				'refueResonYesBtnText': option.yesBtnText
			})
			that.refueResonCallback = function(){
				option.yesCallback();
				that.refueTipsHide();
			}

			that.refueTipsHide = function(){
				that.setData({
					'refueResonTipsShow': false
				})
			}
		}

	},
	onShow:function(){
		this.globalData.tabbarData = [{
      pagePath: "/pages/index",
      iconpath: "icon-xiaochix",
      text: "点餐"
		},
		{
      pagePath: "/pages/order/orderList/orderList",
      iconpath: "icon-dingdan",
      text: "订单"
    },
		 {
      pagePath: "/pages/user/userHome/userHome",
      iconpath: "icon-wodex",
      text: "我的"
    }]
	}

})
// pages/recharge/recharge.js
var common = require('../../utils/common.js');
let app = getApp();
let that = null;
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		theme: app.globalData.extConfig.theme, //主题色
		moneyQuantity: [],
		acrtiveMoney: {
			
		},
		balance: 0, //余额
		entname: "企业名称会员卡",
		wxcarduid:"",
		memid:"",
		scarduid:"",
		memitems:"",
		ortherMoney:"",
		inputRechaarge:false,
		agreeBtn:true, //勾选协议，默认勾选
	},
	moneyInput: function(e){
		that.setData({
			ortherMoney: e.detail.value
		})
	},
	agreementTopUp:function(e){
		wx.navigateTo({
		  url: '../agreement/agreement',
		})
	},
	agree: function(){
		that.setData({
			agreeBtn:!that.data.agreeBtn
		})
	},
	blurTofixed: function(e){
		if(e.detail.value != 0){
			e.detail.value = Number(e.detail.value).toFixed(2)
			that.setData({
				ortherMoney: Number(e.detail.value).toFixed(2)
			})
		}
		that.setData({
			inputRechaarge:false
		})
	},
	focusInput: function(e){
		that.setData({
			inputRechaarge:true
		})
	},
	rechargeMoney: function(e) {
		let index = e.currentTarget.dataset.index; //点击充值金额下标
		var xiabiao = "moneyQuantity[" + index + "].recharge"; //选中时设置标签样式

		for (let i = 0; i < that.data.moneyQuantity.length; i++) {
			var xiabiaos = "moneyQuantity[" + i + "].recharge"
			that.setData({
				[xiabiaos]: false
			})
		}
		that.setData({
			[xiabiao]: true
		})
		that.setData({
			acrtiveMoney: this.data.moneyQuantity[index]
		})
		console.log(this.data.acrtiveMoney)
	},
	rechargebtn: function() {
		if(!that.data.agreeBtn){
			that.timeTips("请先同意协议")
			return
		}
		if(that.data.moneyQuantity.length == 0 && that.data.ortherMoney <= 0){
			that.timeTips("请输入金额")
			return
		}
		let payAgain = that.data.payAgain;//避免重复支付
		//避免重复提交
		if (payAgain) {
		  return;
		} else {
		  that.setData({
		    payAgain: true
		  })
		}
		let reqData = {
			code: wx.getStorageSync('loginCode'), //小程序用户openid所需code
			dealtotal: that.data.acrtiveMoney.savevalue || that.data.ortherMoney, //充值总金额
			givetotal: that.data.acrtiveMoney.givevalue || "", //赠送金额
			ruleid: that.data.acrtiveMoney.saveruleuid || "", //储值规则id
			memid: that.data.memid, //会员id
			scarduid: that.data.scarduid, //储值卡id
			sessionid: app.globalData.sessionid,
			entvesion: app.globalData.extConfig.entvesion,
			entcode: app.globalData.extConfig.entcode,
			storeuid: app.globalData.store.storeuid,
			extappid: app.globalData.extConfig.extappid
		}
		app.req({
			that: that,
			url: '/newwxa/stored/memCardRecharge',
			loading: true,
			data: JSON.stringify(reqData),
			success: function(data) {
				if(data.code == 0){
					wx.requestPayment({ //调起微信支付
					  'timeStamp': data.timeStamp,
					  'nonceStr': data.nonceStr,
					  'package': data.package,
					  'signType': data.signType,
					  'paySign': data.paySign,
					  success: function (res) {
						that.paySuccessAlert();
					  },
					  fail: function (res) {
						that.payFailAlert({msg:"支付已取消"});
					  }
					})
				}else{
					that.setData({
					  payAgain: false
					})
					that.tips(data.msg)
				}
				
			},
			complete:function(res){
				that.setData({
				  payAgain: false
				})
				that.tips(res.msg)
			},
			successFail: function(res){
				that.setData({
				  payAgain: false
				})
				that.tips(res.msg)
			}
		})
	},
	
	// 支付失败提示
	payFailAlert: function (res) {
	  //避免多次支付
	  that.setData({
	    payAgain: false
	  })
	  that.tips(res.msg)
	},
	//支付成功
	paySuccessAlert:function(){
		//避免多次支付
		that.setData({
		  payAgain: false
		})
		
		that.tips("储值成功",function(){
			that.onLoad()
		})
	},
	
	//组件tips
		tips: function(msg,callback){
			app.open.tips(that, {
				msg: msg,
	    yesCallback: callback
			})
		},

	//获取会员信息
	dataInit: function() {
		let data = {
			sessionid: app.globalData.sessionid,
			entvesion: app.globalData.extConfig.entvesion,
			entcode: app.globalData.extConfig.entcode,
			extappid: app.globalData.extConfig.extappid,
			storeuid: app.globalData.store.storeuid
		};

		app.req({
			that: that,
			url: '/newwxa/user/getMemInfo',
			loading: true,
			data: data,
			success: function(data) {
				let items = data.items;
				if (items.memitems) {
					let cardInfoItem = {}
					for(let i = 0;i < items.memitems[0].cardInfoList.length;i++){
						if(items.memitems[0].cardInfoList[i].scarduid == that.data.scarduid){
							cardInfoItem = items.memitems[0].cardInfoList[i]
						}
					}
					that.setData({
						memitems: items.memitems,
						balance: cardInfoItem.balance,
						wxcarduid:cardInfoItem.wxcarduid ? cardInfoItem.wxcarduid : "",
						memid:items.memitems[0].memid,
						scarduid:cardInfoItem.scarduid,
					})
					that.getSaveRules()
				}
			}
		})
	},

	//获取储值规则
	getSaveRules: function() {
		let data = {
			en: app.globalData.extConfig.entcode,
			storeuid: app.globalData.store.storeuid
		};

		app.req({
			that: that,
			url: '/newwxa/stored/getSaveRules',
			loading: true,
			data: data,
			success: function(data) {
				let items = data.items;
				let newItems = []
				if (items) {
					for(let i = 0;i < items.length;i++){
						items[i].recharge = false
						if(items[i].savevalue > 0){
							newItems.push(items[i])
						}
					}
					if(newItems.length>0){
						newItems[0].recharge = true
					}
					
					that.setData({
						moneyQuantity: newItems,
						acrtiveMoney: items[0]
					})
				}else{
					that.timeTips(data.msg)
				}
			}
		})
	},
	timeTips: function (msg) {
	  app.open.timeTips(that, msg)
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		that = this;
		console.log(options)
		that.setData({
			scarduid:options.scarduid
		})
		that.dataInit();
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {

	}
})

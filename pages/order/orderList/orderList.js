
var common = require('../../../utils/common.js');
const app = getApp();
var that = null;

Page({

	/**
	* 页面的初始数据
	*/
	data: {
		theme: app.globalData.extConfig.theme,//主题色
		orderList: [],
		pageIndex: 1,
		pageSize: 20,
		billStatesConst: app.globalData.billStatesConst,//单据状态
		payStatesConst: app.globalData.payStatesConst,//支付状态
		refeudstateConst: app.globalData.refeudstateConst,//退款状态
		deliverystateConst: app.globalData.deliverystateConst,//配送状态
	},

	/**
	* 生命周期函数--监听页面加载
	*/
	onLoad: function (options) {
		that = this;
	},
	onShow: function(){

		that.dataInit();
		that.getOrderList();
		//底部导航
    if (typeof this.getTabBar === 'function' &&
    this.getTabBar()) {
      console.log(this.getTabBar())
      this.getTabBar().setData({
        selected: 1
      })
    }
	},
	
	tips: function(msg){
		app.open.tips(that, {
			msg: msg
		})
	},
	timeTips: function (msg) {
		app.open.timeTips(that, msg)
	},
	refueReason:function(msg,callback){
		app.open.refueResonTips(that, {
			msg:msg || '请输入申请退款原因',
			yesBtnText:'确定',
			yesCallback:callback
		})
	},
	//获取拒绝理由
	getReasonValue:function(e){
		that.setData({
			reason:e.detail.value
		})
	},
	// 
	dataInit: function(){
		let state = app.globalData.state ? app.globalData.state:'';
		let eatway = app.globalData.eatway?Number(app.globalData.eatway):'';//就餐方式
    that.setData({
			state: state,
			eatway:eatway
		})
	},
	getOrderList: function(){
		let billStatesConst = that.data.billStatesConst;//单据状态
		let refeudstateConst = that.data.refeudstateConst;//退款状态
		let deliverystateConst = that.data.deliverystateConst;//配送状态
		let state = that.data.state;//从我的过来控制
		let eatway = that.data.eatway;//从我的过来控制
		app.req({
			that: that,
			url: '/newwxa/bill/getBillList',
			loading: true,
			data:{
				sessionid: app.globalData.sessionid,
				entvesion: app.globalData.extConfig.entvesion,
				entcode: app.globalData.extConfig.entcode,
				extappid: app.globalData.extConfig.extappid,
        state: state,
				pageindex: that.data.pageIndex,
				pagesize: that.data.pageSize,
			},
			success: function(data){
				if( data.items.length>0 ){
					let items = data.items;
					let newItems = [];

					if(state == 1){

						if(eatway == 1){//外卖已接单
							newItems = items.filter(function(item,index){
								return item.eatway == 1;
							});
						}else{//自取、自带
							newItems = items.filter(function(item,index){
								return item.eatway != 1;
							});
						}
					}else{
						newItems = items;
					}
					newItems = items.map(function(item,index,array){
						if(item.refundstate != 0 && item.state != -1){//已申请退款且单据未取消
							item.statetext = refeudstateConst[item.refundstate];
						}else{
							// if(item.eatway == 1){
							// 	item.statetext = deliverystateConst[item.deliverystate]
							// }else{
							item.statetext = billStatesConst[item.state]
							// }
						}
						return item;
				});
					that.setData({
						orderList: newItems
					})
					app.globalData.eatway = '';//清除记录
					app.globalData.state = '';//清除记录
				}
				else{
					that.setData({
						noList: '您还没有订单哦，赶紧去下单吧！'
					})
				}
			}
		})

	},

	//申请退款提交
	orderDanceSubmit:function(storeuid,buid){
		let refundReason = that.data.reason;
		app.req({
			that: that,
			url: '/newwxa/bill/cancelOrderBill',
			loading: true,
			data:{
				sessionid: app.globalData.sessionid,
				entvesion: app.globalData.extConfig.entvesion,
				entcode: app.globalData.extConfig.entcode,
				extappid: app.globalData.extConfig.extappid,
        storeuid: storeuid,
				refundReason: refundReason,
				buid: buid,
			},
			success: function(data){
					let billStatesConst = that.data.billStatesConst;//单据状态
					let refeudstateConst = that.data.refeudstateConst;//退款状态
					let deliverystateConst = that.data.deliverystateConst;//配送状态
					let items = that.data.orderList;
					let newItems = items.map(function(item){
						if(item.buid == buid){
							item.refundstate = 1;
							if(item.refundstate != 0){//已申请退款
								item.statetext = refeudstateConst[item.refundstate];
							}else{
								// if(item.eatway == 1){
								// 	item.statetext = deliverystateConst[item.deliverystate]
								// }else{
									item.statetext = billStatesConst[item.state]
								// }
							}
						}
						return item;
					})

					that.setData({
						orderList:newItems
					})
					that.timeTips("已成功发出退款申请");
			}
		})

	},
	//申请退款触发
	orderDance:function(e){
		let storeuid = e.currentTarget.dataset.storeuid;
		let buid = e.currentTarget.dataset.buid;
		that.refueReason('请输入退款原因',function(){
			that.orderDanceSubmit(storeuid,buid);
		})
	},
	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function(event){
		console.log(' 下滑加载更多 ');
	},

	gotoDetail: function(event){

		var data = event.currentTarget.dataset;
		app.globalData.buid = data.buid;

		wx.navigateTo({
			url: '../orderDetail/orderDetail'
		})
	}


})
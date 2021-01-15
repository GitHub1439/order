
var common = require('../../../utils/common.js');
const app = getApp();
var that = null;

Page({
	/**
	* 页面的初始数据
	*/
	data: {
		billData: null,
		theme:app.globalData.extConfig.theme,//主题色
		billStates: app.globalData.billStatesConst,//单据状态
		refeudstateConst: app.globalData.refeudstateConst,//退款状态
		billStatesConst: [{
			stateText:'已下单',
			iconPath:'icongedongzuo-5',
			className:'',
			state:0,
		},
		{
			stateText:'制作中',
			iconPath:'icongedongzuo-1',
			className:'border-left',
			state:1,
		},
		{
			stateText:'配送中',
			iconPath:'icongedongzuo-',
			className:'border-left',
			state:4,
		},
		{
			stateText:'已完成',
			iconPath:'icongedongzuo-4',
			className:'border-left',
			state:2,
		},
		]//单据显示状态
	},

	/**
	* 生命周期函数--监听页面加载
	*/
	onLoad: function (options) {
		that = this;
		let buid = options.buid? options.buid: app.globalData.buid;
		this.setData({
			buid: buid
		})
	},
	onShow: function(){
		
		that.getOrderList();
	},
	tips: function(msg){
		app.open.tips(that, {
			msg: msg
		})
	},

	getOrderList: function(){
		let buid = that.data.buid;

		app.req({
			that: that,
			url: '/newwxa/bill/getBillList',
			loading: true,
			data:{
				sessionid: app.globalData.sessionid,
				entvesion: app.globalData.extConfig.entvesion,
				entcode: app.globalData.extConfig.entcode,
				extappid: app.globalData.extConfig.extappid,
				buid: buid,
				pageindex: 1,
				pagesize: 99999,
			},
			success: function(data){
				if( data.items.length>0 ){

					let billData = null;
			
					let billStates = that.data.billStates;//单据状态
					let refeudstateConst = that.data.refeudstateConst;//退款状态
					for( var i=0;i<data.items.length;i++ ){

						if( data.items[i].buid == buid ){
							billData = data.items[i];
						}
					}
					if( billData ){
						let orderWay = billData.eatway == 1?"外卖":"到店";
						let orderStateText = '';
						let discount = billData.dealtotal - billData.paymoney;
            if (discount != 0){
              discount = parseFloat(discount).toFixed(2);
						}
						if(billData.refundstate != 0 && billData.state != -1){//已申请退款且单据未取消
							orderStateText = refeudstateConst[billData.refundstate];//退款状态
						}else{
							orderStateText = billStates[billData.state];//订单状态
						}

						if(billData.eatway != 1){
							let billStatesConst = that.data.billStatesConst;
							let newbillStatesConst = billStatesConst.filter(function(val,index){
								return val.state != 4;
							})
							newbillStatesConst[1].className="meal-border-left"; 
							newbillStatesConst[2].className="meal-border-left"; 
							that.setData({
								billStatesConst: newbillStatesConst
							});
						}

						that.setData({
							billData: billData,
							discount: discount,
							orderWay: orderWay,
							orderStateText: orderStateText,
							smdcdiscounts: (billData.smdcdiscounts&&billData.smdcdiscounts.length>0) ? billData.smdcdiscounts : false
						})
					}
				}
			}
		})

	},
	//拨打电话
	callPhone: function(e){
		let phone = e.currentTarget.dataset.phone;
		wx.makePhoneCall({
			phoneNumber: phone //仅为示例，并非真实的电话号码
		})
	},

	/**
	* 生命周期函数--监听页面初次渲染完成
	*/
	onReady: function () {

	}
})
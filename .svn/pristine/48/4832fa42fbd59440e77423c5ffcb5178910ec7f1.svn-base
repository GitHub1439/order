// pages/balance/balance.js
var common = require('../../utils/common.js');
//获取应用实例
const app = getApp();
var that = null;
var page=0;//分页标识，第几次下拉，用户传给后台获取新的下拉数据
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		balance: 0,
		// historyIntegral:888,
		balanceItem: [], //储值流水
		memid: "", //会员id
		scarduid: "", //储值卡id
		pageindex: 0,
		pagesize: 10,
		scrollTop: 0,
		scrollHeight: 0,
		stopLoad:false,//停止下拉加载
		totalNum: 0
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		that = this;
		console.log(options)
		that.setData({
			scarduid: options.scarduid,
		})
		that.dataInit();

		wx.getSystemInfo({
			success: function(res) {
				that.setData({
					scrollHeight: res.windowHeight
				});
			}
		});
	},
	// 页面滑动到底部
	// bindDownLoad: function() {
	// 	var that = this;
	// 	if(that.data.stopLoad){
	// 		that.timeTips("已经到底了")
	// 		return
	// 	}
	// 	that.getSCCardRecord();
	// },
	scroll: function(event) {
		//该方法绑定了页面滚动时的事件，我这里记录了当前的position.y的值,为了请求数据之后把页面定位到这里来。
		// this.setData({
		// 	scrollTop: event.detail.scrollTop
		// });
	},
	timeTips: function (msg) {
	  app.open.timeTips(that, msg)
	},
	tips: function (msg) {
	  app.open.tips(that, {
	    msg: msg
	  })
	},
	topLoad: function(event) {
		//   该方法绑定了页面滑动到顶部的事件，然后做上拉刷新
		// page = 0;
		// this.setData({
		//     list : [],
		//     scrollTop : 0
		// });
		// getSCCardRecord();
		// console.log("lower");
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
						balance: cardInfoItem.balance,
						memid: items.memitems[0].memid,
						// scarduid: items.memitems[0].scarduid,
					})
					// that.getSCCardRecord()
					that.getArticles(0);//第一次加载数据
				}
			}
		})
	},
	// 下拉刷新
	onPullDownRefresh: function () {
	  this.clearCache();
	  this.getArticles(0);//第一次加载数据
	},
	
	// 页面上拉触底事件（上拉加载更多）
	onReachBottom: function () {
	   this.getArticles(page);//后台获取新数据并追加渲染
	},
	
	// 清缓存
	clearCache:function(){
	   page = 0;//分页标识归零
	   this.setData({
	      articles: [] //文章列表数组清空
	   }); 
	},
	getArticles: function (pg){
		if(that.data.stopLoad){
			that.timeTips("已经到底了")
			return
		}
		pg = pg ? pg : 0;
		let query = {
			en: app.globalData.extConfig.entcode,
			memid: that.data.memid,
			scarduid: that.data.scarduid,
			pageindex: pg,
			pagesize: that.data.pagesize
		}
		app.req({
			that: that,
			url: '/newwxa/stored/getSCCardRecord',
			loading: true,
			data: query,
			success: function(data) {
		
				if (data.items && data.items.recordList) {
					let items = that.data.balanceItem.concat(data.items.recordList);
					var tmpArr = that.data.balanceItem;
					tmpArr.push.apply(tmpArr,data.items.recordList);
					that.setData({
						 balanceItem: tmpArr,
						 totalNum:data.items.totalNum
					})
					
					if(((pg+1) * that.data.pagesize) > data.items.totalNum){
						that.setData({
							stopLoad: true
						})
					}
					page++;
				}else{
					// that.timeTips(data.msg)
					that.tips(data.msg); 
				}
			}
	})
	},
	//获取储值卡流水
	getSCCardRecord: function() {
		let query = {
			en: app.globalData.extConfig.entcode,
			memid: that.data.memid,
			scarduid: that.data.scarduid,
			pageindex: that.data.pageindex,
			pagesize: that.data.pagesize
		}
		app.req({
			that: that,
			url: '/newwxa/stored/getSCCardRecord',
			loading: true,
			data: query,
			success: function(data) {

				if (data.items && data.items.recordList) {
					let items = that.data.balanceItem.concat(data.items.recordList);
					that.setData({
						balanceItem: items,
						pageindex: that.data.pageindex + 1,
						totalNum:data.items.totalNum
					})
					if((that.data.pageindex * that.data.pagesize) > data.items.totalNum){
						
						that.setData({
							stopLoad: true
						})
					}
				}else{
					// that.timeTips(data.msg)
					that.tips(data.msg); 
				}
			}
		})
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
	// onPullDownRefresh: function() {

	// },

	

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {

	}
})

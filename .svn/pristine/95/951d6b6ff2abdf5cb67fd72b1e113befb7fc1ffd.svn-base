// pages/integral/integral.js
var common = require('../../utils/common.js');
const app = getApp();
var that = null;
var page=0;//分页标识，第几次下拉，用户传给后台获取新的下拉数据
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		integral: 0,
		historyIntegral: 0,
		pageindex: 0,
		pagesize: 9999,
		memid: "", //会员id
		scrollTop: 0,
		scrollHeight: 0,
		stopLoad:false,
		integralItem: []
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		that = this;
		that.dataInit();

		wx.getSystemInfo({
			success: function(res) {
				that.setData({
					scrollHeight: res.windowHeight
				});
			}
		});
	},

	//页面滑动到底部
	bindDownLoad: function() {
		var that = this;
		if(that.data.stopLoad){
			app.open.tips(that, {
			  msg: "已经到底了"
			})
			return
		}
		that.getMemPointRecord();
		console.log("lower");
	},
	scroll: function(event) {
		//该方法绑定了页面滚动时的事件，我这里记录了当前的position.y的值,为了请求数据之后把页面定位到这里来。
		// this.setData({
		// 	scrollTop: event.detail.scrollTop
		// });
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
	timeTips: function (msg) {
	  app.open.timeTips(that, msg)
	},
	tips: function (msg) {
	  app.open.tips(that, {
	    msg: msg
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
			pageindex: pg,
			pagesize: that.data.pagesize
		}
		app.req({
			that: that,
			url: '/newwxa/stored/getMemPointRecord',
			loading: true,
			data: query,
			success: function(data) {
		
				if (data.items && data.items.recordList) {
					// let items = that.data.integralItem.concat(data.items.recordList);
					// that.setData({
					// 	integralItem: items, //积分数组list
					// 	historyIntegral: data.items.historypoints, //历史积分
					// 	pageindex: that.data.pageindex + 1, //分页index
					// 	integral: data.items.curpoints, //总积分
					// })
					// let items = that.data.balanceItem.concat(data.items.recordList);
					var tmpArr = that.data.integralItem;
					tmpArr.push.apply(tmpArr,data.items.recordList);
					that.setData({
						 integralItem: tmpArr,
						 integral: data.items.curpoints, //总积分
						 historyIntegral: data.items.historypoints, //历史积分
					})
					if(((pg+1) * that.data.pagesize) > data.items.totalNum){ // 根据总条数与页码和页数计算还没有没有数据 是否禁止下拉加载
						
						that.setData({
							stopLoad: true
						})
					}
					page++;
				}else{
					// that.timeTips(data.msg)
				}
			}
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
					that.setData({
						integral: items.memitems[0].integral,
						memid: items.memitems[0].memid,
					})
					// that.getMemPointRecord()
					that.getArticles(0);//第一次加载数据
				}
			}
		})
	},
	//获取积分变动明细 
	getMemPointRecord: function() {
		let query = {
			en: app.globalData.extConfig.entcode,
			memid: that.data.memid,
			pageindex: that.data.pageindex,
			pagesize: that.data.pagesize
		}
		app.req({
			that: that,
			url: '/newwxa/stored/getMemPointRecord',
			loading: true,
			data: query,
			success: function(data) {
				console.log(data.items.historypoints)
				if (data.items && data.items.recordList) {
					let items = that.data.integralItem.concat(data.items.recordList);
					
					that.setData({
						integralItem: items, //积分数组list
						historyIntegral: data.items.historypoints, //历史积分
						pageindex: that.data.pageindex + 1, //分页index
						integral: data.items.curpoints, //总积分
					})
					if((that.data.pageindex * that.data.pagesize) > data.items.totalNum){ // 根据总条数与页码和页数计算还没有没有数据 是否禁止下拉加载
						
						that.setData({
							stopLoad: true
						})
					}
				}else{
					// that.timeTips(data.msg)
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
	 * 页面上拉触底事件的处理函数
	 */
	// onReachBottom: function() {

	// },

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {

	}
})


var common = require('../../../utils/common.js');
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js'); // 引入SDK核心类

const app = getApp();
var that = null;

var qqmapsdkKey = app.config.qqmapsdkKey;
var qqmapsdk;

// 
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		scale: 18,
		theme:app.globalData.extConfig.theme,//主题色
		city: app.globalData.city,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		that = this;

		// 实例化API核心类
		qqmapsdk = new QQMapWX({
			key: qqmapsdkKey // 必填
		});

		if( app.globalData.location ){
			that.setData({
				hasLocation: true,
				longitude: app.globalData.location.longitude,
				latitude: app.globalData.location.latitude,
			})

			that.getStoreList();
			// 逆地址解析
			that.reverseGeocoder();
		}
		else{
			that.getLocation();
		}
	},
	tips: function(msg){
		app.open.tips(that, {
			msg: msg
		})
	},

	// 获取位置
	getLocation: function() {

		wx.getLocation({
			type: 'wgs84',
			success: function(res) {

				var accuracy = res.accuracy;
				var longitude = res.longitude;
				var latitude = res.latitude;

				that.setData({
					hasLocation: true,
					longitude: longitude,
					latitude: latitude,
				})

				that.getStoreList();
				// 逆地址解析
				that.reverseGeocoder();
			},
			fail: function(res) {

				app.open.tips(that, {
					msg: '您没有授权获取地理位置服务，必须授权才能操作哦！',
					yesCallback: function(){
						wx.openSetting({
							scope: 'scope.userLocation',
							success: function() {
								that.getLocation();
							}
						})
					}
				})
			}
		})

	},

	// 逆地址解析
	reverseGeocoder: function(longitude, latitude) {

		qqmapsdk.reverseGeocoder({
			location: {
				latitude: that.data.latitude,
				longitude: that.data.longitude
			},
			success: function(res) {
				// console.log(' res result = ' + JSON.stringify(res.result) )
				
				var city = res.result.address_component.city;
				that.setData({
					city: city
				}),
				app.globalData.city = city;
			},
			fail: function(res) {
				that.tips( res.message);
			}
		})
	},

	// 获取门店信息列表
	getStoreList: function() {
    
		app.req({
			url: '/wxa/store/getStoreList',
			loading: true,
			data: {
				sessionid: app.globalData.sessionid,
				entvesion: app.globalData.extConfig.entvesion,
				entcode: app.globalData.extConfig.entcode,
				extappid: app.globalData.extConfig.extappid,
				longitude: that.data.longitude,
				latitude: that.data.latitude,
			},
			success: function(data) {
				if (data.items) {
					if (data.items.length > 0) {

						var markers = [];
						for (var i = 0; i < data.items.length; i++) {
							var item = data.items[i];

							var marker = {};
              marker.id = item.storeuid;
              marker.latitude = item.latitude;
              marker.longitude = item.longitude;
              marker.width = 32; // 71
              marker.height = 50; // 112
              marker.name = item.storename;
              marker.address = item.vcaddr;
              marker.vctel = item.vctel;
              marker.stbusiness = item.stbusiness;
              marker.endbusiness = item.endbusiness;
              marker.distance = parseFloat(item.distance).toFixed(2);
              marker.iconPath = '../../../image/icons/icon_map_markers.png';

							markers.push(marker);
						}
						// console.log(' markers = ' + JSON.stringify(markers) )
						that.setData({
							storeList: data.items,
							markers: markers,
						})
						if( app.globalData.store ){
							that.setData({
								store: app.globalData.store
							})
						}
					} 
					else{
						that.setData({
							storeList: [],
							markers: [],
						})
					}
				} 
				else{
					that.setData({
						storeList: [],
						markers: [],
					})
					that.tips(data.msg);
				}
			}
		})
	},

	// 选择位置 
	chooseLocation: function() {

		// 选择位置
		wx.chooseLocation({
			success: function(res) {
				// console.log('chooseLocation success res = ' + JSON.stringify(res));

				var latitude = res.latitude;
				var longitude = res.longitude;
				var name = res.name;
				var address = res.address;

				that.setData({
					hasLocation: true,
					latitude: res.latitude,
					longitude: res.longitude,
					markers:[]
				})

				that.getStoreList();
			  that.reverseGeocoder();
			}
		})
	},


	clickStore: function(event){
		var data = event.currentTarget.dataset;
		
		var storeList = that.data.storeList;
		var store = null;
		for( var i=0;i<storeList.length; i++ ){
			if( storeList[i].storeuid==data.id ){
				store = storeList[i];
			}
		}
		app.globalData.store = store;
		if( store ){
			that.setData({
				store: store
			})
			if( store.storeuid != app.globalData.store.storeuid ){
				app.globalData.tablecode = '';
			}
			app.globalData.store = store;

			app.globalData.total = {
				count: 0,
				money: 0
			}

			wx.switchTab({
				url: '../../index'
			})
		

		}

	},
 
	// 选择城市
	chooseAddress: function() {

		wx.getSetting({
			success: function(res) {
				// console.log( 'getSetting res = ' + JSON.stringify(res) );
				if (!res.authSetting['scope.address']) {
					wx.authorize({
						scope: 'scope.address',
						success: function(res) {

							wx.chooseAddress({
								success: function(res) {
									console.log(' search res = ' + JSON.stringify(res));
								},
							})
						},
						fail: function(res) {
							that.tips(res.errMsg);
						}
					})
				}
			}
		})

	},


})
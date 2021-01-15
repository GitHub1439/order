
var common = require('../../../utils/common.js');
var util = require('../../../utils/util.js');
var wxbarcode = require('../../../utils/indexCode.js');

//获取应用实例
const app = getApp();
var that = null;

Page({
	data: {
    theme: app.globalData.extConfig.theme,//主题色
		userInfo: null,
    integral: 0,//积分
    grantnum: 0,//优惠券
    balance: 0,//余额
    ticket:false,//优惠券是否显示
    markShow:false,//优惠券遮罩层是否显示
    send_coupon_params:[],//发券参数
    sign:"",//签名 示例值：9A0A8659F005D6984697E2CA0A9CF3B79A0A8659F005D6984697E2CA0A9CF3B7
    send_coupon_merchant:"",//示例值：10016226
    entcode:app.globalData.extConfig.entcode,
    kqInfos:[],
    gruid:"",
	wxcarduid:"",//储值卡是否有
	bannerCurrent:0,
	cardInfoList:[], //储值卡数组
	imgurl: app.config.host + app.config.url,
	store:app.globalData.store
	},
	onLoad: function () {
		that = this;
		that.setData({
		  store: app.globalData.store
		})
    that.getBanner();
    // this.getcouponList()
	},
	onShow: function(){
    that.dataInit();
    //底部导航
    if (typeof this.getTabBar === 'function' &&
    this.getTabBar()) {
      console.log(this.getTabBar())
      this.getTabBar().setData({
        selected: 2
      })
    }
	},

	tips: function (msg) {
    app.open.tips(that, {
      msg: msg
    })
  },
  timeTips: function (msg) {
    app.open.timeTips(that, msg)
  },
  //获取banner
  getBanner:function(){
    var reqData = {
      // sessionid: app.globalData.sessionid,
      entvesion: app.globalData.extConfig.entvesion,
      entcode: app.globalData.extConfig.entcode,
      extappid: app.globalData.extConfig.extappid
    }
    app.req({
      that: that,
      url: '/wxa/store/getShouYeImage',
      loading: true,
      data: reqData,
      success: function (data) {
        if (data.code == 0) {
          var indexbanner = app.globalData.extConf.indexbanner;//默认图片
          var images = [];
          if(data.items){
            for(var i=1;i<5;i++){
              if((data.items)["topimg"+i]){
                images.push((data.items)["topimg" + i]);
              }
            }
          }
     
          var images = images.length > 0 ? images : [indexbanner];
         
          that.setData({
            images: images
          })
        }
      }
    })
  },
  //获取会员信息
	dataInit: function(){
    let selectAddress = wx.getStorageSync('selectAddress') ? JSON.parse(wx.getStorageSync('selectAddress')) : null;//选中地址
    let data = {
      sessionid: app.globalData.sessionid,
      entvesion: app.globalData.extConfig.entvesion,
      entcode: app.globalData.extConfig.entcode,
      extappid: app.globalData.extConfig.extappid,
      storeuid: app.globalData.store.storeuid,
	  wxaopenid:wx.getStorageSync("wx_openid"),
    }; 
    that.setData({
      selectAddress: selectAddress
    })

    app.req({
      that: that,
      url: '/newwxa/user/getMemInfo',
      loading: true,
      data: data,
      success: function (data){
          let items = data.items;
          if (items.grantitems){
            that.setData({
              grantnum: items.grantnum
            })
          }
          if (items.memitems) {
            that.setData({
              memid: items.memitems[0].memid,
              // balance: (items.memitems[0]).balance,
              integral: (items.memitems[0]).integral,
			  // wxcarduid: items.memitems[0].wxcarduid,
			  cardInfoList: items.memitems[0].cardInfoList
            })
			for(let i = 0;i < items.memitems[0].cardInfoList.length;i++){
				wxbarcode.barcode('barcode'+i, (items.memitems)[0].memid, 650, 158);
			}
            // wxbarcode.barcode('barcode', (items.memitems)[0].memid, 650, 158);//条形码
          }
        app.globalData.grantitems = items.grantitems ? items.grantitems:[];//优惠券

        //wxbarcode.qrcode('qrcode', 'http://blog.geekxz.com', 420, 420);//二维码
      }
    })
	},

  //地址
  toAdress:function(){
    wx.navigateTo({
      url: '../../address/addressList/addressList',
    })
  },
  //优惠券
  toCoupon:function(){
    wx.navigateTo({
      url: '../../coupon/coupon?come=mine',
    })
  },
  //积分
  toIntegral:function(){
      wx.navigateTo({
        url: '../../integral/integral?come=mine',
      })
  },
  //余额
  toBalance:function(e){
	  let dataset = e.currentTarget.dataset
      wx.navigateTo({
        url: '../../balance/balance?come=mine&scarduid='+dataset.scarduid,
      })
   },
  //我的订单
  toOrder:function(e){
    let state = e.currentTarget.dataset.state;
    let eatway = e.currentTarget.dataset.eatway;

    app.globalData.eatway = eatway?eatway:0;
    app.globalData.state = state;
    wx.switchTab({
      url: '../../order/orderList/orderList',
    })
  },
  //立即充值
  toRecharge:function(e){
	  let dataset = e.target.dataset
    wx.navigateTo({
      url: '../../recharge/recharge?scarduid='+dataset.scarduid,
    })
  },
  //储值卡切换
  bannerSwiper:function(e){
	  const that = this, bannerCurrent = e.detail.current;
	  that.setData({
	   bannerCurrent:bannerCurrent
	  })
  }

})


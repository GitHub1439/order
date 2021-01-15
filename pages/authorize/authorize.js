const app = getApp();
let that = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: app.globalData.extConfig.theme,//主题色
    author:'phone'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
   
    
 
    that.setData({
      eatType: options.eatType//就餐方式
    })

    // 查看是用户否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          that.setData({
            author: "phone"
          })
          that.changeData();
        }
      }
    })
    that.changeData();

    app.ruiposLogin();//登录
  },
  //获取配置信息,登录后获取避免全局sesssion失效
  getEntData: function(){
      return {
      sessionid: app.globalData.sessionid,
      entvesion: app.globalData.extConfig.entvesion,
      entcode: app.globalData.extConfig.entcode,
      extappid: app.globalData.extConfig.extappid,
      storeuid: app.globalData.store.storeuid
    }
  },
  //组件tips
	tips: function(msg,callback){
		app.open.tips(that, {
			msg: msg,
      yesCallback: callback
		})
	},
  //跟换内容
  changeData:function(){
    let author = that.data.author;
    let tips, message;
    if (author == "user"){
      tips = "微信授权登录";
      message = "点击登录将获取您的公开信息（含昵称、头像）";
    }else{
      tips = "手机号码绑定";
      message = "点击确认将获取微信绑定手机号码";
    }
    that.setData({
      tips: tips,
      message: message
    });
  },
  //拒绝授权
  refuseAuthorize:function(){
    wx.showModal({
      title: '警告',
      content: '您点击了拒绝授权，将无法开始点餐，请授权之后再进入!!!',
      showCancel: false,
      confirmText: '返回授权',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击了“返回授权”')
        }
      }
    })
  },
  //获取电话号码
  getPhoneNumber: function (e) {
    let encryptedData = e.detail.encryptedData;
    let iv = e.detail.iv;
    // wx.checkSession({
    //   success: function (res) {
        if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
          that.refuseAuthorize();
        }else{
          let data = {};
          let entData = that.getEntData();
          data.type = "getPhoneNumber";
          data.encryptedData = encryptedData;
          data.iv = iv;
          data = Object.assign(data, entData);
          that.updateInfo(data);
        }
      // }
    // })
      
   
  },
  //获取用户信息
  bindGetUserInfo: function (e) {
    if (e.detail.userInfo) {
      wx.getUserInfo({
        lang:'zh_CN',
        success: function (res) {
          //用户按了允许授权按钮后需要处理的逻辑方法体
          let entData = that.getEntData();
          let data = res.userInfo;
          data.type = "getUserInfo"; 
          data.encryptedData = res.encryptedData;
          data.iv =res.iv;
          data = Object.assign(data,entData);
          that.updateInfo(data);
        }
      });

    } else {
      //用户按了拒绝按钮
      that.refuseAuthorize();
    }
  },
  //上传用户信息
  updateInfo: function (info) {
    app.req({
      that: that,
      url: '/newwxa/user/getWxaUserInfo',
      loading: true,
      data: info,
      success: function (res) {
        if (res.code == 0) {
          if (info.type == "getUserInfo"){
            that.setData({
              author:"phone"
            })
            that.changeData();
            // wx.setStorageSync('phoneAuthor',true);//手机授权
            // wx.redirectTo({ 
            //   url: '../home/placeOrder/placeOrder?eatType=' + that.data.eatType
            // })
          }else{
            wx.setStorageSync('phoneAuthor',true);//手机授权
            wx.redirectTo({ 
              url: '../home/placeOrder/placeOrder?eatType=' + that.data.eatType
            })
          }
        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
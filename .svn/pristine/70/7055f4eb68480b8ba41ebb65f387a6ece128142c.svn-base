// pages/address/addressList/addressList.js
let app = getApp();
let that = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    theme:app.globalData.extConfig.theme,//主题色
    isSelect:false,//默认地址可选
    items: [],
    startX: 0, //开始坐标
    startY: 0
    },
  onLoad: function (options) {
    that = this;
    that.setData({
      type: options.type
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //地址
    that.getAddress();
  },
  //设置默认地址
  setDefalut: function(e){
    let data = e.currentTarget.dataset.item;
    let type = that.data.type;//来源于结算还是我的
    
    if(type == "payorder" && data.issenddistance == 0 && data.isdefault == 1){
      wx.setStorageSync('selectAddress', JSON.stringify(data));//默认地址
      wx.navigateBack();
      return;
    }
    data.isdefault = 1;
    data.sessionid = app.globalData.sessionid;
    data.entvesion = app.globalData.extConfig.entvesion;
    data.entcode = app.globalData.extConfig.entcode;
    data.extappid = app.globalData.extConfig.extappid;
    app.req({
      that: that,
      url: '/newwxa/user/updateReceivingAddress',
      loading: true,
      data: data,
      success: function (res) {
        let isSelect = data.issenddistance==0? true:false;
        that.setData({
          isSelect: isSelect
        });
        that.getAddress();
      }
    })
  },
  //地址列表
  getAddress: function() {
    var reqData = {
      sessionid: app.globalData.sessionid,
      storeuid: app.globalData.store.storeuid,
      entvesion: app.globalData.extConfig.entvesion,
      entcode: app.globalData.extConfig.entcode,
      extappid: app.globalData.extConfig.extappid
    }
    app.req({
      that: that,
      url: '/newwxa/user/getReceivingAddress',
      loading: true,
      data: reqData,
      success: function (data) {
        if (data.code == 0) {
          let items = data.items.length>0?data.items:[];
          if(items.length> 0){
             //获取可配送地址
             let isSelect = that.data.isSelect;
             let type = that.data.type;//来源于结算还是我的
             let choosedIndex = items.findIndex(function (val) {
               return val.issenddistance == 0;
             });//第一个可选下标
             let fristIndex = items.findIndex(function (val) {
               return val.issenddistance == 1;
             });//第一个不可选下标
             if (choosedIndex != -1) {
               let selectAddress = items[choosedIndex];
               wx.setStorageSync('selectAddress', JSON.stringify(selectAddress));//默认地址
             } else {
               wx.removeStorageSync('selectAddress');//清除选中地址
             }
             items = items.map(function (item) {
               item.isTouchMove = false;
               return item;
             });
             

             that.setData({
              fristIndex: fristIndex
            })

             if(isSelect && type == "payorder"){//编辑后返回
              wx.navigateBack();
            }
          }
          that.setData({
            items: items
          })
        }
      }
    })  
  },

  //编辑地址
  editAdress: function (e) {
    var parameter = e.currentTarget.dataset.address;//参数
    wx.navigateTo({
      url: '../editAddress/editAddress?parameter=' + JSON.stringify(parameter)
    })

  },
  //新增收货地址
  addAddress: function(e) {
    wx.navigateTo({
      url: '../editAddress/editAddress'
    })
  },
  //手指触摸动作开始 记录起点X坐标  
  touchstart: function (e) {
    //开始触摸时 重置所有删除
    that.data.items.forEach(function (v, i) {
      if (v.isTouchMove)//只操作为true的
        v.isTouchMove = false;
      })

      that.setData({
        startX: e.changedTouches[0].clientX,
        startY: e.changedTouches[0].clientY,
        items: this.data.items
      })
    },

    //滑动事件处理
  touchmove: function (e) {
    let index = e.currentTarget.dataset.index,//当前索引
    startX = that.data.startX,//开始X坐标
    startY = that.data.startY,//开始Y坐标
    touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
    touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
    
    //获取滑动角度
    angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
    that.data.items.forEach(function (v, i) {
      v.isTouchMove = false
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
        if (i == index) {
          if (touchMoveX > startX) //右滑
          v.isTouchMove = false
          else //左滑
          v.isTouchMove = true
          }
    })
    //更新数据
    that.setData({
      items: that.data.items
    })
    
  },
    
  /**
    * 计算滑动角度
    * param {Object} start 起点坐标
    * param {Object} end 终点坐标
  */ 
  angle: function (start, end) {
    let _X = end.X - start.X,
    _Y = end.Y - start.Y

    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
    
  //删除事件  
  del: function (e) {
    that.data.items.splice(e.currentTarget.dataset.index, 1)

    let data ={};
    data.adrsuid =  e.currentTarget.dataset.adrsuid;
    data.sessionid = app.globalData.sessionid;
    data.entvesion = app.globalData.extConfig.entvesion;
    data.entcode = app.globalData.extConfig.entcode;
    data.extappid = app.globalData.extConfig.extappid;
    app.req({
      that: that,
      url: '/newwxa/user/deleReceivingAddress',
      loading: true,
      data: data,
      success: function (res) {
        let items = that.data.items?that.data.items:[];
        if(items.length==0 ){
          wx.removeStorageSync('selectAddress');//清除选中地址
        }else{
          //获取选中地址
          let fristIndex = items.findIndex(function (val) {
            return val.issenddistance == 1;
          });
          let choosedIndex = items.findIndex(function (val) {
            return val.issenddistance == 0;
          });

          if(choosedIndex != -1){
            let selectAddress = items[choosedIndex];
            wx.setStorageSync('selectAddress', JSON.stringify(selectAddress));//默认地址
          }else{
            wx.removeStorageSync('selectAddress');//清除选中地址
          }
          that.setData({
            fristIndex: fristIndex
          })
        }
        that.setData({
          items: items
        })
        that.timeTips("删除成功");  
      }
    })
  },
  tips: function (msg) {
    app.open.tips(that, {
      msg: msg
    })
  },
  timeTips: function (msg) {
    app.open.timeTips(that, msg)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
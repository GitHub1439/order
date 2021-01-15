// pages/coupon/coupon.js
//获取应用实例
const app = getApp();
let that = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    grantitems:[],//优惠券列表
    useNumber:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    let useNumber = that.data.useNumber;
    let comeWhere = options.come;
    let grantitems = app.globalData.grantitems;
    if (comeWhere == "payOrder"){//来自结算
      grantitems = grantitems.map(function (item, index) {
        let isuse = item.allmoney > 0?true:false;
        if(isuse){
          useNumber +=1;
        }
        item.isuse = isuse;
        return item;
      })
      that.setData({useNumber:useNumber});
    }else{//来自我的
      grantitems = grantitems.map(function(item,index){
        item.isuse = true; 
        return item;
      })
    }
    that.setData({
      comeWhere: comeWhere,
      grantitems: grantitems
    });
  },
  //返回结算页面
  returnPayOrder:function(e){
    let comeWhere = that.data.comeWhere;
    let index = e.currentTarget.dataset.index;
    let isuse = e.currentTarget.dataset.isuse;//可使用
    if (comeWhere == "payOrder" && isuse){
      app.globalData.selectGrantitemIndex = index;//选中优惠券的下标
      wx.navigateBack({})
    }
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
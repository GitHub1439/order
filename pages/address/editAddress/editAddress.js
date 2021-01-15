// pages/address/address.js

let common = require('../../../utils/common.js');
let util = require('../../../utils/util.js');
let QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js'); // 引入SDK核心类

const app = getApp();
let that = null;

let qqmapsdkKey = app.config.qqmapsdkKey;
let qqmapsdk;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme:app.globalData.extConfig.theme,//主题色
    pageType: "add",//页面是新增还是编辑
    sex:1,
    latitude:'',
    longitude: '',
    place: true//详细位置
  },
  //选择性别
  chooseSex: function() {
    var sex = that.data.sex;
    if(sex == 1) {
      sex = 0;
    }else {
      sex = 1;
    }
    that.setData({
      sex: sex
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    //编辑
    if (JSON.stringify(options) != "{}") {
      let parameter = JSON.parse(options.parameter);
      that.setData({
        adrsuid: parameter.adrsuid,
        sex: parameter.sex,
        longitude: parameter.longitude,
        latitude: parameter.latitude,
        isdefault: parameter.isdefault,
        address: parameter.address,
        consignee: parameter.consignee,
        mobileno: parameter.mobileno,
        pageType: 'edit',
        place: false//先隐藏详细位置
      });

      wx.setNavigationBarTitle({
        title: '地址编辑'
      })

    }else{
      // 实例化API核心类
      qqmapsdk = new QQMapWX({
        key: qqmapsdkKey // 必填
      });

      if (app.globalData.location) {
        that.setData({
          hasLocation: true,
          longitude: app.globalData.location.longitude,
          latitude: app.globalData.location.latitude,
        })
      }
    }
  },
  //设置默认地址
  setDefault:function(){
    let isdefault = that.data.isdefault == 1?0:1;
    that.setData({
      isdefault:isdefault
    });
  },
  //提交信息
  formSubmit: function (e) {
    var reqData = e.detail.value;//表单数据
    reqData.place = (typeof (reqData.place) != "undefined") ? reqData.place:"";
    reqData.address = reqData.address + reqData.place;//拼接具体位置
    reqData.sessionid = app.globalData.sessionid;
    reqData.entvesion = app.globalData.extConfig.entvesion;
    reqData.entcode = app.globalData.extConfig.entcode;
    reqData.extappid = app.globalData.extConfig.extappid;

    var valid_rule = /^(13[0-9]|14[5-9]|15[012356789]|166|17[0-8]|18[0-9]|19[8-9])[0-9]{8}$/;// 手机号码校验规则
    var pageType = that.data.pageType;
    var url;
    if (pageType == "add") {
      url = "addReceivingAddress";
    } else {
      url = "updateReceivingAddress";
    }
   
    //联系人
    if (!reqData.consignee) {
      that.tips("联系人不能为空");
      return;
    }
   //手机验证
    if (!valid_rule.test(reqData.mobileno)) {
      that.tips("手机号码有误");
      return;
    }
    //如果显示要填具体位置
    if (that.data.place){
      //具体位置未填
      if (!reqData.place){
       that.tips("请完善详细位置信息");
        return;
      }
    }
    app.req({
      that: that,
      url: '/newwxa/user/' + url,
      loading: true,
      data: reqData,
      success: function (data) {
        if (data.code == 0) {
          wx.navigateBack();
        }
      }
    });
  },
  // 选择位置 
  chooseLocation: function () {

    // 选择位置
    wx.chooseLocation({
      success: function (res) {
        if (res.errMsg == "chooseLocation:ok"){
          console.log(res);
          let latitude = res.latitude;
          let longitude = res.longitude;
          let name = res.name ? res.name : res.addres;
         
          if (longitude && latitude) {
            that.setData({
              hasLocation: true,
              latitude: latitude,
              longitude: longitude,
              address: name,
              markers: [],
              place: true//显示详细位置
            })
          }
        }
        
      }
    })
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },
  tips: function (msg) {
    app.open.tips(that, {
      msg: msg
    })
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
// pages/home/searchGood/searchGood.js
const app = getApp();
let that = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods:[],
    history:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.setData({
      storeuid:options.storeuid
    });

    //获取历史记录
    wx.getStorage({
      key: 'history',
      success (res) {
        let history = res.data?JSON.parse(res.data):[];
        let theStoreHistory = [];//本门店搜索记录
        for(let i=0;i<history.length;i++){
          if(history[i].storeuid == that.data.storeuid){
            theStoreHistory.push(history[i]);
          }
        }
        that.setData({
          history:theStoreHistory
        });
      }
    })

    that.dataInit();

  },
  //获取热卖商品
  dataInit: function () {
    let data = {
      sessionid: app.globalData.sessionid,
      entvesion: app.globalData.extConfig.entvesion,
      entcode: app.globalData.extConfig.entcode,
      extappid: app.globalData.extConfig.extappid,
      storeuid: app.globalData.store.storeuid
    };
    app.req({
      that: that,
      url: '/newwxa/prod/getHotProdList',
      loading: true,
      data: data,
      success: function (data) {
        that.setData({
          hotData: data.items
        });
      }
    })



  },

  //清除搜索记录
  clearHistory:function(){
      app.open.tips(that, {
        msg: "是否确定删除历史搜索",
        noBtnText:"取消",
        noBtn:true,
        yesBtnText:"确定",
        yesBtn:true,
        yesCallback: function(){
          wx.removeStorage({
            key: 'history',
            success (res) {
              that.setData({
                history:[]
              });
            }
          })
        }
      })		

  },
  //搜索
  search:function(e){
    let key = e.detail.value;
    that.searchGood(key);
  },
  //查询商品
  searchGood:function(key){
    let history = that.data.history;
    let good = {};
    app.req({
      that: that,
      url: '/newwxa/prod/getProdList',
      loading: true,
      data: {
        querystr: key,
        sessionid: app.globalData.sessionid,
        entvesion: app.globalData.extConfig.entvesion,
        entcode: app.globalData.extConfig.entcode,
        extappid: app.globalData.extConfig.extappid,
        storeuid: that.data.storeuid,
      },
      success: function (data) {
        let goods= [];
        if (data.items && data.items.length > 0) {
          let items = data.items;
          for(let i=0;i<items.length;i++){
            let proditems = items[i].proditems;
            for(let j=0;j<proditems.length;j++){
              let good = proditems[j];
              good.storeuid = that.data.storeuid;//用于判断是否同一门店
              goods.push(good);
            }
          }
        }
        that.setData({
          goods:goods
        });

      }
    })


    // if(history.length==0){
    //   history.push();
    // }

  },
  //选择商品
  choosedGood:function(e){
    let data = e.currentTarget.dataset;
    let history = that.data.history;
    let isExist = history.some(function(item,i){
        return item.produid == data.produid;
    });
    if (!isExist && !data.ishot){
        history.push(data);
        wx.setStorage({
          key:"history",
          data:JSON.stringify(history)
        })
    }
    app.globalData.searchGood = data;
    wx.navigateBack({
      url: '../../index'
    })
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
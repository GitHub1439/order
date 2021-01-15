
var common = require('../utils/common.js');
let util = require('../utils/util.js');

//获取应用实例
const app = getApp();
var that = null;
 
Page({
	data: {
    isAuthor: false,//是否授权
    theme:app.globalData.extConfig.theme,//主题色,
    eatType:0,
		bannerList:  [
			{
			"bannerUrl": "/image/banner/banner2.png",
			}
    ],
    isTakeOrder: true,
    orderBtnTitle:'下单',//下单按钮文本
    roderColor:app.globalData.extConfig.theme.major,//下单按钮背景
    tabbarData: app.globalData.tabbarData,
		/*
		store:{
			storeuid		门店ID
			storecode		门店编码
			storename		门店名称
			vcaddr			门店地址
			vctel			门店电话
			state			状态：-1删除，0正常,1停业
			eatingway 		就餐方式, 0 默认堂食外带，1仅堂食，2仅外带
			store_photo		门店图片
			longitude		门店经度
			latitude		门店纬度
			stbusiness		营业开始时间HH:MM
			endbusiness		营业结束时间HH:MM
		},
		*/

		menus: [],				// 分类列表包含商品数据
		currentMenusId: null,   // 当前分类id
		currentProditems: null, // 当前菜单分类商品

		selectData: [],    		// 已选商品
		cartDetailShow: false,  // 购物车详情显示开关

		chooseSpecLock: false,  // 选属性显示开关
		total:{
			count:0,		// 商品总数
			money:0			// 商品总价
		},
    menuActive:0,//点亮的menu分类下标
    right_height_arr:[],//商品分类数
    s_height: 0,//所有商品高度
    scrollTop: 0,//滚动高度
    ticket:false,//优惠券是否显示
    markShow:false,//优惠券遮罩层是否显示
    send_coupon_params:[],//发券参数
    sign:"",//签名 示例值：9A0A8659F005D6984697E2CA0A9CF3B79A0A8659F005D6984697E2CA0A9CF3B7
    send_coupon_merchant:"",//示例值：10016226
    entcode:app.globalData.extConfig.entcode,
    kqInfos:[],
    gruid:"",
	pkitems:[
		{proname:"啤酒150ml",price:5,unfold:false,id:1,taste:[{text:"微辣",active:0},{text:"中辣",active:1},{text:"多辣",active:0}],burdening:[{text:"煎蛋￥2",active:0},{text:"煎蛋￥5",active:1},{text:"煎蛋￥8",active:0}]},
		{proname:"啤酒150ml",price:5,unfold:false,id:2,taste:[{text:"微辣",active:0},{text:"中辣",active:1},{text:"多辣",active:0}],burdening:[{text:"煎蛋￥2",active:0},{text:"煎蛋￥5",active:1},{text:"煎蛋￥8",active:0}]},
		{proname:"啤酒150ml",price:5,unfold:false,id:3,taste:[],burdening:[]}
	],
	},

	onLoad: function (options) {
    that = this;
		that.setData({
			onloadOptions: options
    })
    
    //微信转发按钮
    wx.showShareMenu({
      withShareTicket: true
    })
     //转发信息
     that.getAuthor();
	},
	onShow: function () {
		let options = that.data.onloadOptions;
    let phoneAuthor = wx.getStorageSync('phoneAuthor') ? wx.getStorageSync('phoneAuthor'):false;//手机授权

    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        // if (res.authSetting['scope.userInfo']) {
        //   wx.getUserInfo({
        //     lang:'zh_CN',
        //     success: function (res) {
        //       that.setData({
        //         isAuthor: phoneAuthor?true:false
        //       })
        //     }
        //   });
        // } else {
        //   that.setData({
        //     isAuthor: false
        //   })
        // }
		that.setData({
		  isAuthor: phoneAuthor?true:false
		})
      }
    })

    that.pageDataInit(options);

    //底部导航
    if (typeof this.getTabBar === 'function' &&
    this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  },
  //选中/取消选中口味
  changeTaste:function(e){
	  let pkitems = that.deepClone(that.data.pkitems)
	  let dataset = e.target.dataset
	  if(dataset.goodtype == "fixed"){
		  for(let i = 0;i < pkitems.fixedItems[dataset.proidx].flavorInfo[dataset.itemidx].flanameitems.length;i++){
			  pkitems.fixedItems[dataset.proidx].flavorInfo[dataset.itemidx].flanameitems[i].active =false
		  }
		  pkitems.fixedItems[dataset.proidx].flavorInfo[dataset.itemidx].flanameitems[dataset.flavoridx].active = true
		  let attributes = ""
		  for(let i = 0;i < pkitems.fixedItems[dataset.proidx].flavorInfo.length;i++){
			  for(let j = 0;j < pkitems.fixedItems[dataset.proidx].flavorInfo[i].flanameitems.length;j++){
				  if(pkitems.fixedItems[dataset.proidx].flavorInfo[i].flanameitems[j].active){
					  attributes += pkitems.fixedItems[dataset.proidx].flavorInfo[i].flanameitems[j].flaname
					  if(j != pkitems.fixedItems[dataset.proidx].flavorInfo[i].flanameitems.length - 1){
						  attributes += ","
					  }
				  }
			  }
		  }
		  pkitems.fixedItems[dataset.proidx].attributes = attributes
	  }else{
		  for(let i = 0;i < pkitems.optionalItems[dataset.proidx].flavorInfo[dataset.itemidx].flanameitems.length;i++){
			  pkitems.optionalItems[dataset.proidx].flavorInfo[dataset.itemidx].flanameitems[i].active =false
		  }
		  pkitems.optionalItems[dataset.proidx].flavorInfo[dataset.itemidx].flanameitems[dataset.flavoridx].active = true
		  let attributes = ""
		  for(let i = 0;i < pkitems.optionalItems[dataset.proidx].flavorInfo.length;i++){
		  			  for(let j = 0;j < pkitems.optionalItems[dataset.proidx].flavorInfo[i].flanameitems.length;j++){
		  				  if(pkitems.optionalItems[dataset.proidx].flavorInfo[i].flanameitems[j].active){
		  					  attributes += pkitems.optionalItems[dataset.proidx].flavorInfo[i].flanameitems[j].flaname
							  if(j != pkitems.optionalItems[dataset.proidx].flavorInfo[i].flanameitems.length - 1){
							  		attributes += ","
							  }
		  				  }
		  			  }
		  }
		  pkitems.optionalItems[dataset.proidx].attributes = attributes
	  }
	  that.setData({
	  		  pkitems:pkitems
	  })
  },
  //展开口味配料
  unfoldAttr:function(e){
	  let pkitemid = e.target.dataset.id;
	  let pkitems = that.deepClone(that.data.pkitems)
	  if(e.target.dataset.goodtype == "fixed"){
		  for(let i = 0;i < pkitems.fixedItems.length;i++){
			  if(pkitems.fixedItems[i].produid == pkitemid){
				  pkitems.fixedItems[i].unfold = !pkitems.fixedItems[i].unfold
			  }
		  }
	  }else{
		  for(let i = 0;i < pkitems.optionalItems.length;i++){
				  if(pkitems.optionalItems[i].produid == pkitemid){
					  pkitems.optionalItems[i].unfold = !pkitems.optionalItems[i].unfold
				  }
		  }
	  }
	  that.setData({
		  pkitems:pkitems
	  })
  },
  unfoldAttrs:function(e){//勾选可选商品
	  let pkitemid = e.target.dataset.id;
	  let checkidx = e.target.dataset.checkidx
	  let pkitems = that.deepClone(that.data.pkitems)
	  let totalmoney = pkitems.calcamounttype == 1 && pkitems.prodtype == 3 ? 0 : pkitems.optionalItems[checkidx].price
	  let plitems = pkitems.optionalItems[checkidx].plitems
	  if(plitems && plitems.length > 0){
		  
	  
		  for(let i = 0;i < plitems.length;i++){
			  if(plitems[i].amount && plitems[i].amount > 0){
				  totalmoney += Math.round(util.accMul(plitems[i].price * plitems[i].amount, 100)) / 100
			  }
		  }
		  }
		  pkitems.optionalItems[checkidx].totalmoney = totalmoney
		  console.log(totalmoney)
		  if(pkitems.optionalItems[checkidx].check){
			  if(pkitems.calcamounttype == 0 && pkitems.prodtype == 3){
				  pkitems.prodtypePrice = Math.round(util.accMul(pkitems.prodtypePrice - totalmoney, 100)) / 100
			  }else{
				  pkitems.price = Math.round(util.accMul(pkitems.price - totalmoney, 100)) / 100
			  }
			  
		  }else{
			  if(pkitems.calcamounttype == 0 && pkitems.prodtype == 3){
			  		pkitems.prodtypePrice = Math.round(util.accMul(pkitems.prodtypePrice + totalmoney, 100)) / 100
			  }else{
			  		pkitems.price = Math.round(util.accMul(pkitems.price + totalmoney, 100)) / 100
			  }
			  // pkitems.price = Math.round(util.accMul(pkitems.price + totalmoney, 100)) / 100
		  }
	  pkitems.optionalItems[checkidx].check = !pkitems.optionalItems[checkidx].check
	  that.setData({
	  		pkitems:pkitems
	  })
  },
  opeTaste:function(e){//操作套餐配料数量
	  let dataset = e.target.dataset
	  if(!dataset.checked&& dataset.goodtype == "optional"){
		  that.timeTips("请勾选中商品才能操作哦"); 
		  return
	  }
	  let opeType = dataset.opeType
	  let pkitems = that.deepClone(that.data.pkitems)
	  // let opeObj = that.data.pkitems
	  let opeObj;
	  let amout = dataset.amount == undefined ? 0 : dataset.amount
	  
	  if(dataset.goodtype == "fixed"){
		  opeObj = that.data.pkitems.fixedItems[dataset.proidx].plitems[dataset.oprodidx]
	  }else{
		  opeObj = that.data.pkitems.optionalItems[dataset.proidx].plitems[dataset.oprodidx]
	  }
	  if(dataset.opetype == "add"){
	  		  opeObj.amount = amout + 1
			  opeObj.quantity = amout + 1
			  if(pkitems.calcamounttype == 0 && pkitems.prodtype == 3){ //prodtype 商品类型：1表示商品,2表示固定套餐,3表示可选套餐,4表示配料  calcamounttype 套餐金额：0固定套餐金额，1合计套餐内商品金额
				  pkitems.prodtypePrice =  Math.round(util.accMul(pkitems.prodtypePrice + opeObj.price, 100)) / 100
			  }else{
				  pkitems.price = Math.round(util.accMul(pkitems.price + opeObj.price, 100)) / 100
			  }
			  
	  }else{
		  if(amout != 0){
			  opeObj.amount = amout - 1
			  opeObj.quantity = amout - 1
			  // pkitems.price = Math.round(util.accMul(pkitems.price - opeObj.price, 100)) / 100
			  if(pkitems.calcamounttype == 0 && pkitems.prodtype == 3){ //prodtype 商品类型：1表示商品,2表示固定套餐,3表示可选套餐,4表示配料  calcamounttype 套餐金额：0固定套餐金额，1合计套餐内商品金额
			  		pkitems.prodtypePrice =  Math.round(util.accMul(pkitems.prodtypePrice - opeObj.price, 100)) / 100
			  }else{
			  		pkitems.price = Math.round(util.accMul(pkitems.price - opeObj.price, 100)) / 100
			  }
		  }else{
			  opeObj.amount = 0
			  opeObj.quantity = 0
		  }
	  		  
	  }
	  if(dataset.goodtype == "fixed"){
	  		  pkitems.fixedItems[dataset.proidx].plitems[dataset.oprodidx] = opeObj
			  that.setData({
			    pkitems:pkitems
			  })
	  }else{
	  		  pkitems.optionalItems[dataset.proidx].plitems[dataset.oprodidx] = opeObj
			  that.setData({
			    pkitems:pkitems
			  })
	  }
  },
  opeTasteProduct: function(e){//操作商品配料数量
	  let dataset = e.target.dataset
	  let opeType = dataset.opeType
	  let specialGood = that.deepClone(that.data.specialGood)
	  let amount = dataset.amount == undefined ? 0 : dataset.amount
	  let opeObj = specialGood.plitems[dataset.proidx]
	  if(dataset.opetype == "add"){
	  		  opeObj.amount = amount + 1
			  opeObj.quantity = amount + 1
			  specialGood.price = Math.round(util.accMul(specialGood.price + opeObj.price, 100)) / 100
	  }else{
		  if(amount != 0){
			  opeObj.amount = amount - 1
			  opeObj.quantity = amount - 1
			  specialGood.price = Math.round(util.accMul(specialGood.price - opeObj.price, 100)) / 100
		  }else{
			  opeObj.amount = 0
			  opeObj.quantity = 0
		  }
	  }
	  specialGood.plitems[dataset.proidx] = opeObj
	  that.setData({
	    specialGood:specialGood
	  })
  },
  pkadd: function(e){
	  let pkitems = that.deepClone(that.data.pkitems)
	  if(pkitems.showDetail){
		  that.setData({
		    pkitems: ""
		  });
		  return
	  }
	  pkitems.pkgitems = []
	  let fixedItems = pkitems.fixedItems
	  let optionalItems = pkitems.optionalItems
	  for(let i = 0;i < fixedItems.length;i++){
		  let plitem = fixedItems[i]
		  let plitemArr = []
		  if(plitem.plitems && plitem.plitems.length > 0){
			  
		  for(let j = 0;j < plitem.plitems.length;j++){
			  if(plitem.plitems[j].quantity && plitem.plitems[j].quantity > 0){
				  plitemArr.push(plitem.plitems[j])
			  }
		  }
		  }
		 fixedItems[i].plitems = plitemArr
		 pkitems.pkgitems.push(fixedItems[i])
	  }
	  
	  for(let i = 0;i < optionalItems.length;i++){
	  		  let plitem = optionalItems[i]
	  		  let plitemArr = []
			  if(plitem.plitems && plitem.plitems.length > 0){
	  		  for(let j = 0;j < plitem.plitems.length;j++){
	  			  if(plitem.plitems[j].quantity && plitem.plitems[j].quantity > 0){
	  				  plitemArr.push(plitem.plitems[j])
	  			  }
	  		  }
			  }
	  		 optionalItems[i].plitems = plitemArr
			 if(optionalItems[i].check){
				 pkitems.pkgitems.push(optionalItems[i])
			 }
			 
	  }
	  if(pkitems.pkgitems.length == 0){
		  that.timeTips("请至少选择一个商品");
		  return
	  }
	  if(pkitems.calcamounttype == 0 && pkitems.prodtype == 3){
		  pkitems.price = pkitems.prodtypePrice
	  }
	  pkitems.count = 1
	  let store = that.data.store;
	  let data = {
	    sessionid: app.globalData.sessionid,
	    entvesion: app.globalData.extConfig.entvesion,
	    entcode: app.globalData.extConfig.entcode,
	    extappid: app.globalData.extConfig.extappid,
	    storeuid: store.storeuid,
	    opetype: 1,
	    item: pkitems
	  };
	  app.req({
	    that: that,
	    url: '/newwxa/shopping/opeShopCart',
	    loading:false,
	    data: JSON.stringify(data),
	    success: function (data) {
	      if (data.code == 0) {
	        let items = data.items ? data.items:[];
	        that.setData({
	          total: data.total,
	          selectData: items,
			  pkitems: ""
	        });
	      
	        that.changeOrderTitle();
	        that.getGoodRefresh();
	      }
	    }
	  })
  },
  deepClone: function(obj){
  　　let objClone =  Array.isArray(obj) ? [] : {};
  　　if (obj && typeof obj === 'object') {
  　　　　for(let key in obj){
  　　　　　　if (obj[key] && typeof obj[key] === 'object'){
  　　　　　　　　objClone[key] = that.deepClone(obj[key]);
  　　　　　　}else{
  　　　　　　　　objClone[key] = obj[key]
  　　　　　　}
  　　　　}
  　　}
  　　return objClone;
  },
  //获取小程序信息
  getAuthor: function () {
    let reqData = {
      //sessionid: app.globalData.sessionid,
      entvesion: app.globalData.extConfig.entvesion,
      entcode: app.globalData.extConfig.entcode,
      extappid: app.globalData.extConfig.extappid
    }
    app.req({
      that: that,
      url: '/wxa/store/GetAuthorization',
      data: reqData,
      success: function (data) {
        if (data.items) {
          that.setData({
            title: data.items.nickname,
            imagurl: data.items.headimg,
          })
        }
      }
    })
  },
  // 获取券列表
  getcouponList: function() {
    console.log(that.data.store)
    let datas = {cardsources:1,en:that.data.entcode,grtype:7,storeuid: that.data.store.storeuid,wxaopenid:wx.getStorageSync("wx_openid")}
    app.req({
      that: that,
      url: '/newwxa/user/miniProgramsActivity',
      loading: true,
      data: datas,
      success: function (data){
        if(data.items && data.items.kqInfos.length > 0 && data.items.signMap){
        var send_coupon_params = JSON.parse(data.items.signMap.send_coupon_params)
        // for(let i = 0;i < send_coupon_params.length;i++){
        //   var out_no = "out_request_no"+i
        //   var stock_id = "stock_id"+i
          
        //   send_coupon_params[i][out_no] = send_coupon_params[i].out_request_no
        //   send_coupon_params[i][stock_id] = send_coupon_params[i].stock_id

        //   delete send_coupon_params[i].out_request_no
        //   delete send_coupon_params[i].stock_id
        // }
        // console.log(send_coupon_params)
        that.setData({
          markShow: true,
          ticket:true,
          kqInfos:data.items.kqInfos,
          send_coupon_params:send_coupon_params,
          send_coupon_merchant:data.items.signMap.send_coupon_merchant,
          sign:data.items.signMap.sign,
          gruid:data.items.kqInfos[0].gruid,
        })
      }
    }
    })
  },
  closeTicket:function(){//关闭优惠券领取
    this.setData({
      markShow: false,
      ticket:false
    })
    console.log(this.data)
  },

  // 此函数名称可以自定义，跟bindcustomevent绑定的保持一致
  getcoupon: function(params) {
    // 插件返回信息在params.detail
    console.log('getcoupon', params)
    if(params.detail.errcode == "OK" && params.detail.send_coupon_result[0].code == "SUCCESS"){
      that.setData({
        markShow: false,
        ticket:false
      },function(){
        that.timeTips("领券成功"); 
        let kqidList = []
        let coupon_result = params.detail.send_coupon_result
        for(let i = 0;i < coupon_result.length;i++){
          for(let j = 0;j < that.data.kqInfos.length;j++){
            if(that.data.kqInfos[j].card_id == coupon_result[i].stock_id && coupon_result[i].code == "SUCCESS"){
              let kqidListItem = {gdcode:coupon_result[i].coupon_code,gruid:that.data.kqInfos[j].gruid,kqid:that.data.kqInfos[j].kqid,card_id:that.data.kqInfos[j].card_id};//gdcode取值为微信返回的 gruid和kqid则取得是kqinfo里的
              kqidList.push(kqidListItem)
            }
          }
        }
        console.log(kqidList)
        let data = {en:app.globalData.extConfig.entcode,wxaopenid:wx.getStorageSync("wx_openid"),kqidList:JSON.stringify(kqidList),sessionid:wx.getStorageSync("sessionid"),entvesion: app.globalData.extConfig.entvesion,storeuid:that.data.store.storeuid}
        app.req({
          that: that,
          url: '/newwxa/user/miniSaveWxaopenid',
          loading: true,
          data: data,
          success: function (data){
          }
        })
      })
    }else{
      if(params.detail.errcode == "OK"){
        that.tips(params.detail.send_coupon_result[0].message); 
      }else{
        that.tips(params.detail.msg); 
      }
    }
  },
  //转发
  onShareAppMessage: function (ops) {
    if (ops.from === 'button') {
      // 来自页面内转发按钮
      console.log(ops.target)
    }
    return {
      title: that.data.title,
      path: "pages/index",
      imageUrl: that.data.imagurl,
      success: function (res) {
        wx.showToast("转发成功");
        // shareAppMessage: ok,

        // shareTickets 数组，每一项是一个 shareTicket ，对应一个转发对象

        // 需要在页面onLoad()事件中实现接口

        wx.showShareMenu({

          // 要求小程序返回分享目标信息

          withShareTicket: true

        });


      },
      fail: function (res) {
        // 转发失败
        wx.showToast("转发失败");
      }
    }

  },
  // 页面一开始进来时判断 门店
  pageDataInit: function (options) {
    let storeuid = '', tablecode='';
    let store = app.globalData.store;

    if (options.storeuid) {//扫码进来
      storeuid = options.storeuid;
      tablecode = options.tablecode ? options.tablecode : app.globalData.tablecode;
      app.globalData.tablecode = tablecode;

      that.setData({ //清除扫码进来的记录
        onloadOptions:{}
      });

      that.getStoreList(storeuid);
    }else{
      //有门店，刷新门店后获取商品
      if (store){
        storeuid = store.storeuid;
        that.setData({
          store: store
        })
        app.globalData.tablecode = '';
        that.getStoreList(storeuid);
      }
      else{// 没有门店信息，获取当前位置，然后请求最近门店
        if(app.globalData.scene == "1011" || app.globalData.scene == "1047" || app.globalData.scene == "1017"){ //根据场景值判断是扫公众码进来还是没有门店的情况
          wx.redirectTo({ 
            url: './home/selectStore/selectStore',
          },function(){
            that.timeTips("请选择门店！"); 
          })
        }else{
          that.getLocation();
        }
        
      }
    }

  },

  onReady: function () {
    //that.tips('最常用的提示');
    // app.open.timeTips(that, '停留时间的提示');


  },
  tips: function (msg) {
    app.open.tips(that, {
      msg: msg
    })
  },

  timeTips: function (msg) {
    app.open.timeTips(that, msg)
  },

  scroll: function (e) {
    var self = that;
    self.scrollmove(self,e.detail.scrollTop);
  },
  scrollmove: function (self,scrollTop) {
    let that = this;
    let scrollArr = that.data.right_height_arr;
    let menus = that.data.menus;
    if (scrollTop > scrollArr[scrollArr.length - 1]) {
      return;
    } else {
      for (let i = 0; i < scrollArr.length; i++) {
        if (scrollTop >= 0 && scrollTop < scrollArr[0]) {
          if (0 != self.data.menuActive) {
            self.setData({
              menuActive:0,
              currentMenusId: menus[0].prodclassuid,
              leftView:"t"+0
            });
          }
        } else if (scrollTop >= scrollArr[i - 1] && scrollTop <= scrollArr[i]) {
          if (i != that.data.menuActive) {
            //let i = i<that.data.menuActive?that.data.menuActive:i;
            self.setData({
              currentMenusId: menus[i].prodclassuid,
              menuActive: i,
              leftView: "t" + i
            });
          }
        }
      }
    }
  },
  getHeightArr: function (self) {
    let right_height = 0;
    let right_height_arr = [];
    let query = wx.createSelectorQuery();
    query.selectAll('.good-item').boundingClientRect();//分类下所有商品
    query.selectAll('.swiper-item').boundingClientRect();//轮播
    query.exec(function (rect) {
      right_height += (rect[1])[0].height;//轮播高度
      for (let i = 0; i < rect[0].length;i++){
        right_height += (rect[0])[i].height;
        right_height_arr.push(right_height);
      }
      that.setData({
        right_height_arr: right_height_arr,
      });
    });
  },
  //定位搜索商品所在位置
  goodPosition:function(){
    let searchGood = app.globalData.searchGood;
    if(searchGood && searchGood !== null){
      let menus = that.data.menus;
      for(let i=0;i<menus.length;i++){
        let proditems = menus[i].proditems;
        if(menus[i].prodclassuid == searchGood.prodclassuid){
          that.setData({
            currentMenusId: menus[i].prodclassuid,
            menuActive: i,
            leftView: "t" + i
          });
          
          for(let j=0;j<proditems.length;j++){
            if(proditems[j].produid == searchGood.produid){
              // 存在其他属性或者扩展单位
              if (proditems[j].flaclassitems || proditems[j].exunititems) {
                that.setData({
                  specialGood: proditems[j],
                  chooseSpecLock:true
                });
              }

              that.setData({
                toView:'d'+proditems[j].produid
              });
                break;
            }
        }

        }
      }
    }
  },
  // 获取位置
  getLocation: function () {

    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var speed = res.speed;
        var accuracy = res.accuracy;
        var longitude = res.longitude;
        var latitude = res.latitude;

        var location = {
          longitude: longitude,
          latitude: latitude
        }
        app.globalData.location = location;
        that.setData({
          hasLocation: true,
          longitude: longitude,
          latitude: latitude,
        })

        // 获取门店
        that.getStoreList();
      },
      fail: function (res) {

        app.open.tips(that, {
          msg: '您没有授权获取地理位置服务，必须授权才能操作哦！',
          yesCallback: function () {
            wx.openSetting({
              scope: 'scope.userLocation',
              success: function () {
                that.getLocation();
              }
            })
          }
        })
      }
    })

  },
	//选择就餐方式
	choosedWay:function(e){
    let num = e.currentTarget.dataset.num;
    let selectAddress = wx.getStorageSync('selectAddress')?JSON.parse(wx.getStorageSync('selectAddress')):null;
	that.setData({
	  eatType:e.currentTarget.dataset.num
	})
    if(e.currentTarget.dataset.num == 0 && that.data.store.eatingway.indexOf('0') == -1){
		that.setData({
		  eatType:2
		})
    }
		
    that.changeOrderTitle();

    //未设置地址
    if(num == 1 && selectAddress === null){
      wx.navigateTo({
        url: './address/addressList/addressList?type=payorder'
      })
    }
  },
  //跟换下单按钮提示
  changeOrderTitle:function(){
    let eatType = that.data.eatType;//0自取，1外卖
    let roderColor= app.globalData.extConfig.theme.major;
    let orderBtnTitle = "下单";
    let isTakeOrder = true;
    if(eatType == 1){//外卖
      let orderMoney = that.data.total.money;
      let mustmoney = app.globalData.store.mustmoney?app.globalData.store.mustmoney:0;
      if(orderMoney<mustmoney){
        orderBtnTitle = "满"+mustmoney+"元起送";
        roderColor = "#EAEBF0";
        isTakeOrder = false;
      }
    }else{//自取
      orderBtnTitle = "下单";
    }
    that.setData({
      orderBtnTitle:orderBtnTitle,
      roderColor:roderColor,
      isTakeOrder: isTakeOrder
    });
  },
  // 获取门店信息列表
  getStoreList: function (storeuid) {
    var datas = {
      sessionid: app.globalData.sessionid,
      entvesion: app.globalData.extConfig.entvesion,
      entcode: app.globalData.extConfig.entcode,
      extappid: app.globalData.extConfig.extappid,
    }
    if (storeuid) {
      datas.storeuid = storeuid;
    }
    else {
      datas.longitude = that.data.longitude;
      datas.latitude = that.data.latitude;
    }
    app.req({
      that: that,
      url: '/wxa/store/getStoreList',
      loading: true,
      data: datas,
      success: function (data) {
        if (data.items && data.items.length > 0) {
          let  store = null;
          if (storeuid) {
            store = data.items.find(function (v) {
              return v.storeuid == storeuid;
            })
          } else {
            store = data.items[0];
          }

          app.globalData.store = store;

          //是否显示就餐方式
          let eatingway = String(store.eatingway).split(',').sort();
          let showType = (eatingway.indexOf('1') != -1 && eatingway.indexOf('0') != -1 || eatingway.indexOf('1') != -1 && eatingway.indexOf('2') != -1)?true: false;
          if(!showType){
            if (eatingway.indexOf('0') != -1){
              that.setData({
                eatType: 0
              });
            }else if (eatingway.indexOf('2') != -1){
              that.setData({
                eatType: 2
              });
            }else{
              that.setData({
                eatType: 1
              });
            }
          }else{
            if(eatingway.indexOf('0') != -1 && eatingway.indexOf('2') != -1){
              that.setData({
                eatType: 0
              });
            }else if(eatingway.indexOf('0') != -1){
				that.setData({
				  eatType: 0
				});
			}else{
				that.setData({
				  eatType: 2
				});
			}
          }

          that.setData({
            showType: showType,
            store: store,
            bannerView: true
          });
          // state 状态：-1删除，0正常,1停业
          if (store.state != 0) {
            var str = '该门店已经停止营业了，去其它门店看看吧！';
            app.open.timeTips(that, str);
          }
          if (store.state >= 0) {
            that.getProdList();
          }
        }
        else {
          that.setData({
            bannerView: true
          });
          if (!data.items) {
            var str = data.msg;
          } else {
            var str = storeuid ? '没有找到您要的门店，到其他门店看看吧！' : '暂无门店数据!';
          }
          app.open.tips(that, {
            msg: str,
            yesCallback: function () {
              // wx.navigateTo({
              //   url: '/pages/index',
              // })
            }
          })
        }
        that.getcouponList()
      }
    })
  },
  //查询购物
  getCartData:function(){
    var store = that.data.store;
    app.req({
      that: that,
      url: '/newwxa/shopping/getShopCart',
      loading: true,
      data: {
        sessionid: app.globalData.sessionid,
        entvesion: app.globalData.extConfig.entvesion,
        entcode: app.globalData.extConfig.entcode,
        extappid: app.globalData.extConfig.extappid,
        storeuid: store.storeuid,
      },
      success: function (data) {
        let items = data.items ? data.items:[];
        that.setData({
          total: data.total,
          selectData: items
        });
        that.getGoodRefresh();
        that.changeOrderTitle();
      }
      })
  },
  // 获取商品
  getProdList: function () {
    var store = that.data.store;
    app.req({
      that: that,
      url: '/newwxa/prod/getProdList',
      loading: true,
      data: {
        sessionid: app.globalData.sessionid,
        entvesion: app.globalData.extConfig.entvesion,
        entcode: app.globalData.extConfig.entcode,
        extappid: app.globalData.extConfig.extappid,
        storeuid: store.storeuid,
      },
      success: function (data) {
        if (data.items) {
          if (data.items.length > 0) {

            for (var i = 0; i < data.items.length; i++) {
              for (var j = 0; j < data.items[i].proditems.length; j++) {
                var good = data.items[i].proditems[j];
                if ((good.exunititems && good.exunititems.length > 0) || (good.flaclassitems && good.flaclassitems.length > 0 || good.ispkg == 1 || good.plitems && good.plitems.length > 0)) {
                  data.items[i].proditems[j].more = true;
                }
              }
            }

            that.setData({
              menus: data.items,
              currentMenusId: data.items[0].prodclassuid
            })

            that.getHeightArr(that);
            that.goodPosition();
            that.getCartData();
          }
          else {
            that.setData({
              menus: data.items,
              noGoodsMsg: '该门店暂无商品数据！',
              currentProditems: null
            })
          }
        }
        else {
          that.tips(data.msg);
        }
      }
    })
  },
  //计算商品或分类数量
  getGoodRefresh: function () {
    var selectData = that.data.selectData;
    var items = that.data.menus;

    items.forEach(function (item, index) {
        item.proditems.forEach(function (good, j) {
          good.count = 0;
        })
    })



    //购物车为空
    if (selectData.length == 0) {
      items.forEach(function (item, index) {
        item.count = 0;
        item.proditems.forEach(function (good, i) {
          good.count = 0;
        })
      })
    } else {
      items.forEach(function (item, index) {
        item.count = 0;
        selectData.forEach(function (val, i) {
          if (val.prodclassuid == item.prodclassuid) {
            item.proditems.forEach(function (good, j) {
              if (good.produid == val.produid  || good.produid == val.oproduid) {
                item.count += val.count;
                if (val.attributes == "" || val.attributes || val.ispkg == 1){
                  good.count += val.count; 
                  good.more = true;
                }else{
                  good.count = val.count; 
                }
              }
            })
          }
        })
      })
    }


    //关闭购物车
    if (selectData.length == 0) {
      that.setData({
        cartDetailShow: false
      });
    }
    //关闭商品大图
    let lgImgGoodShow = that.data.lgImgGoodShow;
    if (lgImgGoodShow) {
      that.setData({
        lgImgGoodShow: false
      });
    }

    //关闭规格大图
    let isSearch = app.globalData.searchGood?true: false;//搜索商品
    let chooseSpecLock = that.data.chooseSpecLock;
    if (chooseSpecLock && !isSearch) {
      that.setData({
        chooseSpecLock: false
      });
    }
    if(isSearch){
      app.globalData.searchGood = null;//清除本次搜索
    }
    that.setData({
      menus: items
    });

  },
  //选择分类
  selectMenu: function (event) {
    let data = event.currentTarget.dataset;
    var prodclassuid = data.id;

    that.setData({
      currentMenusId: prodclassuid,
      toView: "d" + prodclassuid
      // scrollTop: 0,
    })
  },
  //操作购物车
  opeShopCart: function (good,opetype){
    let store = that.data.store;
    let data = {
      sessionid: app.globalData.sessionid,
      entvesion: app.globalData.extConfig.entvesion,
      entcode: app.globalData.extConfig.entcode,
      extappid: app.globalData.extConfig.extappid,
      storeuid: store.storeuid,
      opetype: opetype,
      item: good
    };
    app.req({
      that: that,
      url: '/newwxa/shopping/opeShopCart',
      loading: opetype==3?true:false,
      data: JSON.stringify(data),
      success: function (data) {
        if (data.code == 0) {
          let items = data.items ? data.items:[];
          that.setData({
            total: data.total,
            selectData: items
          });
        
          if (opetype == 3){
            that.timeTips("购物车已清空");
          }
          that.changeOrderTitle();
          that.getGoodRefresh();
        }
      }
    })
  },


  // 商品列表中加商品数
  addCount: function (event) {
    let data = event.currentTarget.dataset;
    let menus = that.data.menus;
    let menu = menus.find(function (v) {
      return v.prodclassuid == data.prodclassuid;
    })
    var goodsList = menu.proditems;
    let good = goodsList.find(function (v) {
      return v.produid == data.id;
    })

    if (good.state != 0) {
      var str = '该商品暂不支持下单，请选择其他商品！';
      that.timeTips(str);
      return false;
    }
    good.count = 1;
    that.opeShopCart(good, 1);
  },
  //购物车减
  minusCount: function (event) {
    let data = event.currentTarget.dataset;
    let menus = that.data.menus;

    let menu = menus.find(function (v) {
      return v.prodclassuid == data.prodclassuid;
    })
    var goodsList = menu.proditems;
    let good = goodsList.find(function (v) {
      return v.produid == data.id;
    })
    good.count =1;
    // let selectGood = JSON.parse(JSON.stringify(good))
    // selectGood.count = 1;
    that.opeShopCart(good, 2);
  },

  // 查看大图
  lookLgImg: function (event) {
    let data = event.currentTarget.dataset;
    let menus = that.data.menus;

    let menu = menus.find(function (v) {
      return v.prodclassuid == data.prodclassuid;
    })
    var goodsList = menu.proditems;
    let good = goodsList.find(function (v) {
      return v.produid == data.id;
    })
	if(good.ispkg == 1){
		let pkitems = that.deepClone(good)
		pkitems.showDetail = true
		that.selectGuige(pkitems)
	}else{
		that.setData({
		  lookLgImgGood: good,
		  lgImgGoodShow: true,
		})
	}
    // that.setData({
    //   lookLgImgGood: good,
    //   lgImgGoodShow: true,
    // })
  },
  // 关闭商品大图
  changeLgImgGoodShow: function (event) {
    that.setData({
      'lgImgGoodShow': !that.data.lgImgGoodShow
    })
  },

  // 点击选规格
  selectAttribute: function (event) {
    let data = event.currentTarget.dataset;
    let menus = that.data.menus;
// debugger
    let menu = menus.find(function (v) {
      return v.prodclassuid == data.prodclassuid;
    })
    var goodsList = menu.proditems;
    let good = goodsList.find(function (v) {
      return v.produid == data.id;
    })

    // 扩展单位的
    if (good.exunititems && good.exunititems.length > 0) {
      for (var i = 0; i < good.exunititems.length; i++) {
        if (i == 0) {
          good.showPrice = good.exunititems[i].price;
          good.exunititems[i].select = true;
        }
        else {
          good.exunititems[i].select = false;
        }
      }
    }

    // 其他属性的
    if (good.flaclassitems && good.flaclassitems.length > 0) {
      for (var i = 0; i < good.flaclassitems.length; i++) {

        for (var j = 0; j < good.flaclassitems[i].flanameitems.length; j++) {
          good.flaclassitems[i].flanameitems[j].select = false;
        }
      }
    }

    // 如果是大图中的点击过来，关闭大图弹窗
    if (data.lgimg == 'true') {
      that.changeLgImgGoodShow();
    }
	if(good.ispkg == 1){
		let pkitems = that.deepClone(good)
		that.selectGuige(pkitems)
		
	}else{
		that.setData({
		  chooseSpecLock: true,
		  specialGood: good
		})
	}
    
  },
  selectGuige: function(good){
	  let pkitems = good
	  let optionalItems = pkitems.optionalItems
	  let fixedItems = pkitems.fixedItems
	  for(let i = 0;i < fixedItems.length;i++){
	  	if(fixedItems[i].flavorInfo){
	  		let attributes = ""
	  	
	  	for(let j = 0;j < fixedItems[i].flavorInfo.length;j++){
	  		if(fixedItems[i].flavorInfo[j].flanameitems && fixedItems[i].flavorInfo[j].flanameitems.length > 0){
	  			
	  		
	  		
	  		for(let k = 0;k <fixedItems[i].flavorInfo[j].flanameitems.length;k++){
	  			fixedItems[i].flavorInfo[j].flanameitems[k].active = false
	  		}
	  		fixedItems[i].flavorInfo[j].flanameitems[0].active = true
	  		attributes += fixedItems[i].flavorInfo[j].flanameitems[0].flaname
	  		if(j != fixedItems[i].flavorInfo.length - 1){
	  			attributes += ","
	  		}
	  		}
	  	}
	  	fixedItems[i].attributes = attributes
		
	  	}
		fixedItems[i].unfold = false
	  }
	  for(let i = 0;i < optionalItems.length;i++){
	  	if(optionalItems[i].flavorInfo){
	  		
	  	let attributes = ""
	  	for(let j = 0;j < optionalItems[i].flavorInfo.length;j++){
	  		if(optionalItems[i].flavorInfo[j].flanameitems && optionalItems[i].flavorInfo[j].flanameitems.length > 0){
	  			
	  		
	  		for(let k = 0;k <optionalItems[i].flavorInfo[j].flanameitems.length;k++){
	  			optionalItems[i].flavorInfo[j].flanameitems[k].active = false
	  		}
	  		optionalItems[i].flavorInfo[j].flanameitems[0].active = true
	  		attributes += optionalItems[i].flavorInfo[j].flanameitems[0].flaname
			if(j != optionalItems[i].flavorInfo.length - 1){
				attributes += ","
			}
	  		}
	  	}
	  	optionalItems[i].attributes = attributes
		
	  	}
		optionalItems[i].unfold = false
	  }
	  if(pkitems.calcamounttype == 0 && pkitems.prodtype == 3){ //prodtype 商品类型：1表示商品,2表示固定套餐,3表示可选套餐,4表示配料  calcamounttype 套餐金额：0固定套餐金额，1合计套餐内商品金额
		  if(pkitems.fixedItems && pkitems.fixedItems.length > 0){
			  pkitems.prodtypePrice = pkitems.price
		  }else{
			  pkitems.prodtypePrice = 0
		  }
		  
	  }
	  that.setData({
	  	pkitems:pkitems
	  })
	  console.log(pkitems)
  },
  // 隐藏选规格
  changeSpecLock: function () {
    this.setData({
      chooseSpecLock: false,
    })
  },

  // 选择辅单位
  chooseExunit: function (event) {
    let data = event.currentTarget.dataset;
    let total = that.data.total;
    let menus = that.data.menus;

    // 获取对象, 及其索引
    var menu, good, exunititem;
    var menuIndex = -1;
    var goodIndex = -1;
    var exunitIndex = -1;

    for (var i = 0; i < menus.length; i++) {
      if (menus[i].prodclassuid == data.prodclassuid) {
        menu = menus[i];
        menuIndex = i;
      }
    }
    var goodsList = menu.proditems;
    for (var i = 0; i < goodsList.length; i++) {
      if (goodsList[i].produid == data.produid) {
        good = goodsList[i];
        goodIndex = i;
      }
    }
    var exunititems = good.exunititems;
    for (var i = 0; i < exunititems.length; i++) {
      if (exunititems[i].exprodid == data.exprodid) {
        exunititem = exunititems[i];
        exunitIndex = i;
      }
    }

    // 变数据
    for (var i = 0; i < exunititems.length; i++) {
      good.exunititems[i].select = false;
    }
    good.exunititems[exunitIndex].select = true;
    good.showPrice = good.exunititems[exunitIndex].price;

    that.setData({
      specialGood: good,
    })

  },
  // 选择其他属性
  chooseAttribute: function (event) {
    let data = event.currentTarget.dataset;
    let total = that.data.total;
    let menus = that.data.menus;

    // 获取对象, 及其索引
    var menu, good, flaclassitem, flanameitem;
    var menuIndex = -1;
    var goodIndex = -1;
    var flaclassIndex = -1;
    var flaIndex = -1;

    for (var i = 0; i < menus.length; i++) {
      if (menus[i].prodclassuid == data.prodclassuid) {
        menu = menus[i];
        menuIndex = i;
      }
    }
    var goodsList = menu.proditems;
    for (var i = 0; i < goodsList.length; i++) {
      if (goodsList[i].produid == data.produid) {
        good = goodsList[i];
        goodIndex = i;
      }
    }
	// good = that.deepClone(good)
    var flaclassitems = good.flaclassitems;
    for (var i = 0; i < flaclassitems.length; i++) {
      if (flaclassitems[i].flaclassid == data.flaclassid) {
        flaclassitem = flaclassitems[i];
        flaclassIndex = i;
      }
    }
    var flanameitems = flaclassitem.flanameitems;
    for (var i = 0; i < flanameitems.length; i++) {
      if (flanameitems[i].flaid == data.flaid) {
        flanameitem = flanameitems[i];
        flaIndex = i;
      }
    }

    // 变数据
    var specialGood = that.data.specialGood;
    var select = specialGood.flaclassitems[flaclassIndex].flanameitems[flaIndex].select;
    if (select) {
      good.flaclassitems[flaclassIndex].flanameitems[flaIndex].select = false;
    }
    else {
      for (var i = 0; i < flanameitems.length; i++) {
        good.flaclassitems[flaclassIndex].flanameitems[i].select = false;
      }
      good.flaclassitems[flaclassIndex].flanameitems[flaIndex].select = true;
    }
	let price = specialGood.price
	// for(let i = 0;i < specialGood.plitems.length;i++){
	// 	if(specialGood.plitems[i].amount && specialGood.plitems[i].amount > 0){
	// 		let itemTotalPrice =  Math.round(util.accMul(specialGood.plitems[i].amount * specialGood.plitems[i].price, 100)) / 100
	// 		price = Math.round(util.accMul(price + itemTotalPrice, 100)) / 100
	// 	}
	// }
	// specialGood.price = price
	
	let goodClone = that.deepClone(good)
	goodClone.price = price
	goodClone.plitems = specialGood.plitems

    that.setData({
      specialGood: goodClone,
    })
  },

  // 加入购物车
  addCart: function (event) {
    let data = event.currentTarget.dataset;
    let menus = that.data.menus;

    // 获取对象, 及其索引
    var menu, good, exunititem;
    var menuIndex = -1;
    var goodIndex = -1;
    var exunitIndex = -1;

    for (var i = 0; i < menus.length; i++) {
      if (menus[i].prodclassuid == data.prodclassuid) {
        menu = menus[i];
        menuIndex = i;
      }
    }
    var goodsList = menu.proditems;
    for (var i = 0; i < goodsList.length; i++) {
      if (goodsList[i].exunititems || goodsList[i].flaclassitems){
        goodsList[i].count = 0;
      }

      if (goodsList[i].produid == data.produid) {
        good = goodsList[i];
        goodIndex = i;
      }
    }

    var exunititems = good.exunititems;
    if (exunititems) {
      for (var i = 0; i < exunititems.length; i++) {
        if (exunititems[i].select) {
          exunititem = exunititems[i];
          exunitIndex = i;
        }
      }
    }
    if (exunititem && !exunititem.count) {
      exunititem.count = 0;
    }

    // 口味等其他属性
    var flaclassitems = good.flaclassitems;
    var arr = [];
    if (flaclassitems) {
      for (var i = 0; i < flaclassitems.length; i++) {
        var flanameitems = flaclassitems[i].flanameitems;
        for (var j = 0; j < flanameitems.length; j++) {
          if (flanameitems[j].select) {
            arr.push(flanameitems[j].flaname);
          }
        }
      }
    }
	
	// 配料等其他属性
	var plitems = that.data.specialGood.plitems;
	var plitemsArr = [];
	if (plitems) {
	  for (var i = 0; i < plitems.length; i++) {
	    if (plitems[i].amount && plitems[i].amount > 0){
			plitemsArr.push(plitems[i]);
		}
	  }
	}

    // 是单位商品
    var createGood = {}
    if (exunititem) {
      var unit = exunititem.exunit ? exunititem.exunit : exunititem.unit;	// 常规的是 exunititem.unit
      var state = exunititem.state ? exunititem.state : good.state; 		// 常规的是 good.state

      createGood.featurelable = good.featurelable;
      createGood.price = exunititem.price;  	//
      createGood.prodclassuid = good.prodclassuid;
      createGood.prodcode = good.prodcode;
      createGood.prodname = good.prodname + '/' + unit; //
      createGood.produid = exunititem.exprodid;  // 
      createGood.oproduid = good.produid;   		// 扩展单位外头的 商品id
      createGood.exprodid = exunititem.exprodid; 	// 扩展单位标识

      createGood.state = state;
      createGood.unit = unit;
    }
    // 常规选属性商品
    else {
      createGood.featurelable = good.featurelable;
      createGood.price = good.price;		//
      createGood.prodclassuid = good.prodclassuid;
      createGood.prodcode = good.prodcode;
      createGood.prodname = good.prodname	 	// 
      createGood.produid = good.produid;  	//
      createGood.state = good.state;    	//
      createGood.unit = good.unit;     	//
    }
    createGood.ispkg = good.ispkg;//是否是套餐
    createGood.count = 1;
    createGood.attributes = arr.join(',');
	createGood.plitems = plitemsArr
	createGood.price = that.data.specialGood.price;

    if (createGood.state != 0) {
      var str = '该商品暂不支持下单，请选择其他商品！';
      that.timeTips(str);
      return false;
    }
    that.opeShopCart(createGood,1);
  },


	  // 购物详情中的 加数
		cartAddCount: function (event) {
			let data = event.currentTarget.dataset;
			let selectData = that.data.selectData;
      let selectGood = null;
      let menus = that.data.menus;

      let menu = menus.find(function (v) {
        return v.prodclassuid == data.prodclassuid;
      })
      let goodsList = menu.proditems;
      for (var i = 0; i < goodsList.length; i++) {
        if (goodsList[i].exunititems || goodsList[i].flaclassitems) {
          goodsList[i].count = 0;
        }

        if (goodsList[i].produid == data.produid) {
          good = goodsList[i];
        }
      }

			// 已选商品
			let price = 0;//当前商品
			for (var i = 0; i < selectData.length; i++) {
				if (data.exprodid) {
					if(selectData[i].exprodid == data.exprodid && selectData[i].prodname == data.prodname && selectData[i].attributes == data.attributes){
							selectGood  = selectData[i];			
					}
				}
				// 无扩展单位
				else {
          if (data.attributes) {
            if (selectData[i].produid == data.id && selectData[i].prodname == data.prodname && selectData[i].attributes == data.attributes) {
              selectGood = selectData[i];
            }
          } else {
            if (selectData[i].produid == data.id && selectData[i].prodname == data.prodname && !selectData[i].attributes) {
              selectGood = selectData[i];
            }
          }	
				}
			}
      selectGood.count = 1;
      that.opeShopCart(selectGood, 1);

		},
	
		// 购物详情中的 减数
		cartMinusCount: function (event) {
			let data = event.currentTarget.dataset;
			var selectData = that.data.selectData;
      let selectGood = null;
      let menus = that.data.menus;

      let menu = menus.find(function (v) {
        return v.prodclassuid == data.prodclassuid;
      })
      let goodsList = menu.proditems;
      for (var i = 0; i < goodsList.length; i++) {
        if (goodsList[i].exunititems || goodsList[i].flaclassitems) {
          goodsList[i].count = 0;
        }

        if (goodsList[i].produid == data.produid) {
          good = goodsList[i];
        }
      }

			// 已选商品
			for (var i = 0; i < selectData.length; i++) {
	
				// 有扩展单位
				if (data.exprodid) {
					if (selectData[i].exprodid == data.exprodid && selectData[i].prodname == data.prodname && selectData[i].attributes == data.attributes) {
						selectGood = selectData[i];
					}
				}
				// 无扩展单位
				else {
						if(data.attributes){
							if (selectData[i].produid == data.id && selectData[i].prodname == data.prodname && selectData[i].attributes == data.attributes) {
                selectGood = selectData[i];
							}
						}else{
							if (selectData[i].produid == data.id && selectData[i].prodname == data.prodname  && !selectData[i].attributes) {
                selectGood = selectData[i];
							}
						}	
				}	
			}

      selectGood.count = 1;
      that.opeShopCart(selectGood, 2);
		},

  // 购物车详情中清除购物车
  cartClearEvent: function () {
    app.open.tips(that, {
      msg: '您确定要清空购物车吗？',
      noBtn: true,
      yesCallback: function () {
        that.opeShopCart({},3);
      }
    })
  },
  // 显示购物车详情
  showCartDetail: function (event) {

    let total = this.data.total;
    let menus = this.data.menus;
    let selectData = this.data.selectData;
    if (selectData.length > 0) {
      this.setData({
        'cartDetailShow': true
      })
    }
  },
  // 关闭购物车详情
  changeCartDetailShow: function (event) {
    that.setData({
      'cartDetailShow': !that.data.cartDetailShow
    })
  },
  //是否在营业时间内
  judgeTime:function(){
    let store = that.data.store;
    let stbusiness = String(store.stbusiness).split(":");//营业开始时间
    let endbusiness = String(store.endbusiness).split(":");//营业截止时间
    let nowDate = new Date();
    let prvDate = new Date();
    let nextDate = null;
    let hour = nowDate.getHours();
    let mine = nowDate.getMinutes();
    //未设置就餐时间，默认都满足
    if(stbusiness == "undefined" || endbusiness == "undefined" ){
      return true;
    }
    //营业时间是当天
    if(stbusiness[0] < endbusiness[0]){
      nextDate = new Date();
    }
    //隔天
    else{
      nextDate = new Date(prvDate.getTime() + 1 * 24 * 60 * 60 * 1000);//+1天 
    }

    nowDate.setHours (hour);
    nowDate.setMinutes (mine);
    prvDate.setHours (stbusiness[0]);
    prvDate.setMinutes (stbusiness[1]);
    nextDate.setHours (endbusiness[0]);
    nextDate.setMinutes (endbusiness[1]);
    if (nowDate.getTime () - prvDate.getTime () >= 0 && nowDate.getTime () - nextDate.getTime () <= 0) {
      return true;
    }

    return false;
  },
  // 去结算
  gotoSettlement: function (event) {
    // console.log('结算')
    let selectData = that.data.selectData;
    let store = that.data.store;
    let total = that.data.total;
    let isAuthor = that.data.isAuthor;
    let str = '';
    if (store.state != 0) {
      str = '该门店已经停止营业了，去其它门店看看吧！';
      that.tips(str);
      return false;
    }
    
    let isOpened = that.judgeTime();
    if(!isOpened){
      str = '该门店还未营业，去其它门店看看吧！';
      that.tips(str);
      return false;
    }



    if (selectData.length > 0) {
      let isTakeOrder = that.data.isTakeOrder;
      app.globalData.selectData = selectData;
      app.globalData.total = total;
      //外卖未满足起送价
      if(!isTakeOrder){
        return false;
      }

      if (isAuthor) {//已经授权
        wx.navigateTo({
          url: './home/placeOrder/placeOrder?eatType=' + that.data.eatType
        })
      }else{
        wx.navigateTo({
          url: './authorize/authorize?eatType=' + that.data.eatType
        })
      } 

    }
    else {
      str = '请先选择好商品再操作！'
      that.tips(str);
    }
  },
  gotoSelectStore: function (event) {

    wx.navigateTo({
      url: './home/selectStore/selectStore',
    })
  },
  //搜索
  searchGood:function(){
    wx.navigateTo({
      url: './home/searchGood/searchGood?storeuid='+that.data.store.storeuid,
    })
  }



})


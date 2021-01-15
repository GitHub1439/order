
let common = require('../../../utils/common.js');
let util = require('../../../utils/util.js');
let numList = new Array(26);
const app = getApp();
let that = null;

Page({
	/**
	* 页面的初始数据
	*/
	data: {
    theme:app.globalData.extConfig.theme,//主题色
    eatway: 0,//0店内，1打包，2外卖
    showRemark: false,//显示备注
    paytype:0,//0会员卡，1微信
    isShow: false,//预约时间框
    bespeakActive: false,//设置预约时间
    exit: '取消',
    numList: numList,//食堂可选人数
    choosed: false,//选择外送则true,
    numactive: 1,//选中就餐人数
    numberPepole: 1,//就餐人数
		isScroll: true,
		startTime: '11:00',
		endTime: '21:00',
		timeType: 0,  	// 取餐时间， 0立即取餐，1预定取餐

		timeIndex: [0, 0],

		lookMore: null,   // 0 无max-height类， 1有max-height类
    remarks: '',
    
    showOk: false,//加载完成后才可结算
    isTakeOrder: true,//是否满足外卖起送
    orderBtnTitle:'结算',//结算按钮文本
    roderColor:app.globalData.extConfig.theme.major,//结算按钮背景
    cardsources:"",//券来源0微信卡券，1微信商家券，2甩手优惠券
    eatIn:false,
	cardInfoList:[]
	},

	/**
	* 生命周期函数--监听页面加载
	*/
	onLoad: function (options) {
    that = this;
    console.log(app.globalData.selectData)
    //0、自取，1外卖
    that.setData({
      eatType: options.eatType,
      eatway: options.eatType
    });
    //判断是否在配送范围内
    if(options.eatType == 1){
      let selectAddress = wx.getStorageSync('selectAddress') ? JSON.parse(wx.getStorageSync('selectAddress')) : null;//选中地址
      if (selectAddress){
        that.getAddress(selectAddress.adrsuid);
      }
    }

    that.dataInit();
	},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    let selectAddress = wx.getStorageSync('selectAddress')?JSON.parse(wx.getStorageSync('selectAddress')):null;//选中地址
  
    let selectGrantitemIndex = app.globalData.selectGrantitemIndex;//优惠券切中返回
    if(typeof(selectGrantitemIndex) != "undefined"){
        that.computeTotal(selectGrantitemIndex);
    }
    that.setData({
      selectAddress:selectAddress,
    });
    //app.ruiposLogin();//登录获取code
  },
  //组件tips
	tips: function(msg,callback){
		app.open.tips(that, {
			msg: msg,
      yesCallback: callback
		})
	},
  dataInit: function () {
    let store = app.globalData.store;
    let selectData = app.globalData.selectData;
    let total = app.globalData.total;
    let tablecode = app.globalData.tablecode;

    //是否开启预约下单
    let preorder = store.use_preorder ? store.use_preorder : 0;
    let bespeak = (preorder != 0) ? true : false;

    //派送方式排序
    let ispkgMoney = 0;//套餐总金额
    let eatingway = String(store.eatingway).split(',').sort();//门店设置就餐方式
    let goodDetail = [];//就餐详情商品
    let isOwn = false,
      isTakeout = false,
      isBale = false;
    //0、自取，1、配送，2、打包
    if (eatingway.indexOf('0') != -1 || eatingway.indexOf('2') != -1) {
      isOwn = true;
    }
    if (eatingway.indexOf('1') != -1) {
      isTakeout = true;
    }
    if (eatingway.indexOf('2') != -1) {
      isBale = true;
    }

    if (eatingway.indexOf('0') != -1) {
      that.setData({
        eatIn: true
      });
    }

    //初始渲染就餐方式
    let useMealfee = store.use_mealfee;//是否启用堂食餐位费0不启用，1启用
    let typeTitle="";
    if (eatingway.indexOf('0') != -1) {//自取
      typeTitle = "餐位";
      goodDetail = store.mealfeeproditems.length == 0 ? [] : store.mealfeeproditems;
    } else {
      if (eatingway.indexOf('1') != -1) {//配送
        typeTitle = "配送";
        goodDetail = store.distributionfeeproditems.length == 0 ? [] : store.distributionfeeproditems;
        goodDetail = goodDetail.concat(store.packingfeeproditems);
      } else {//打包带走
        typeTitle = "打包";
        goodDetail = store.packingfeeproditems.length == 0 ? [] : store.packingfeeproditems;
      }
    }

    for (var i = 0; i < selectData.length; i++) {
      if (selectData[i].ispkg == 1) {
        ispkgMoney += (selectData[i].price * selectData[i].count);
      }
    }


    that.setData({
      isOwn: isOwn,
      isTakeout: isTakeout,
      isBale: isBale,
      goodDetail: goodDetail,
      typeTitle: typeTitle,
      ispkgMoney: ispkgMoney,
      store: store,
      bespeak: bespeak,//是否开启预约下单
      useMealfee: useMealfee,
      tablecode: tablecode,
      total: total,
      selectData: selectData
    });
    that.getMemInfoByBill();

  },
  //判断当前地址是否可配送
  getAddress: function (adrsuid='') {
    var reqData = {
      sessionid: app.globalData.sessionid,
      entvesion: app.globalData.extConfig.entvesion,
      entcode: app.globalData.extConfig.entcode,
      storeuid: app.globalData.store.storeuid,
      adrsuid: adrsuid,
      extappid: app.globalData.extConfig.extappid
    }
    app.req({
      that: that,
      url: '/newwxa/user/getReceivingAddress',
      data: reqData,
      success: function (data) {
        let item = data.items[0];
        if (item.issenddistance != 0){
          that.tips("抱歉，目前该地址附近无可配送门店，暂时无法配送",function(){
            wx.removeStorageSync('selectAddress');//清除选中地址
            that.setData({
              selectAddress: null
            });
            
          })
        }
      }
    })
  },
  //切换就餐方式
  changeEeatType:function(e){
    let type = e.currentTarget.dataset.type;
    let eatingway = that.data.store.eatingway
    let eatway = type == 1?1:0;
    if(eatingway.indexOf("2") != -1 && eatingway.indexOf("0") == -1 && e.currentTarget.dataset.type == 0){
      type = 2
      eatway = type
      that.setData({
        eatway: eatway,
        eatType: type
      });
    }
   
    let selectAddress = that.data.selectAddress;
    that.setData({
      eatway: eatway,
      eatType: type
    });
    
    if(type == 1 && selectAddress == null){
      that.setAddress();
    }
    that.changeOrderTitle();
    that.getGoodDetail();
  },
  //跟换结算按钮提示
  changeOrderTitle:function(){
    let eatType = that.data.eatType;//0自取，1外卖
    let roderColor= app.globalData.extConfig.theme.major;
    let orderBtnTitle = "结算";
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
      orderBtnTitle = "结算";
    }
    that.setData({
      orderBtnTitle:orderBtnTitle,
      roderColor:roderColor,
      isTakeOrder: isTakeOrder
    });
  },
  //切换店内、带走
  changeEatWay:function(){
    if(that.data.store.eatingway.indexOf('0') != -1 && that.data.store.eatingway.indexOf('2') != -1){

    }else{
      return
    }
    let eatway = that.data.eatway==2?0:2;
    that.setData({
      eatway:eatway
    });
    that.getGoodDetail();
  },
  //显示隐藏备注
  isShowRemark:function(){
    let showRemark = that.data.showRemark?false:true;
    that.setData({
      showRemark: showRemark
    });
  },

  //切换支付方式
  changePayType:function(e){
    let paytype = e.currentTarget.dataset.paytype;
    that.setData({
      paytype: paytype
    });
  },
  //设置收货地址
  setAddress:function(){
    wx.navigateTo({
      url: '../../address/addressList/addressList?type=payorder'
    })
  },
	//组件预约时间
  chooseTime: function (that, option) {
    that.setData({
      title: option.title,
      days: option.days,
      times: option.times,
      value: option.value
    });
    //选择时间值
    that.bindChange = option.bindChange;
    //确定
    that.yesCallback = option.yesCallback;
    //取消
    that.exitCallback = option.exitCallback;
  },

  //计算金额
  computeTotal:function(selectGrantitemIndex){
    let eatway = that.data.eatway;//就餐方式
    let numberPepole = that.data.numberPepole;//就餐人数,0加菜
    let disrate = that.data.disrate?that.data.disrate : 1;//会员折扣率
    let grantitems = that.data.grantitems;//所有的券
    let goodDetail = that.data.goodDetail;//就餐方式携带商品
    let balance = that.data.balance ? that.data.balance:0;//会员余额
    let couponDiscount = that.data.couponDiscount;//优惠券优惠金额；
    let ispkgMoney = that.data.ispkgMoney;//套餐总金额
    let orderTotalMoney = that.data.total.money;//支付金额
    let detailTotal = 0;//就餐方式自带商品总计;
    let discount = 0;//合计优惠
    let memberPay = true;//能否会员余额支付
    let store = that.data.store;//门店信息
    let allDiscount = 0; //折扣前餐位费或者配送费和餐盒费合计金额
	let cardInfoList = that.data.cardInfoList; //储值卡数组
    // console.log(store)

    //就餐方式自带商品总计
    if (goodDetail.length > 0) {
      for (var i = 0; i < goodDetail.length; i++) {
        if(goodDetail[i].produid == -10 && store.distributionfee_produids && store.distributionfee_produids == -10 && store.logisticsfeediscount == 0){ //配送费商品为-10 勾选为0 不勾选为1
          allDiscount += goodDetail[i].price;
        }else if(goodDetail[i].produid == -20 && store.packingfee_produids && store.packingfee_produids == -20 && store.packingfeediscount == 0){  //打包费商品为-20 勾选为0 不勾选为1
          allDiscount += goodDetail[i].price;
        }else if(goodDetail[i].produid != -20 && goodDetail[i].produid != -10 && store.mealfee_produids != "" && store.mealfeediscount == 0){
          allDiscount += goodDetail[i].price;
        }
        detailTotal += goodDetail[i].price;
      }
    } 
  
    if (eatway == 0 && goodDetail.length > 0) {//店内就餐
      detailTotal = Math.round(util.accMul(detailTotal * numberPepole, 100)) / 100;
      allDiscount = Math.round(util.accMul(allDiscount * numberPepole, 100)) / 100;
    }
    
    if (typeof(selectGrantitemIndex) != "undefined" && grantitems && grantitems.length>0){//选择优惠券后返回
      let grantitem = null;
      grantitem = grantitems[selectGrantitemIndex];
      couponDiscount = grantitem.allmoney;
      that.setData({
        grantitem: grantitem,
        couponDiscount: couponDiscount
      });
    }
    let omoney = orderTotalMoney + detailTotal;
    omoney =Math.round(util.accMul(omoney, 100)) / 100;
    discount = (Number(orderTotalMoney - ispkgMoney) + allDiscount) * (1 - disrate);//会员优惠
    discount = parseFloat((Math.round(util.accMul(discount, 100)) / 100) + couponDiscount).toFixed(2) ;
    orderTotalMoney = Number(orderTotalMoney) + detailTotal  - discount;
    orderTotalMoney = Math.round(util.accMul(orderTotalMoney, 100)) / 100;
    // memberPay = (balance - orderTotalMoney) >= 0 ? true : false;
	let canPay = []
	for(let i = 0;i < cardInfoList.length;i++){
		if(cardInfoList[i].balance - orderTotalMoney >= 0){
			canPay.push(i)
		}else{
			cardInfoList[i].disable = true
		}
	}
	let scarduid = ""
	let wxCardId = ""
	if(canPay.length >= 1){
		for(let i = 0;i < cardInfoList.length;i++){
			cardInfoList[i].check = false
		}
		cardInfoList[canPay[0]].check = true
		scarduid = cardInfoList[canPay[0]].scarduid
		wxCardId = cardInfoList[canPay[0]].wx_card_id ? cardInfoList[canPay[0]].wx_card_id : ""
	}else{
		memberPay = false
	}
    that.setData({
      showOk: true,
      detailTotal: detailTotal,
      orderTotalMoney: orderTotalMoney,
      discount: discount,
      balance: balance,
      memberPay: memberPay,
      omoney: omoney,//原价
      paytype: memberPay ? 0 : 1,
	  scarduid:scarduid,
	  cardInfoList:cardInfoList,
	  wxCardId: wxCardId
    });

  },
  //就餐方式自带商品
  getGoodDetail:function(){
    let store = that.data.store;
    let eatway = that.data.eatway;
    let goodDetail = [];
    let typeTitle = "";
    if (eatway == 0) {//自取
      typeTitle = "餐位";
      goodDetail = store.mealfeeproditems ? store.mealfeeproditems : [];
    } 
    else if (eatway ==1) {//配送
      typeTitle = "配送";
      let packingfeeproditems = store.packingfeeproditems ? store.packingfeeproditems:[];
      goodDetail = store.distributionfeeproditems ? store.distributionfeeproditems : [];
      goodDetail = goodDetail.concat(packingfeeproditems);
    } 
    else {//打包带走
      typeTitle = "打包";
      goodDetail = store.packingfeeproditems ? store.packingfeeproditems : [];
    }
     
    that.setData({
      typeTitle: typeTitle,
      goodDetail: goodDetail
    });

    that.computeTotal();
  },
  //选择就餐人数
  choosedNumber: function(e){
    let index = e.currentTarget.dataset.index;//点击下标
    let numactive = index;
    let numberPepole = index;
  
    that.setData({
      numactive: numactive,
      numberPepole: numberPepole
    });

    that.computeTotal();
  },

  //设置预约时间
  setBespeak:function(){
    var store = that.data.store;
    var bespeakActive = that.data.bespeakActive ? false: true;
    var isShow = that.data.bespeakActive ? false : true;
    var orderTime = '现在';
    var days = [];
    var times = [];
    var nextTimes = [];
    var curdate = new Date();
    var curYear = curdate.getFullYear();
    var curmonth = curdate.getMonth()+1;
    var curDay = curdate.getDate();
    var curHour = curdate.getHours();
    var curMinute = curdate.getMinutes();

    //设置数据
    var spaceDays = store.orderdays;//设置的天数
    var spaceMinute = store.orderintervaltime;//间隔时间
    var startTime = store.stbusiness;
    var endTime = store.endbusiness;
    var startHour = Number(startTime.split(":")[0]);
    var startMinute = Number(startTime.split(":")[1]);
    var endHour = Number(endTime.split(":")[0]);
    var endMinute = Number(endTime.split(":")[1]);
    
    //日期
    if (spaceDays != 0){
      for (var i = 0; i < spaceDays; i++) {
        var date = new Date(curdate.getTime() + i * 24 * 3600 * 1000);
        curYear = date.getFullYear();
        curmonth = (date.getMonth() + 1 < 10) ? ("0" + (date.getMonth() + 1).toString()) : date.getMonth()+1;
        curDay = (date.getDate() < 10) ? ("0" + date.getDate().toString()) : date.getDate();
        var today = curYear + "-" + curmonth + "-" + curDay;
        if(i == 0){
          today = "今日";
        }else if(i == 1){
          today = "明日";
        }
        days.push(today);
      }
    }else {

      //当前时间超出营业时间
      if (curHour > endHour) {
        that.tips('当天营业时间结束,不能预约下单');
        return false;
      } else if (curHour == endHour) {
        if (curMinute + spaceMinute >= endMinute) {
          that.tips('当天营业时间结束,不能预约下单');
          return false;
        }
      }

      var today = '今日';
      days.push(today);
    }
      
    //当天当前时间到当天关闭
    for(var i= 0;;i++){
      curMinute += spaceMinute;
      var timeArr = [];
      var nextHour = curHour + Math.floor(curMinute / 60);
      var nextMinute =  curMinute%60;
      timeArr[0] = (nextHour < 10) ? ("0" + nextHour.toString()) : nextHour;
      timeArr[1] = (nextMinute < 10) ? ("0" + nextMinute.toString()) : nextMinute;
      if (nextHour == endHour){
        if (nextMinute > endMinute){
          break;
        }
      } else if (nextHour > endHour){
        break;
      }
      times.push(timeArr);
    }

    //隔天时间
    for (var i = 0; ; i++) {
      startMinute += spaceMinute;
      var timeArr = [];
      var nextHour = startHour + Math.floor(startMinute / 60);
      var nextMinute = startMinute % 60;
      timeArr[0] = (nextHour < 10) ? ("0" + nextHour.toString()) : nextHour;
      timeArr[1] = (nextMinute < 10) ? ("0" + nextMinute.toString()) : nextMinute;
      if (nextHour == endHour) {
        if (nextMinute > endMinute) {
          break;
        }
      } else if (nextHour > endHour) {
        break;
      }
      nextTimes.push(timeArr);
    }

    //设置多天但当天营业时间已过,不设置今天日期
    if((curHour > endHour || (curHour == endHour && (curMinute + spaceMinute >= endMinute))) && spaceDays != 0) {
        days.splice(0,1);
        times = nextTimes;
      }


    that.chooseTime(that, {
      title: "请选择预约取餐时间",
      days: days,
      times: times,
      value: (times.length >= 5)? [0,2]: [0,0],
      bindChange: function (e) {
        var val = e.detail.value;
        if(val[0] > 0){
          that.setData({
            times:nextTimes,
            value: val
          });
        }else{
          that.setData({
            times: times,
            value: val
          });
        }
      },
      yesCallback: function () {
        var val = that.data.value;
        var day = (that.data.days)[val[0]];
        var time = (that.data.times)[val[1]];
        var orderTime = day + " " + time[0] + ":" + time[1];

        that.setData({
          orderTime: orderTime,
          isShow: false
        })
      },
      exitCallback: function () {
        that.setData({
          isShow: false
        })
      }
    });

    that.setData({
      bespeakActive: bespeakActive,
      isShow: isShow,
      orderTime: orderTime
    });
  },

  //备注
	bindTextareaInput: function(e){
		that.setData({
			remarks:e.detail.value.length>20 ? e.detail.value.substring(0, 20) : e.detail.value,
		})
	},
	bindTextareaBlur: function(e) {
		that.setData({
			remarks:e.detail.value.length>20 ? e.detail.value.substring(0, 20) : e.detail.value,
		})
	},
	// 根据单据信息获取会员和卡券信息
	getMemInfoByBill:function(){
    let items = [];
    let selectData = that.data.selectData;
    let produidonlineitems = [];
		for( var i=0;i<selectData.length>0;i++ ){
			let good = selectData[i];
      let json = {};
      let json2 = {}

			json.produid = good.exprodid ? good.exprodid : good.produid;
			json.dealpri = good.price;
      json.amount = good.amount ? good.amount : good.count;
      //商家券商品参数  营销活动新加
      json2.produid = good.exprodid ? good.exprodid : good.produid;
			json2.price = good.price;
      json2.amount = good.amount ? good.amount : good.count;
      json2.prodcode = good.prodcode;
			json2.prodname = good.prodname;

      items.push(json);
      produidonlineitems.push(json2);
		}
    let reqData = {
			sessionid: app.globalData.sessionid,
			entvesion: app.globalData.extConfig.entvesion,
			entcode: app.globalData.extConfig.entcode,
			extappid: app.globalData.extConfig.extappid,

			storeuid: that.data.store.storeuid,
      produiditems: JSON.stringify(items),
      wxaopenid:wx.getStorageSync("wx_openid"),
      produidonlineitems:JSON.stringify(produidonlineitems)
		}
		app.req({
			that: that,
			url: '/newwxa/user/getMemInfoByBill',
			loading: true,
			data: reqData,
			success: function(data){
				if( data.code==0 ){
          let items = data.items;
          let grantitems = data.items.grantitems ?data.items.grantitems: [];//优惠券列表
          app.globalData.grantitems = grantitems;//优惠券列表

          //存在优惠券
          if (grantitems.length>0 && grantitems[0].allmoney){
            let allmoney;
            let grantitem = null;
              grantitem = grantitems[0];
              allmoney = grantitem.allmoney;
              let cardsources = grantitem.cardsources
            that.setData({
              hasCoupon: true,
              noCoupon: false,
              grantitem: grantitem,
              couponDiscount: allmoney,
              cardsources:cardsources
            });
          } else{
            that.setData({
              noCoupon: true,
              couponDiscount:0
            });
          }

          //存在会员
          if (items.memitems && items.memitems.length > 0){
            let disrate = items.memitems[0].discount;//会员折扣率
            if(disrate == 100 || disrate == 0){
              disrate = 1;
            }else{
              // 会员折扣率除100
              disrate = Number(disrate)/100;
            }
			let cardInfoList = items.memitems[0].cardInfoList
			for(let i = 0;i < cardInfoList.length;i++){
				cardInfoList[i].check = false
				cardInfoList[i].disable = false
				cardInfoList[i].hideScarduid = cardInfoList[i].scarduid.substring(cardInfoList[i].scarduid.length-4)
			}
			cardInfoList[0].check = true
            that.setData({
              memitem: items.memitems[0],
              wxCardId: items.memitems[0].cardInfoList[0].wx_card_id?items.memitems[0].cardInfoList[0].wx_card_id:'',//微信卡id
              scarduid: cardInfoList[0].scarduid,
              // balance: items.memitems[0].balance,//会员余额
              disrate: disrate,
			  cardInfoList:cardInfoList
            })
          }

          that.setData({
            grantitems: grantitems
          });
          
          that.getGoodDetail();
				}
			}
		})
	},
	changeScard:function(e){
		let dataset = e.currentTarget.dataset
		if(dataset.disable){
			return
		}
		let index = dataset.index
		let cardInfoList = that.data.cardInfoList
		for(let i = 0;i < cardInfoList.length;i++){
			cardInfoList[i].check = false
		}
		cardInfoList[index].check = true
		that.setData({
		  cardInfoList: cardInfoList,
		  scarduid:cardInfoList[index].scarduid,
		  wxCardId: cardInfoList[index].wxCardId ? cardInfoList[index].wxCardId : ""
		});
	},

  //优惠券
  toCoupon:function(){
    wx.navigateTo({
      url: '../../coupon/coupon?come=payOrder'
    })
  },
  //扫一扫
  gotoScan:function(e){
    wx.scanCode({
      onlyFromCamera: true,
      success: function (res) {
        console.log(res)
          var result = res.path;
  
          // var arr = result.split('&');
  		  var arr = result.substring(result.indexOf("?")+1)
  		  var arrs = arr.split("&")
          if (arr && arrs.length > 1) {
            var storeuid = arrs[0].split("=")[1];
            var tablecode = arrs[1].split("=")[1];
          console.log(storeuid)
  		  console.log(tablecode)
            wx.showToast({
              title: '桌号已添加成功,可以下单',//提示文字
              duration: 2000,//显示时长
              mask: true,//是否显示透明蒙层，防止触摸穿透，默认：false  
              icon: 'success', //图标，支持"success"、"loading"  
              success: function () {
                var store = that.data.store;
                var typeDetail = that.data.typeDetail;
                var numberPepole = that.data.numberPepole;
                store.storeuid = storeuid;
                that.setData({
                  tablecode: tablecode,
                  store: store,
                  typeDetail: typeDetail,
                  numberPepole: numberPepole
                });
               },//接口调用成功
              fail: function () { },  //接口调用失败的回调函数  
              complete: function () { } //接口调用结束的回调函数  
            })
          
          }
          else {
           that.tips('二维码有误，请扫正确的小程序二维码！',function(){
              that.gotoScan();
            });
          }
      }
    })
  },
	toAddOrderBill: function(e){
    let showOk = that.data.showOk;//showOk加载完成
    let isTakeOrder = that.data.isTakeOrder;
    let payAgain = that.data.payAgain;//避免重复支付
    let wxCardId = that.data.wxCardId? that.data.wxCardId:'';//微信卡id
    let loginCode = wx.getStorageSync('loginCode');//登录code
    let scarduid = that.data.scarduid ? that.data.scarduid:'';
    let paytype = that.data.paytype;//支付方式
    let eatingActive = that.data.eatway;//就餐方式
    let goodDetail = that.data.goodDetail;//就餐商品
    let useMealfee = that.data.useMealfee;//是否启用堂食餐位费
    let numberPepole = that.data.numberPepole;//堂食就餐人数
    let numactive = that.data.numactive;//是否选择了就餐人数
    let bespeakActive = that.data.bespeakActive;//是否选择预约下单
    let orderTime = that.data.orderTime;//预约取餐时间
    let selectAddress = that.data.selectAddress;//收货地址
    let remarks    = that.data.remarks;
    let selectData = that.data.selectData;
    let total      = that.data.total;
    let items = [];
		for( var i=0;i<selectData.length>0;i++ ){
      let good = selectData[i];
      let json = {};
      if (good.pkgitems){
        json.pkgitems = good.pkgitems;//套餐商品
      }
      json.ispkg = good.ispkg ? good.ispkg : 0;//是否是套餐
			json.produid  = good.exprodid ? good.exprodid : good.produid;
			json.prodclassuid = good.prodclassuid;
			json.prodname = good.prodname;
			json.unit 	  = good.unit;
			json.amount   = good.amount ? good.amount : good.count;
			json.dealpri  = good.price;
      json.attributes = good.attributes ? good.attributes : ''; 
      json.prodtype = 0;//普通商品
			items.push(json);
		}

		var smdcdiscounts = [{
			name:'促销活动说明',
			depri:5
    }];
    //showOk加载完成
    if(!showOk){
      return;
    }
    //外卖满足起送
    if(!isTakeOrder){
      return;
    }
    //选择堂食但没选择就餐人数
    if (eatingActive == 0 && numactive === '' && useMealfee == "1") {
      that.tips("请选择堂食就餐人数");
      return;
    }
    //选择外卖但没选择地址
    if (eatingActive == 1 && !that.data.selectAddress) {
      that.tips("请先选择外送地址");
      return;
    }

    //预约下单未选取餐时间
    if (bespeakActive && orderTime == '- -'){
      that.tips("请设置取餐时间");
      return;
    }

    //点餐模式,2没有桌台重新桌台扫码
    if (that.data.store.orderpattern == "2" && eatingActive == 0 && !that.data.tablecode) {
      that.tips("请扫描桌台二维码", function () {
        that.gotoScan();
      });
      return;
    }

    //避免重复提交
    if (payAgain) {
      return;
    } else {
      that.setData({
        payAgain: true
      })
    }

    //预约下单今日明日日期处理
    if (bespeakActive ){
      if (orderTime.indexOf("今日") != -1 || orderTime.indexOf("明日") != -1){
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth()+1;
        month = (month < 10) ? "0" + month : month;
        let day = date.getDate();
        day = (orderTime.indexOf("明日") != -1) ? (day+1): day;
        day = (day < 10) ? "0" + day : day;
        orderTime = year + '-'+ month + "-" + day + " " + (orderTime.split(" "))[1];
      }
    }
    //将就餐商品添加到普通商品里
    if (goodDetail.length > 0){
      for (let i = 0; i < goodDetail.length > 0; i++) {
        let good = goodDetail[i];
        let json = {};
        json.ispkg = 0;
        json.produid = good.produid;
        json.prodclassuid = good.prodclassuid;
        json.prodname = good.prodname;
        json.unit = good.unit;
        json.amount = (eatingActive == 0) ? numberPepole : 1;//堂食数量为就餐人数其他为1
        json.dealpri = good.price;
        json.attributes = good.attributes ? good.attributes : '';
        json.prodtype = (eatingActive == 0) ? 1:
                        (eatingActive == 2)?2:3;//1堂食，2配送，3打包
        items.push(json);
      }
    }

    let data = {
			sessionid: app.globalData.sessionid,
      code: loginCode,
      scarduid: scarduid,
      wx_card_id: wxCardId,
			entvesion: app.globalData.extConfig.entvesion,
			entcode: app.globalData.extConfig.entcode,
			extappid: app.globalData.extConfig.extappid,
			storeuid: that.data.store.storeuid,
			storename: that.data.store.storename,
			customeruid: app.globalData.customeruid,
      orderway: bespeakActive? 2: 1,
      orderdate: orderTime,
			remarks: remarks,
			tablecode: that.data.tablecode,
			eatingway: eatingActive,
      paytype: paytype,
      pnum:(eatingActive == 0)?numberPepole:1,
			items: items,
      needpaytotal: that.data.orderTotalMoney,
      mealfeediscount: that.data.store.mealfeediscount,//餐位费是否允许折扣 0表示允许 1表示不允许
      packingfeediscount: that.data.store.packingfeediscount,//打包费是否允许折扣 0表示允许 1表示不允许
      logisticsfeediscount: that.data.store.logisticsfeediscount//配送费是否允许折扣 0表示允许 1表示不允许
		}
    //填写配送地址
    if (eatingActive == 1){
      data.mobileno = selectAddress.mobileno;
      data.consignee = selectAddress.consignee;
      data.deliverygeo = selectAddress.longitude + ','+ selectAddress.latitude;
      data.deliverypoiaddress = selectAddress.address;
    }

		// 有会员
		if( that.data.memitem ){
			let memitem = that.data.memitem;
			data.memid = memitem.memid;
			if( memitem.vclastcardno ){
				data.vclastcardno = memitem.vclastcardno;
			}
			
			let smdcdiscounts = [];
			
      let memjson = {};
      let discount = that.data.discount;//总优惠
      let couponDiscount = that.data.couponDiscount;//券优惠
     
			memjson.depri   = parseFloat(that.data.discount - that.data.couponDiscount).toFixed(2);
      memjson.discode = 1;	// discode	1会员折扣，2代金券，3折扣券
      
      
      
			// 会员折扣--折扣率
			memjson.disrate = memitem.discount;
      smdcdiscounts.push(memjson);

			// 有卡券
			if( that.data.hasCoupon ){
        //选择使用优惠券
        var noCoupon = that.data.noCoupon;
        if (!noCoupon){
          var grantitem = that.data.grantitem;

          var couponjson = {};
          
          couponjson.name    = grantitem.usenote ? grantitem.usenote : '';
          couponjson.depri   = that.data.couponDiscount;
          couponjson.mbno    = grantitem.gdcode;
          couponjson.card_id = grantitem.card_id;
          couponjson.kqtype  = grantitem.kqtype;
          couponjson.kqtitle = grantitem.kqtitle;

          if( grantitem.kqtype==1 && grantitem.cardsources == 0){
            couponjson.discode = 2;
            // 代金券--代金券额度
            couponjson.reduce_cost = grantitem.reduce_cost;
          }
          else if( grantitem.kqtype==2 && grantitem.cardsources == 0){
            couponjson.discode = 3;
            // 折扣券--折扣率
            couponjson.alimit = grantitem.alimit;
          }

          if(grantitem.kqtype == 1 && that.data.cardsources == 1){
            couponjson.discode = 5;
            couponjson.reduce_cost = grantitem.reduce_cost;
          }else if(grantitem.kqtype == 2 && that.data.cardsources == 1){
            couponjson.discode = 6;
            couponjson.alimit = grantitem.alimit;
          }

          smdcdiscounts.push(couponjson);
        }
			}
			data.smdcdiscounts = smdcdiscounts;
    }
    console.log(data)
    // return
		//门店自取和外卖配置，点击“结算” 先弹窗 订阅消息提醒，再进行后续动作。(202008营销工具迭代修改)
		//订阅消息
		let eatway = that.data.eatway;//就餐方式
		let tmplIds = eatway == 1? app.globalData.extConfig.dytemplatewm:app.globalData.extConfig.dytemplate;
		// wx.requestSubscribeMessage({
		//   tmplIds: tmplIds,
		//   success(res) {
		//     console.log(res);
		//   },
		//   fail(res) {
		//     console.log(res);
		//   },
		//   complete() {
			  app.req({
			    that: that,
			    url: '/newwxa/bill/addOrderBill',
			    loading: true,
			    data: JSON.stringify(data),
			    success: function (data) {
			      app.globalData.buid = data.buid;
			      app.globalData.buidIsCreate = true;
			  
			      if (paytype == 1) {//调起微信支付
			        wx.requestPayment({
			          'timeStamp': data.timeStamp,
			          'nonceStr': data.nonceStr,
			          'package': data.package,
			          'signType': data.signType,
			          'paySign': data.paySign,
			          success: function (res) {
			            that.paySuccessAlert(data.buid);
			          },
			          fail: function (res) {
			            that.payFailAlert({msg:"支付已取消"});
			          }
			        })
			      } else {
			        that.paySuccessAlert(data.buid);
			      }
			    },
			    successFail: function (res) {
			      that.payFailAlert(res);
			    }
			  })   
		    
		//   }
		// });
    
    
	},

  // 支付成功提示
  paySuccessAlert: function (buid) {
    //避免多次支付
    that.setData({
      payAgain: false
    })

    that.tips("支付成功",function(){
      let pages = getCurrentPages();
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].route == 'pages/home/storeIndex/storeIndex') {
          pages[i].opeShopCart({}, 3);
        }
        if (pages[i].route == 'pages/index') {
          pages[i].opeShopCart({}, 3);
        }
      }
      app.globalData.selectData = null;
      app.globalData.selectGrantitemIndex = 0;//选择优惠券下标清空
	  wx.redirectTo({
	    url: '../../order/orderDetail/orderDetail?buid='+buid
	  })
      // //订阅消息
      // let eatway = that.data.eatway;//就餐方式
      // let tmplIds = eatway == 1? app.globalData.extConfig.dytemplatewm:app.globalData.extConfig.dytemplate;
      // wx.requestSubscribeMessage({
      //   tmplIds: tmplIds,
      //   success(res) {
      //     console.log(res);
      //   },
      //   fail(res) {
      //     console.log(res);
      //   },
      //   complete() {
      //     wx.redirectTo({
      //       url: '../../order/orderDetail/orderDetail'
      //     })
      //   }
      // });

    })

  },
  // 支付失败提示
  payFailAlert: function (res) {
    //避免多次支付
    that.setData({
      payAgain: false
    })
    that.tips(res.msg)
  }
 
})
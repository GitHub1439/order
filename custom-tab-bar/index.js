const app = getApp();
let that = null;
Component({
  data: {
    tabbarShow: true,
    selected: 0,
    color: "#9c9c9c",
    selectedColor: "#FF553E",
    tabbarList: []
  },
  lifetimes: {
    attached: function() {
      console.log(22)
      // 在组件实例进入页面节点树时执行
      that = this;
      that.setData({
        tabbarList: app.globalData.tabbarData
      })
    },
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({url});
    }
  }
})
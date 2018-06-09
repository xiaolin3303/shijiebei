// components/personaltab/personaltab.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    currentTab: {
      type: Number,
      value: -1
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    _clickTab: function (e) {
      const { currenttab } = e.currentTarget.dataset;
      this.triggerEvent("switchTab", { currenttab })
    }
  }
})

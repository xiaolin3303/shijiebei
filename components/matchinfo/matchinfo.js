// components/matchinfo/matchinfo.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    group: {
      type: Object,
      value: {}
    },
    answerId: {
      type: Number,
      value: -100
    },
    disabled: {
      type: Boolean,
      value: false
    },    
    forecastScore: {
      type: Number,
      value: 0
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
    _selectAnswer: function (e) {
      const { answer_id, disabled } = e.currentTarget.dataset;
      if (disabled === 'true') {
        return
      }
      this.triggerEvent("selectAnswer", { answer_id })
    }
  }
})

//index.js
//获取应用实例
const Host = require("../../../config/host.config");
const username = wx.getStorageSync('username');
const app = getApp();

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    teamInfo: [],
    battleId: 0,
    battleList : []
  },
  //事件处理函数
  bindVote: function() {

    wx.showToast({
        title: '成功',
        icon: 'succes',
        duration: 1000,
        mask:true
    })
  },

  onLoad: function () {
    const url = `${Host.service}/GetGroupInfo`;
    wx.request({
      url,
      method: 'get',
      data: {
        userId: username,
        battleId: 0
      },
      success: (res) => {
        if (res.data.ret == -102) {
          wx.showToast({
            title: '您没有权限，请联系管理员开通',  //标题  
            width: 200,
            icon: 'success',  //图标，支持"success"、"loading"  
            mask: false,  //是否显示透明蒙层，防止触摸穿透，默认：false  
          })
        }
        // console.log(res.data.data)
        this.setData({
          teamInfo: res.data.data
        })
      }
    })

    const battleUrl = `${Host.service}/GetBattleInfo?`;
    wx.request({
      url:battleUrl,
      method: 'get',
      data: {
        groupId:9115,
      },
      success: (res) => {
        this.setData({
            battleList: res.data.data
        })
        if (res.data.ret == -102) {
          wx.showToast({
            title: '您没有权限，请联系管理员开通',  //标题  
            width: 200,
            icon: 'success',  //图标，支持"success"、"loading"  
            mask: false,  //是否显示透明蒙层，防止触摸穿透，默认：false  
          })
        }
        // console.log(res.data.data)
      }
    })
  },

  gotoTopic :function(e){

    const { status } = e.currentTarget.dataset
    if (status == 1) {    
      wx.navigateTo({
        url: `../topic/topic?battleId=${this.data.battleId}`
      })
    }
  },
  gotoRnak: function(e){
    wx.navigateTo({
      url: `../../rank/rank`
    })
  }
})

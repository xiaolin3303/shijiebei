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

  onLoad: function (opt) {

    const {groupId} = opt;
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
          teamInfo: res.data.data,
          groupId
        })
      }
    })

    const battleUrl = `${Host.service}/GetBattleInfo?`;
    wx.request({
      url:battleUrl,
      method: 'get',
      data: {
        groupId,
      },
      success: (res) => {
        // res.data.data.push({
        //   battle_desc: '两牙之争',
        //   battle_id: 1,
        //   status: 2,
        //   picture: "http://yyb.gtimg.com/fibadcms_img/adcms/91ebdb3ff81fd0e3b70af866b5640d951528362644269391.png",
        //   begin_time: '2018-06-06 12:00:00',
        //   deadline: '2018-06-14 21:00:00'
        // });
        res.data.data = res.data.data.map(battle => {
          const { begin_time, deadline } = battle
          let startDate = new Date(begin_time);
          let endDate = new Date(deadline);
          let displayEndTime = `${endDate.getFullYear()}/${endDate.getMonth()+1}/${endDate.getDate()}`;
          let displayStartEndTime = `${startDate.getFullYear()}/${startDate.getMonth()+1}/${startDate.getDate()}-${endDate.getMonth()+1}/${endDate.getDate()}`;
        
          return Object.assign({}, battle, {
            displayEndTime,
            displayStartEndTime
          });
        });
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
    if (status == 1 || status == 2) {    
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

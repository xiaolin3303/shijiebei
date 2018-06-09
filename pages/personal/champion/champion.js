//index.js
//获取应用实例

const app = getApp();
const getData = require("../../../model/dataModel");
const testData = require("../../../test/testData");
const championList  = require("../../../test/championList");
const sepcTime = require("../../../config/specTimeConfig");
const username = wx.getStorageSync('username')

Page({
  data: {
    selectData: {},
    currentTab: 1,
    championData : [],
    selectChampion: null,
    isChampionResTime : +new Date() > sepcTime.CHAMPION_RES_TIME,
    // isChampionResTime: true,
    championResData :{}
  },
  onLoad:function(e) {

    wx.request({

      url: 'https://yybopworldcup2018147.sparta.html5.qq.com/ajax/GetChampionList',
      data: {
        user_id: username
      },
      method : 'get',
      success: (res)=> {
        if(res.data.ret == -102){
            wx.showToast({
              title: '您没有权限，请联系管理员开通',  //标题
              width : 200,
              icon: 'success',  //图标，支持"success"、"loading"
              mask: false,  //是否显示透明蒙层，防止触摸穿透，默认：false
            })
        }

        //后端数据结构问题，没有语义化
        // res.data.win_team_id = 0
        // res.data.answer_team_id = 1

        this.setData({
          championData: res.data.data,
          result: res.data,
          selectChampion: res.data.answer_team_id,
          win_user_id: res.data.win_user_id
        })
      }
    })

  },

  championSelect: function (e) {
    const { championid } = e.currentTarget.dataset;
    this.setData({
      selectChampion: championid
    })

  },
  //切换tab,个人赛分类
  switchTab:function(e) {

      const { currenttab: current } = e.detail;
      const url = current == 0 ? '../groupMatches/groupMatches' : (current == 1 ? '../champion/champion' : '../eliminate/eliminate')
      wx.redirectTo({
        url
      })
  },

  voteChampion:function(e){

    const {teamid} = e.currentTarget.dataset;
    const data = {
        team_id : teamid,
        user_id : username
    }

    wx.request({

      url: 'https://yybopworldcup2018147.sparta.html5.qq.com/ajax/InsertChampion',
      method : 'post',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data,
      success: (res)=> {
        if(res.data.ret === 0){
            this.setData({
              selectChampion: teamid
            })
            wx.showToast({
              title: '成功',  //标题
              icon: 'success',  //图标，支持"success"、"loading"
              mask: false,  //是否显示透明蒙层，防止触摸穿透，默认：false
            })
        }else{
            wx.showToast({
              title: res.data.msg || '投票失败',  //标题
              icon: 'none',  //图标，支持"success"、"loading"
              mask: false,  //是否显示透明蒙层，防止触摸穿透，默认：false
            })
        }
      }
    })

  }

})

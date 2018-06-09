//index.js
//获取应用实例

const app = getApp();
const getData = require("../../../model/dataModel");
const testData = require("../../../test/testData");
const championList  = require("../../../test/championList");
const sepcTime = require("../../../config/specTimeConfig");
const username = wx.getStorageSync('username');
const Host = require("../../../config/host.config");

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

   const url = `${Host.service}/GetChampionList`;
    getData(
      url,
      {
        user_id: username
      },
      'get',
      (res) => {
        if(res.ret == -102){
            wx.showToast({
              title: '您没有权限，请联系管理员开通',  //标题
              width : 200,
              icon: 'success',  //图标，支持"success"、"loading"
              mask: false,  //是否显示透明蒙层，防止触摸穿透，默认：false
            })
        }

        this.setData({
          championData: res.data,
          result: res,
          selectChampion: res.answer_team_id,
          win_user_id: res.win_user_id
        })
      }
    );

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
    const url = `${Host.service}/InsertChampion`;

    wx.request({

      url,
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

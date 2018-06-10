//index.js
//获取应用实例
const Host = require("../../../config/host.config");
const username = wx.getStorageSync('username');
const getData = require("../../../model/dataModel");
const app = getApp();
//const username = "carlsonlin";
const token = wx.getStorageSync('token');

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
    const {battleId} = this.data;


    const battleUrl = `${Host.service}/GetBattleInfo`;

    getData(
      battleUrl,
      {
        groupId ,
        userId : username
      },
      'get',
      (res) => {
        res.data = res.data.map(battle => {

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
        const battlefrist = res.data.filter(item => {
            return  item.status == 1
        })
        let  battleId;

        if(battlefrist.length){
            battleId = battlefrist[0].battle_id || 0
        }else{
          const battleSecond = res.data.filter(item => {
              return item.status ==2 
          })

          if(battleSecond.length){
            battleId = battleSecond[battleSecond.length-1].battle_id || 0
          }
          
        }

        this.getGroupInfo(battleId,groupId);

        this.setData({
            battleList: res.data,
        })
        if (res.ret == -102) {
          wx.showToast({
            title: '您没有权限，请联系管理员开通',  //标题  
            width: 200,
            icon: 'success',  //图标，支持"success"、"loading"  
            mask: false,  //是否显示透明蒙层，防止触摸穿透，默认：false  
          })
        }
      }
    );
  },

  getGroupInfo:function(battleId,groupId){

    const url = `${Host.service}/GetGroupInfo`;
    wx.request({
      url,
      method: 'get',
      data: {
        userId: username,
        battleId
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
  },
  gotoTopic :function(e){

    const { status,battleid } = e.currentTarget.dataset
    if (status == 1 || status == 2) {    
      wx.navigateTo({
        url: `../topic/topic?battleId=${battleid}`
      })
    }
  },
  gotoRnak: function(e){
    wx.navigateTo({
      url: `../../rank/rank`
    })
  }
})

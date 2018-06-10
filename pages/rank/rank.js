//index.js
//获取应用实例

const app = getApp();
const rankData  = require("../../test/rankData");
const Host = require("../../config/host.config");
const username = wx.getStorageSync('username');
const token = wx.getStorageSync('token');

Page({
  data: {
    currentTab: 0,
    playerList : [],
    groupList : [],
    battleList : [],
    currentBattle: null,
    username
  },
  onLoad:function(e) {

    wx.request({

      url: 'https://yybopworldcup2018147.sparta.html5.qq.com/ajax/GetPlayerList',
      method : 'get',
      success: (res)=> {
        if(res.data.ret == -102){
            wx.showToast({  
              title: '您没有权限，请联系管理员开通',  //标题  
              width : 200,
              icon: 'success',  //图标，支持"success"、"loading"  
              mask: false,  //是否显示透明蒙层，防止触摸穿透，默认：false  
            })  
            return;
        };
        res.data.data = res.data.data.map((item, index) => Object.assign({}, item, {
          rankIdx: index + 1,
          score : item.score/100,
          avatar: item.avatar
        }));
        let myRank = res.data.data.filter(item => {
            return item.user_id == username 
        })
        myRank = myRank.map(item => Object.assign({}, item, { isMe: true }))
        let playerList = [];

        this.setData({
          playerList : playerList.concat(myRank,res.data.data)
        })
      }
    });

    this.getGroupInfo();

  },

  getBattleInfo:function(){
    const battleUrl = `${Host.service}/GetBattleInfo?`;
    wx.request({
      url:battleUrl,
      method: 'get',
      data: {
        username : username,
        groupId:9283,
      },
      success: (res) => {
        this.getBattleRankData(res.data.data[0].battle_id)
        this.setData({
            battleList: res.data.data,
            currentBattle: res.data.data[0].battle_id
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
  getGroupInfo:function(){

    const groupUrl = `${Host.service}/GetGroupInfo?`;
    wx.request({
      url:groupUrl,
      method: 'get',
      data: {
        userId : username,
      },
      success: (res) => {
        const groupName = res.data && res.data.data && res.data.data[0].groupName;
        app.globalData.groupName = groupName;
        this.getBattleInfo();
      }
    })
  },

  getBattleRankData: function (battleId) {
      const {groupName} = app.globalData;
      const groupRankurl = `${Host.service}/GetGroupRank?battleId=${battleId}`
      
      wx.request({

      url:groupRankurl,
      method : 'get',
      success: (res)=> {
        debugger
        const rankList = res.data.rankList;
        let myGroupRank =   rankList.filter(item => {
            return item.groupName == groupName 
        })
        myGroupRank = myGroupRank.map(item => Object.assign({}, item, { isMyGroup: true }))
        let groupList = [];

        this.setData({
          groupList : groupList.concat(myGroupRank,rankList)
        })
      }
    });
  },

  //切换tab,个人赛分类
  clickTab:function(e) {

      const {current} = e.currentTarget.dataset;
      const {currentTab} = this.data;

      if (currentTab === current) {
        return false;
      } else {
        this.setData({
          currentTab: current
        })
      }
  },
  changeBattle:function(e){

      const {battleid} = e.currentTarget.dataset;
      this.setData({
        currentBattle: battleid
      })

      this.getBattleRankData(battleid);


  },
  globalData: {
    groupName: null,
  }
})

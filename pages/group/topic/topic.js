
//index.js
//获取应用实例
const app = getApp();
const Host = require("../../../config/host.config"); 
const username = wx.getStorageSync('username');

Page({
  data: {
    matchInfo: {},
    pList : [],
    teamInfo : [],
    tabList: [{
      id: 1,
      caption: '第一场',
      status: '竞猜中',
    }, {
      id: 2,
      caption: '第二场',
      status: '竞猜中',
    }, {
      id: 3,
      caption: '第三场',
      status: '竞猜中',
    }, {
      id: 4,
      caption: '第四场',
      status: '竞猜中',
    }],
    currentTab: 1,
    answerList : {
      'selectAnswerId': -1
    },
    groupId : '',
    isChoosed : false

  },

  onLoad: function () {

    const betUrl = `${Host.service}/GetGroupBetList`;
    wx.request({
      url : betUrl,
      method : 'get',
      data :{
        roundsId: 1,
        battleId: 1 ,
        userId : username 
      },
      header: { 
        'content-type': 'application/x-www-form-urlencoded'
      }, 
      success: (res)=> {

        //此处数据最好是后端处理，但是后端没有时间；
        const blist  = res.data.data.bList;
        const pList = res.data.data.qList.map(item => {
          let answerSummary = Object.keys(item.answerSummary).map(key => ({
            answer_id: +key,
            value: item.answerSummary[key]
          }))
          return Object.assign({}, item, {
            selectAnswerId: item.alreadyAnswer,
            answerSummary
          })
        });


        let matchInfo = {}

        blist.map( item => {

          let answerlist = [];
          Object.keys(item.answerSummary).map(key => {

              const answer = {
                  answe_describe : item.answerSummary[key],
                  answer_id : +key
              }
              answerlist.push(answer);

          });

          matchInfo = {
              answerlist,
              itemId: item.itemId,
              team_name1 : item.team1,
              team_name2 : item.team2,
              group_id : item.scheduleGroup,
              selectAnswerId: item.alreadyAnswer
          }
        })

        this.setData({
          matchInfo,
          pList
        })
      }
    })

    const groupUrl = `${Host.service}/GetGroupInfo`;

    wx.request({
      url : groupUrl,
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

        this.setData({
          teamInfo: res.data.data,
          groupId : res.data.data[0].groupId
        })
      }
    })
  },

  selectMatchAnswer: function (e) {
    const { answer_id } = e.detail;
    let matchInfo = Object.assign({}, this.data.matchInfo, {
      selectAnswerId: answer_id
    })

    this.setData({ matchInfo })
  },

  selectPList: function (e) {
    const { answer_id, item_id } = e.currentTarget.dataset;
    let pList = this.data.pList.map(item => {
      if (item.itemId === item_id) {
        return Object.assign({}, item, {
          selectAnswerId: +answer_id
        })
      } else {
        return item
      }
    })

    this.setData({ pList })
  },

  selectTab: function (e) {
    return;
    const { tabid } = e.currentTarget.dataset;
    this.setData({
      currentTab: tabid
    })
  },

  getUserInfo: function(e) {

    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  createGroup: function(e){
    wx.navigateTo({
      url: '../join/join'
    })
  },
  submitAnswer:function(e){
    const { matchInfo, pList } = this.data
    let answerList = [{
      itemId: +matchInfo.itemId,
      answerId: +matchInfo.selectAnswerId,
      type: 0
    }];

    pList.forEach(item => {
      answerList.push({
        itemId: +item.itemId,
        answerId: +item.selectAnswerId,
        type: 1
      })
    });
    const data = {
      groupId : this.data.groupId,
      battleId : 1,
      userId : username,
      answerList: JSON.stringify({ answerList })
    }
    const url = `${Host.service}/GroupMakeBet`
    wx.request({
      url ,
      method: 'post',
      header: { 
        'content-type': 'application/x-www-form-urlencoded'
      }, 
      data,
      success: (res) => {
        console.log('xuxu',res)
      }

    })
  }
})

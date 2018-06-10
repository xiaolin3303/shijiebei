
//index.js
//获取应用实例
const app = getApp();
const Host = require("../../../config/host.config"); 
const username =   '';
const getData = require("../../../model/dataModel");

Page({
  data: {
    matchInfo: {},
    pList : [],
    bPlist :[],
    teamInfo : [],
    currentTab: 1,
    status: -1,
    answerList : {
      'selectAnswerId': -1
    },
    groupId : '',
    isChoosed : false,
    isAlive : true,
    battleId : '',
    battleInfo: []
  },

  onLoad: function (opt) {

    const {battleId} = opt ;
    this.setData({
      battleId
    })
    this.getGroupBetList(battleId ,1,-1);
    this.getGroupInfo();

  },

  getGroupBetList: function(battleId,roundsId,status){

    const betUrl = `${Host.service}/GetGroupBetList?`;
    getData(
      betUrl,
      {
        userId: username,
        battleId,
        roundsId
      },
      'get',
      (res) => {
        const blist  = res.data.bList;
        const battleInfo = res.data.battleInfo;
        const pList = res.data.qList.map(item => {
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
        let bPlist = [];

        blist.map( item => {

          if(item.isBet == 1 ){

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
                selectAnswerId: item.alreadyAnswer,
                correctAnswer: item.correctAnswer
            }
          }else if (item.isBet == 0 ){

            let answerSummary  = Object.keys(item.answerSummary).map(key => ({
              answer_id: +key,
              value: item.answerSummary[key]
            }))
            bPlist.push(Object.assign({}, item, {
              selectAnswerId: item.alreadyAnswer,
              answerSummary
            }))
          }
         
        })
        let currentTab ;
        let currentStatus;

        
        if(status == -1){

          const currentRound = battleInfo.filter(item => {
             return item.status == 1 ;
          })
          currentTab = currentRound[0].rounds;
          currentStatus = currentRound[0].status ;
        }else {
          [currentTab,currentStatus] = [roundsId,status];
        }

        debugger
        this.setData({
          bPlist,
          matchInfo,
          pList,
          battleInfo,
          currentTab,
          status : currentStatus  
        })
      }
    );
  },

  getGroupInfo:function(){

    const groupUrl = `${Host.service}/GetGroupInfo?`;
    getData(
      groupUrl,
      {
        userId: username,
      },
      'get',
      (res) => {
        if (res.ret == -102) {
          wx.showToast({
            title: '您没有权限，请联系管理员开通',  //标题  
            width: 200,
            icon: 'success',  //图标，支持"success"、"loading"  
            mask: false,  //是否显示透明蒙层，防止触摸穿透，默认：false  
          })
        }

        const teamInfo = res.data;
        const mystatus = teamInfo[1].filter(item => {
            return item.userId == username
        })

        this.setData({
          teamInfo,
          groupId : teamInfo[0].groupId,
          isAlive : mystatus[0].is_alive == 1
        })
      }
    );
  },

  selectMatchAnswer: function (e) {
    const { answer_id } = e.detail;
    let matchInfo = Object.assign({}, this.data.matchInfo, {
      selectAnswerId: answer_id
    })

    this.setData({ matchInfo })
  },

  selectPList: function (e) {
    const { answer_id, item_id, disabled } = e.currentTarget.dataset;
    if (disabled === 'true') {
      return
    }
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

    const { roundsid ,status} = e.currentTarget.dataset;
    const { battleId } = this.data;

    if( status == 0){
      return 
    }
    this.getGroupBetList(battleId,roundsid,status);
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

    // if(!matchInfo ||  !matchInfo.itemId){
    //   wx.showToast({
    //     title: '请先竞猜淘汰题',
    //     icon: 'none',  //图标，支持"success"、"loading"
    //     mask: false,  //是否显示透明蒙层，防止触摸穿透，默认：false
    //   })
    //   return
    // }

    if(substatus == 2 ){
      return
    }

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
          if(res.data.ret == 0){
            wx.showToast({
              title: '恭喜！提交成功',
              icon: 'none',  //图标，支持"success"、"loading"
              mask: false,  //是否显示透明蒙层，防止触摸穿透，默认：false
            })
          }else{
            wx.showToast({
              title: res.data.msg,
              icon: 'none',  //图标，支持"success"、"loading"
              mask: false,  //是否显示透明蒙层，防止触摸穿透，默认：false
            })
          }
      }

    })
  }
})

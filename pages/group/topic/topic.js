
//index.js
//获取应用实例
const app = getApp();
const Host = require("../../../config/host.config"); 
const username = wx.getStorageSync('username');
const getData = require("../../../model/dataModel");
const token = wx.getStorageSync('token');
//const username ="carlsonlin"

const formatTime = v => {
  return v < 10 ? `0${v}` : v
}

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
    battleInfo: [],
    matchDeadLine: ''
  },

  onLoad: function (opt) {

    const {battleId} = opt ;
    this.setData({
      battleId
    })
    this.getGroupBetList(battleId, 1, -1);
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
        // blist[0].alreadyAnswer = 0;
        // blist[0].alreadyAnswer = -1;
        // blist[0].correctAnswer = -1;

        // blist[1].alreadyAnswer = 0;
        // blist[1].alreadyAnswer = 1;
        // blist[1].correctAnswer = -1;
        const battleInfo = res.data.battleInfo;

        // res.data.qList[0].alreadyAnswer = 0;
        // res.data.qList[0].alreadyAnswer = 1;
        // res.data.qList[0].correctAnswer = -1;

        const pList = res.data.qList.map(item => {
          let answerSummary = Object.keys(item.answerSummary).map(key => ({
            answer_id: +key,
            value: item.answerSummary[key]
          }))
          let actualScore = 0;
          let matchAnswer = item.alreadyAnswer
          if (item.correctAnswer > -1) {
            // 结束状态
            if (item.correctAnswer === item.alreadyAnswer) {
              // 并回答正确            
              actualScore = +item.itemScore;
            }
          } else {          
            if (answerSummary.filter(answer => answer.answer_id === item.alreadyAnswer).length) {
              actualScore = +item.itemScore;
            }
          }
          return Object.assign({}, item, {
            selectAnswerId: item.alreadyAnswer,
            answerSummary,
            actualScore
          })
        });

        let matchInfo = {}
        let bPlist = [];

        let matchDeadLine = new Date(+res.data.answerDeadLine * 1000);
        matchDeadLine = `${matchDeadLine.getFullYear()}-${formatTime(matchDeadLine.getMonth() + 1)}-${formatTime(matchDeadLine.getDate())} ${formatTime(matchDeadLine.getHours())}:${formatTime(matchDeadLine.getMinutes())}`;
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
                correctAnswer: item.correctAnswer,
                actualScore: 0,
                itemScore: item.score,
            }
            if (item.correctAnswer > -1) {
              // 结束状态
              if (item.correctAnswer === item.alreadyAnswer) {
                // 并回答正确            
                matchInfo.actualScore = +item.score;
              }
            } else {          
              if (answerlist.filter(answer => answer.answer_id === item.alreadyAnswer).length) {
                matchInfo.actualScore = +item.score;
              }
            }

          }else if (item.isBet == 0 ){

            let answerSummary  = Object.keys(item.answerSummary).map(key => ({
              answer_id: +key,
              value: item.answerSummary[key]
            }))
            let actualScore = 0;
            if (item.correctAnswer > -1) {
              // 结束状态
              if (item.correctAnswer === item.alreadyAnswer) {
                // 并回答正确            
                actualScore = +item.itemScore;
              }
            } else {          
              if (answerSummary.filter(answer => answer.answer_id === item.alreadyAnswer).length) {
                actualScore = +item.itemScore;
              }
            }

            bPlist.push(Object.assign({}, item, {
              selectAnswerId: item.alreadyAnswer,
              answerSummary,
              actualScore
            }))
          }
         
        })
        let currentTab ;
        let currentStatus;

        
        if(status == -1){
          const currentRound = battleInfo.filter(item => {
             return item.status == 1 ;
          })

          currentTab = currentRound.length ? currentRound[0].rounds : 1;
          currentStatus = currentRound.length&&  currentRound[0].status || battleInfo[currentTab-1].status;


          if (currentTab !== roundsId) {
            this.getGroupBetList(battleId, currentTab, currentStatus)
            return
          }
        }else {
          [currentTab,currentStatus] = [roundsId,status];
        }

        this.setData({
          bPlist,
          matchInfo,
          pList,
          battleInfo,
          currentTab,
          status : currentStatus,
          matchDeadLine
        })
      }
    );
  },

  getGroupInfo:function(){

    const groupUrl = `${Host.service}/GetGroupInfo?`;
    const {battleId} = this.data ;

    getData(
      groupUrl,
      {
        userId: username,
        battleId
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
      selectAnswerId: answer_id,
      actualScore: this.data.matchInfo.itemScore
    });

    this.setData({ matchInfo })
  },

  selectBPList: function (e) {
    const { answer_id, item_id, disabled, score } = e.currentTarget.dataset;
    if (disabled === 'true') {
      return
    }
    let bPlist = this.data.bPlist.map(item => {
      if (item.itemId === item_id) {
        return Object.assign({}, item, {
          selectAnswerId: +answer_id,
          actualScore: +score
        })
      } else {
        return item
      }
    })

    this.setData({ bPlist })
  },

  selectPList: function (e) {
    const { answer_id, item_id, disabled, score } = e.currentTarget.dataset;
    if (disabled === 'true') {
      return
    }
    let pList = this.data.pList.map(item => {
      if (item.itemId === item_id) {
        return Object.assign({}, item, {
          selectAnswerId: +answer_id,
          actualScore: +score
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

    const {substatus} = e.currentTarget.dataset;
    if(substatus == 2 ){
      return
    }

    const { matchInfo, pList, bPlist } = this.data;
    const isMatchAnswerValid = +matchInfo.selectAnswerId > -1;
    const isBplistAnswerValid = bPlist.reduce((acc, item) => {
      return acc && +item.selectAnswerId > -1
    }, true)
    if(!isMatchAnswerValid || !isBplistAnswerValid){
      wx.showToast({
        title: '请先竞猜淘汰题',
        icon: 'none',  //图标，支持"success"、"loading"
        mask: false,  //是否显示透明蒙层，防止触摸穿透，默认：false
      })
    }

    let answerList = [{
      itemId: +matchInfo.itemId,
      answerId: +matchInfo.selectAnswerId,
      type: 0
    }];

    bPlist.forEach(item => {
      answerList.push({
        itemId: +item.itemId,
        answerId: +item.selectAnswerId,
        type: 0
      })
    });

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

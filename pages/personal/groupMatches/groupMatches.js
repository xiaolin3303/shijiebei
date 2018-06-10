//index.js
//获取应用实例

const app = getApp();
const getData = require("../../../model/dataModel");
const testData = require("../../../test/testData");
const championList  = require("../../../test/championList");
const sepcTime = require("../../../config/specTimeConfig");
const Host = require("../../../config/host.config");
const username = wx.getStorageSync('username');
const token = wx.getStorageSync('token');

Page({

  data: {
    currentTab: 0,
    quizRes : {},
    forecastScore : 0,
    groupListData : [],
    selectData: {},
    totalScore: 0,
    myAnwser : '',
    isCorrect : '',
    banGroupList: [],
    lastBanGroup: {},
    displayBanGroup: [],
    showMoreBanGroup: false,
    hasUndergoing : false
  },

  onLoad:function(e) {
    this.getGroupListData();
  },

  onPullDownRefresh: function (e) {
    this.getGroupListData(() => {
      wx.stopPullDownRefresh()
    });
  },

  getGroupListData(finishCb) {

    const url = `${Host.service}/GetBetList?`;
    getData(
      url,
      {
        user_id: username
      },
      'get',
      (res) => {
        finishCb && finishCb()
        if (res.ret == -102) {
          wx.showToast({
            title: '您没有权限，请联系管理员开通',  //标题
            width: 200,
            icon: 'success',  //图标，支持"success"、"loading"
            mask: false,  //是否显示透明蒙层，防止触摸穿透，默认：false
          })
        }


        // res.data.data[1].ban_play = 1
        // res.data.data[0].player_answer_id = 99
        // res.data.data[0].win_team = 99

        let quizres = Object.assign({}, this.data.quizRes);
        let hasUndergoing = false;

        const groupRes = res.data.map(group => {
          const answerlist = group.answerlist.map(answer => Object.assign({}, answer, { odd: +answer.odd / 100}))
          return Object.assign({}, group, { answerlist })
        });
        groupRes.forEach(group => {
          let matchAnswer = group.answerlist.filter(answer => answer.answer_id === group.player_answer_id)
          
          matchAnswer = matchAnswer.length ? matchAnswer[0] : null
          if (group.player_answer_id > 0) {
            // 用户之前选择过该答案
            quizres = Object.assign(quizres, {
              [group.item_id]: {
                answerid: group.player_answer_id,
                forecastScore: group.ban_play === 1
                               ? (group.player_answer_id === group.win_team ? Math.round(100 * (matchAnswer ? +matchAnswer.odd : 0)) : 0)
                               : (Math.round(100 * (matchAnswer ? +matchAnswer.odd : 0)) || 0),
                closed: group.ban_play === 1
              }
            });
          }
          if(group.ban_play == 0){
              hasUndergoing = true
          }
        })

        const totalScore = Object.keys(quizres).reduce((acc, groupId) => {
          const quiz = quizres[groupId];
          return acc + (quiz.forecastScore && quiz.closed !== true ? quiz.forecastScore : 0)
        }, 0)
        const banGroupList = groupRes.filter(group => group.ban_play === 1);
        const lastBanGroup = banGroupList.length ? banGroupList[banGroupList.length  - 1] : {}
        const displayBanGroup = [lastBanGroup]
        console.log(groupRes)
        this.setData({
          quizRes: quizres,
          totalScore : totalScore,
          groupListData: groupRes,
          banGroupList,
          lastBanGroup,
          displayBanGroup,
          hasUndergoing
        })
      }
    );

  },

  //切换tab,个人赛分类
  switchTab:function(e) {

      const { currenttab: current } = e.detail;
      const url = current == 0 ? '../groupMatches/groupMatches' : (current == 1 ? '../champion/champion' : '../eliminate/eliminate')
      wx.redirectTo({
        url
      })
  },

  handleQuizResult:function(e) {

      const { odd, itemid, answerid, lockanswer } = e.currentTarget.dataset;

      if (lockanswer) {
        return false
      }

      let quizres = Object.assign({}, this.data.quizRes, {
        [itemid]: {
          answerid,
          forecastScore: Math.ceil(100 * odd)
        }
      })

      const groupRes = this.data.groupListData.map(group => {

        if (group.item_id !== itemid) {
          return group
        }

        group.player_answer_id = 0
        return group
      })

      const totalScore = Object.keys(quizres).reduce((acc, groupId) => {
        const quiz = quizres[groupId];
        return acc + (quiz.forecastScore && quiz.closed !== true ? quiz.forecastScore : 0)
      }, 0)

      this.setData({
        groupListData: groupRes,
        quizRes : quizres,
        totalScore
      })

  },
  showMoreBanGroup: function () {
    this.setData({
      displayBanGroup: this.data.banGroupList,
      showMoreBanGroup: true
    });
  },
  hideBanGroup: function () {
    this.setData({
      displayBanGroup: [this.data.lastBanGroup],
      showMoreBanGroup: false
    });
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  clearSelect:function(e){

      const groupRes = this.data.groupListData.map(group => {

        if (group.ban_play !== 1){
          group.player_answer_id = 0
        }

        return group

      })

      // quizRes需要保留close=true的数据
      let filterQuizRes = {}
      Object.keys(this.data.quizRes).forEach(itemId => {
        if (this.data.quizRes[itemId].closed === true) {
          filterQuizRes[itemId] = this.data.quizRes[itemId]
        }
      })

      console.log(filterQuizRes)

      this.setData({
        groupListData: groupRes,
        selectData : [],
        quizRes : filterQuizRes,
        totalScore: 0
      })

  },

  submitGroupRes:function(e){
    // let getGroupListData = this.getGroupListData
    let answerList = [];
    const { quizRes } = this.data;
    // 过滤掉close=true的结果
    answerList = Object.keys(quizRes).filter(key => !quizRes[key].closed).map(key=>{
        let item ={
            item_id : +key,
            answer_id : quizRes[key].answerid
        }
        return item
    });

    // const groupRes = this.data.groupListData.map(group => {
    //   if (group.player_answer_id !== 0) {
    //     answerList.push({
    //       item_id: parseInt(group.item_id),
    //       answer_id: group.player_answer_id
    //     })
    //   }
    // })

    const url = `${Host.service}/InsertBet?`;
    wx.request({
      url,
      method: 'post',
      data: {
        user_id: username,
        answerList: JSON.stringify(answerList)
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
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

        if (res.data.ret == 0) {
          wx.showToast({
            title: "成功",
            icon: 'success',  //图标，支持"success"、"loading"
            mask: false,  //是否显示透明蒙层，防止触摸穿透，默认：false
          })
          wx.redirectTo({
            url: '/pages/personal/groupMatches/groupMatches'
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',  //图标，支持"success"、"loading"
            mask: false,  //是否显示透明蒙层，防止触摸穿透，默认：false
          })
        }

      }
    })

  },
  intelligentSelect:function(e){
      let mydata = this.data
      const quizRes = this.data.quizRes


    const url = `${Host.service}/GetIntellRst?`;
    getData(
      url,
      {
        username : username
      },
      'get',
      (res) => {
        if(res.data.ret == -102){

          wx.showToast({
                title: '您没有权限，请联系管理员开通',  //标题
                width : 200,
                icon: 'success',  //图标，支持"success"、"loading"
                mask: false,  //是否显示透明蒙层，防止触摸穿透，默认：false
              })
          }

          const intellRst = res.data;
          let quizResVar = {}

          const groupRes = mydata.groupListData.map(group => {

              intellRst.map((intellItem) => {
                const {item_id,answer_id} = intellItem;

                if (group.item_id !== item_id){
                  return false
                }
                if (quizRes[group.item_id] && quizRes[group.item_id].answerid) {
                  return false
                }
                if (group.player_answer_id !== 0) {
                  return false
                }
                if (group.ban_play === 1) {
                  return false
                }

                let currentAnswer = group.answerlist.filter(v => v.answer_id === answer_id)

                if (currentAnswer && currentAnswer[0]) {
                  quizResVar[item_id] = {
                    answerid: answer_id,
                    forecastScore: Math.ceil(100 * currentAnswer[0].odd)
                  }
                }

              })

              return group
          })

          quizResVar = Object.assign({}, this.data.quizRes, quizResVar)

          const totalScore = Object.keys(quizResVar).reduce((acc, groupId) => {
            const quiz = quizResVar[groupId];
            return acc + (quiz.forecastScore && quiz.closed !== true ? quiz.forecastScore : 0)
          }, 0)

          this.setData({
            quizRes: quizResVar,
            totalScore
          });
      }
    );

  }

})

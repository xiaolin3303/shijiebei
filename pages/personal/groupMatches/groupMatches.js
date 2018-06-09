//index.js
//获取应用实例

const app = getApp();
const getData = require("../../../model/dataModel");
const testData = require("../../../test/testData");
const championList  = require("../../../test/championList");
const sepcTime = require("../../../config/specTimeConfig");
const Host = require("../../../config/host.config");
const username = wx.getStorageSync('username');

Page({

  data: {
    currentTab: 0,
    quizRes : {},
    forecastScore : 0,
    groupListData : [],
    selectData: {},
    totalScore: 0,
    myAnwser : '',
    isCorrect : ''
  },

  onLoad:function(e) {
    this.getGroupListData();
  },

  getGroupListData() {
    const url = `${Host.service}/GetBetList?`;
    wx.request({
      url,
      method: 'get',
      data: {
        user_id: username
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


        // res.data.data[1].ban_play = 1
        // res.data.data[0].player_answer_id = 99
        // res.data.data[0].win_team = 99

        let quizres = Object.assign({}, this.data.quizRes)
        const groupRes = res.data.data;
        groupRes.forEach(group => {

          if (group.player_answer_id > 0) {
            // 用户之前选择过该答案
            quizres = Object.assign(quizres, {
              [group.item_id]: {
                answerid: group.player_answer_id,
                forecastScore: 100 * group.answerlist.filter(answer => answer.answer_id === group.player_answer_id)[0].odd
              }
            });
          }
        })
        const totalScore = Object.keys(quizres).reduce((acc, groupId) => {
          return acc + (quizres[groupId].forecastScore || 0)
        }, 0)
        this.setData({
          quizRes: quizres,
          totalScore : totalScore/100,
          groupListData: groupRes,
        })

      }
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

  handleQuizResult:function(e) {

      const { odd, itemid, answerid, lockanswer } = e.currentTarget.dataset;

      if (lockanswer) {
        return false
      }

      let quizres = Object.assign({}, this.data.quizRes, {
        [itemid]: {
          answerid,
          forecastScore: 100 * odd
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
        return acc + (quizres[groupId].forecastScore || 0)
      }, 0)

      this.setData({
        groupListData: groupRes,
        quizRes : quizres,
        totalScore
      })

  },
  clearSelect:function(e){

      const groupRes = this.data.groupListData.map(group => {

        if (group.ban_play !== 1){
          group.player_answer_id = 0
        }

        return group

      })

      this.setData({
        groupListData: groupRes,
        selectData : [],
        quizRes : -1,
        totalScore: 0
      })

  },
  submitGroupRes:function(e){
    // let getGroupListData = this.getGroupListData
    let answerList = [];
    const { quizRes } = this.data;
    answerList = Object.keys(quizRes).map(key=>{
        let item ={
            item_id : parseInt(key),
            answer_id : quizRes[key].answerid
        }
        return item
    });

    const groupRes = this.data.groupListData.map(group => {
      if (group.player_answer_id !== 0) {
        answerList.push({
          item_id: parseInt(group.item_id),
          answer_id: group.player_answer_id
        })
      }
    })

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

        if (res.ret != -1) {
          wx.showToast({
            title: '成功',
            icon: 'success',  //图标，支持"success"、"loading"
            mask: false,  //是否显示透明蒙层，防止触摸穿透，默认：false
          })
          wx.redirectTo({
            url: '/pages/personal/groupMatches/groupMatches'
          })
        } else {
          wx.showToast({
            title: '失败',
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
      wx.request({
        url,
        method : 'get',
        data : {
            username
        },
        success: (res)=> {

            if(res.data.ret == -102){

                wx.showToast({
                  title: '您没有权限，请联系管理员开通',  //标题
                  width : 200,
                  icon: 'success',  //图标，支持"success"、"loading"
                  mask: false,  //是否显示透明蒙层，防止触摸穿透，默认：false
                })
            }

            const intellRst = res.data.data;
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
                      forecastScore: 100 * parseInt(currentAnswer[0].odd)
                    }
                  }

                })

                return group

            })

            quizResVar = Object.assign({}, this.data.quizRes, quizResVar)

            const totalScore = Object.keys(quizResVar).reduce((acc, groupId) => {
              return acc + (quizResVar[groupId].forecastScore || 0)
            }, 0)

            this.setData({
              quizRes: quizResVar,
              totalScore
            });
        }
      })
  }

})

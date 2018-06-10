//index.js
//获取应用实例
const app = getApp();

const Host = require("../../../config/host.config"); 
const username = wx.getStorageSync('username');
// const avatar = wx.getStorageSync('avatar');
// const userInfo = { avatarUrl: avatar}
const userInfo = wx.getStorageSync('userInfo');
const getData = require("../../../model/dataModel");
const sepcTime = require("../../../config/specTimeConfig");

Page({
  data: {
    showGoHomeNavi: false,
    inputValue : '',
    hasCover : false,
    teamList: [],
    teamBase: {},
    userInfo,
    groupName : '',
    groupId : null,
    buttonCnt :"",
    username,
    groupLeader: '',
    isGroupLeader: '',
    isStartTime : +new Date() > sepcTime.GOURP_START_TIME,
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
  onShareAppMessage: function () {
    console.log('share', `/pages/group/index/index?groupId=${this.data.groupId}`)
    return {
      title: '世界杯竞猜',
      desc: '最具人气的小程序开发联盟!',
      path: `/pages/group/index/index?groupId=${this.data.groupId}&groupName=${this.data.groupName}`
    }
  },

  onLoad: function (opt) {
    const { groupId,groupName } = opt
    this.getGroupInfo(groupId,groupName);

    const routes = getCurrentPages();
    if (routes.length === 1) {
      this.setData({
        showGoHomeNavi: true
      })
    }
  },

  onPullDownRefresh: function (e) {
    const { groupId, groupName } = this.data
    this.getGroupInfo(groupId, groupName, () => {
      wx.stopPullDownRefresh()
    });
  },


  getGroupInfo:function(groupId, groupLeader, finishCb){
    let data = {
      userId: username
    }

    if (groupId) {
      data.groupId = groupId
    }

    const url = `${Host.service}/GetGroupInfo?`;
    getData(
      url,
      data,
      'get',
      (res) => {
        
          finishCb && finishCb()
          if(!res.data){

            this.setData({
                buttonCnt : 'invite'
              })
            return 
          }

          // if (res.ret == -102) {
          //   wx.showToast({
          //     title: '您没有权限，请联系管理员开通',  //标题  
          //     width: 200,
          //     icon: 'success', 
          //     mask: false,  
          //   })
          // }


          let teamList  = res && res.data[1];
          let buttonCnt = '';

          if(teamList.length < 4){

            const filterUser = teamList.filter(user => user.userId === username)
            if (!filterUser.length) {
                 teamList.push({
                   userId :  username,
                   avatar : userInfo.avatarUrl
                })
            }

            teamList.length = 4 ;
            buttonCnt = 'join' ;

          }else if(teamList.length == 4){

                const {isStartTime} = this.data;

                wx.showToast({
                  title: isStartTime.toString(),  //标题  
                  width: 200,
                  icon: 'success', 
                  mask: false,  
                })
                if(isStartTime){
                  buttonCnt =  'goanena'
                }else{
                  buttonCnt = 'undergoing'
                }
                
          }else if(teamList.length > 4){
              teamList.length = 4 ;
              buttonCnt = ''
          }

          let teamBase = res && res.data[0];
          let isGroupLeader = (teamBase.groupLeader == username)

          this.setData({
            groupName : teamBase.groupName,
            groupId : teamBase.groupId,
            isGroupLeader ,
            groupLeader,
            teamList,
            teamBase,
            buttonCnt
          })
        })
  },

  inviteFriends: function(e){

     if(!this.data.groupId){

          wx.showModal({  
            title: '提示',  //标题  
            content:'请先输入队名，创建队伍',
            showCancel: false,    
          }) 
     }
  },

  createGroupName: function(e){
      this.setData({
          inputValue : e.detail.value
      })
  },

  confirmGroupName: function(e){

      //TODO 
      const data  = {
         groupName : this.data.inputValue,
         groupLeader : username,
         avatar : userInfo.avatarUrl
      }
      if(this.data.inputValue.length > 5 ){
          wx.showToast({  
            title: '战队名称不能超过5个字符，请重新输入',  
            icon: 'none',   
            mask: false,   
          }) 

          return
      }

      const url = `${Host.service}/makeGroup`;
      wx.request({
        url,
        method : 'post',
        header: { 
          'content-type': 'application/x-www-form-urlencoded'
        }, 
        data,
        success: (res) => {

          res = res.data;
          if(res.ret == '0'){
            const {groupName,groupId} = res.data
            console.log(groupName, groupId)
            wx.showToast({  
              title: groupName,  
              icon: 'success',   
              mask: false,   
            }) 

            this.setData({
              groupName,
              groupId
            })

            this.getGroupInfo(groupId)
          }else{
            wx.showToast({  
              title: res.msg || '创建队伍失败',  //标题  
              icon: 'none',  //图标，支持"success"、"loading"  
              mask: false,   
            }) 
          }
        }
      })
  },

  confirmJoinGroup: function(e){

    const data = {
      groupId : this.data.groupId,
      userId : username,
      avatar : userInfo.avatarUrl
    }
    
    const url = `${Host.service}/joinGroup`;
    wx.request({
        url,
        method : 'post',
        header: { 
          'content-type': 'application/x-www-form-urlencoded'
        }, 
        data,
        success: function(res) {

          if(res.data.ret == 0){

            wx.showToast({  
              title: '加入成功', //标题  
              icon: 'success',  //图标，支持"success"、"loading"  
              mask: false,   
            }) 
          }else{
            wx.showToast({
              title: res.data.msg,  //标题  
              width: 200,
              icon: 'none', 
              mask: false,  
            })
          }
        }
      })
  },
  gotoAnera:function(e){

    const {buttonCnt,groupId} = this.data;

    if(buttonCnt == 'undergoing'){
      return ;  
    }
    wx.navigateTo({
        url: `../arenalist/arenalist?groupId=${groupId}`
    })
  },
  hideCover:function(e){

      this.setData({
        hasCover : false
      })
  },
  gotoStruction: function(e){
    wx.navigateTo({
      url: '../../instruction/instruction'
    })
  },

  goHome: function (e) {
    wx.redirectTo({
      url: '/pages/main/main'
    })
  }
})

//index.js
//获取应用实例
const app = getApp();
const getData = require("../../../model/dataModel");
const Host = require("../../../config/host.config"); 
const username = wx.getStorageSync('username');
// const avatar = wx.getStorageSync('avatar');
// const userInfo = { avatarUrl: avatar}
const userInfo = wx.getStorageSync('userInfo');
const sepcTime = require("../../../config/specTimeConfig");

Page({
  data: {
    inputValue : '',
    hasCover : false,
    teamList: [],
    teamBase: {},
    userInfo,
    groupName : '',
    groupId : null,
    buttonCnt :"invite",
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
  },

  getGroupInfo:function(groupId,groupLeader){
    let params = {
      userId: username
    }

    if (groupId) {
      params.groupId = groupId
    }

    const url = `${Host.service}/GetGroupInfo`;
      wx.request({
        url,
        method: 'get',
        data: params,
        success: (res) => {

          if(!res.data.data){
            return 
          }

          if (res.data.ret == -102) {
            wx.showToast({
              title: '您没有权限，请联系管理员开通',  //标题  
              width: 200,
              icon: 'success', 
              mask: false,  
            })
          }

          let teamList  = res.data && res.data.data[1];
          let buttonCnt = ''

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


                buttonCnt =  'goanena'
       
          }else if(teamList.length > 4){
              teamList.length = 4 ;
              buttonCnt = ''
          }
          let teamBase = res.data && res.data.data[0];
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

        }
      })
  },

  inviteFriends: function(e){

     if(!this.data.groupId){

          wx.showModal({  
            title: '提示',  //标题  
            content:'请先输入队名，创建队伍',
            showCancel: false,    
          }) 

     }else{ 

        this.setData({
          hasCover : true
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
          wx.showToast({
            title: res.data.msg,  //标题  
            width: 200,
            icon: 'success', 
            mask: false,  
          })
          if(res.data.ret == 0){

            wx.showToast({  
              title: '加入成功', //标题  
              icon: 'success',  //图标，支持"success"、"loading"  
              mask: false,   
            }) 
          }
        }
      })
  },
  gotoAnera:function(e){
    wx.navigateTo({
        url: `../arenalist/arenalist`
    })
  },
  hideCover:function(e){

      this.setData({
        hasCover : false
      })
  }
})

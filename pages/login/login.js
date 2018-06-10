// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  getUserInfo: function(e) {
    wx.setStorageSync('userInfo' , e.detail.userInfo);
    this.login(success => {
      if (success) {
        const routes = getCurrentPages();
        if (routes.length > 1) {
          wx.navigateBack({ delta: 1 })          
        } else {
          wx.redirectTo({
            url: '/pages/main/main'
          })
        }
      } else {
        wx.showToast({  
          title: '登录失败',  
          icon: 'success',   
          mask: false,   
        })
      }
    })
  },

  login: function (callback) {
    wx.login({
      success: function(res) {
        if (res.code) {
          //发起网络请求
          wx.request({
            url: 'https://yybopworldcup2018147.sparta.html5.qq.com/ajax/GetRtxByCode',
            method : 'get',
            data: {
              code: res.code
            },
            success: function(res) {
              if(res.data.rtx){
                wx.setStorageSync('username' , res.data.rtx);
                wx.setStorageSync('token',res.data.token);
                callback(true)

                wx.showToast({
                  title: res.data.rtx,  //标题
                  width: 200,
                  icon: 'success',  //图标，支持"success"、"loading"
                  mask: false,  //是否显示透明蒙层，防止触摸穿透，默认：false
                })
              }else{

                wx.showToast({
                  title: '未唤回rtx',  //标题
                  width: 200,
                  icon: 'success',  //图标，支持"success"、"loading"
                  mask: false,  //是否显示透明蒙层，防止触摸穿透，默认：false
                })
                callback(false)
              }

            },
            fail: function () {

                wx.showToast({
                  title: '唤回rtx执行失败',  //标题
                  width: 200,
                  icon: 'success',  //图标，支持"success"、"loading"
                  mask: false,  //是否显示透明蒙层，防止触摸穿透，默认：false
                })
              callback(false)
            }
          });
        } else {
          callback(false)
        }
      },
      fail: () => {
        callback(false)
      }
    });
  }
})
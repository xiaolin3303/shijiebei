//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    console.log('hello')
    let me = this;

    const rtxUsername = wx.getStorageSync('username');
    const userInfo = wx.getStorageSync('userInfo');

    if (!rtxUsername || !userInfo) {    
      // wx.login({
      //   success: function(res) {
      //     if (res.code) {
      //       //发起网络请求
      //       wx.request({
      //         url: 'https://yybopworldcup2018147.sparta.html5.qq.com/ajax/GetRtxByCode',
      //         method : 'get',
      //         data: {
      //           code: res.code
      //         },
      //         success: function(res) {
                
      //         wx.setStorageSync('username' , res.data.rtx);

      //         wx.showToast({  
      //           title: res.data.rtx,  
      //           icon: 'success',   
      //           mask: false,   
      //         }) 
      //         if (me.userInfoReadyCallback) {
      //             me.userInfoReadyCallback(res.data)
      //           }
      //         }
      //       })
      //     } else {
      //       wx.showToast({  
      //         title: '登录失败',  
      //         icon: 'success',   
      //         mask: false,   
      //       })
      //       setTimeout(() => {                
      //         wx.navigateTo({
      //           url: '/pages/login/login'
      //         })
      //       }, 2000)  
      //     }
      //   },
      //   fail: () => {
      //     wx.showToast({  
      //       title: '登录失败',  
      //       icon: 'success',   
      //       mask: false,   
      //     })        
      //     setTimeout(() => {                
      //       wx.navigateTo({
      //         url: '/pages/login/login'
      //       })
      //     }, 2000)
      //   }
      // });
      wx.showToast({  
        title: '即将前往登录页',  
        icon: 'success',   
        mask: false, 
        duration: 2000  
      })
      setTimeout(() => {                
        wx.navigateTo({
          url: '/pages/login/login'
        })
      }, 2000)

    }

    // 获取用户信息
    // if (!userInfo) {    
    //   wx.getSetting({
    //     success: res => {
    //       if (res.authSetting['scope.userInfo']) {
    //         // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //         wx.getUserInfo({
    //           success: res => {
    //             // 可以将 res 发送给后台解码出 unionId
    //             me.globalData.userInfo = res.userInfo;
    //             wx.setStorageSync('userInfo' , res.userInfo);
    //             console.log(res.userInfo)
    //             wx.showToast({  
    //               title: res.userInfo.avatarUrl,  
    //               icon: 'success',   
    //               mask: false,   
    //             }) 

    //             // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //             // 所以此处加入 callback 以防止这种情况
    //             // if (this.userInfoReadyCallback) {
    //             //   this.userInfoReadyCallback(res)
    //             // }
    //           },
    //           fail: () => {
    //             setTimeout(() => {                
    //               wx.navigateTo({
    //                 url: '/pages/login/login'
    //               })
    //             }, 2000)
    //           }
    //         })
    //       } else {
    //         console.log('authorize failed')
    //         setTimeout(() => {                
    //           wx.navigateTo({
    //             url: '/pages/login/login'
    //           })
    //         }, 2000)
    //         // wx.authorize({
    //         //   scope: 'scope.userInfo',
    //         //   success() {
    //         //     wx.getUserInfo({
    //         //       success: res => {
    //         //         // 可以将 res 发送给后台解码出 unionId
    //         //         me.globalData.userInfo = res.userInfo;
    //         //         wx.setStorageSync('userInfo' , res.userInfo);
    //         //         console.log(res.userInfo)
    //         //       }
    //         //     })
                
    //         //   },
    //         //   fail: function () {
    //         //     console.log('authorize failed')
    //         //   }
    //         // })
    //       }
    //     }
    //   })
    // }
  },
  
  globalData: {
    userInfo: null,
    rtxUserInfo: null
  }
})
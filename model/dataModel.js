

module.exports = function getData(url, params, msg, success, fail) {

    wx.showNavigationBarLoading();

    wx.showLoading({
      title: msg || '正在加载' ,
    })
        
    const method = Object.keys(params).length === 0 ? "get" : "post" 

  wx.request({
    url: url,
    data: params,
    header: {
      //'Content-Type': 'application/json'
      'content-type': 'application/x-www-form-urlencoded'
    },
    method,
    success: function (res) {

        wx.hideNavigationBarLoading();
        msg && wx.hideLoading()

        if (res.statusCode == 200) {
            success && success(res.data)

        } else {
            fail && fail()
        }

    },
    fail: function (res) {

        wx.hideNavigationBarLoading();
        msg && wx.hideLoading();
        fail && fail();
    }
  })
}

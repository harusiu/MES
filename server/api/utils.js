
module.exports = {
  extend: function (target, source, flag) {
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        flag ? (target[key] = source[key]) : (target[key] === void 0 && (target[key] = source[key]))
      }
    }
    return target
  },

  // 將'2018-06-25'的字串資料，轉換成'1070625'
  datetoData: function (date) {
    var strs = date.split('-', 3)
    if (strs.length !== 3) {
      console.log('datetoData(): 日期格式錯誤!')
      return date
    }
    // 西元轉換為民國
    var yy = (Number(strs[0])-1911).toString()
    var data = yy + strs[1] + strs[2]

    return data
  }
}

var localStorage = window.localStorage;
var menuMap = {
  countPannel : { key: "1" },
  orderList : { key: "2" },
  businessList : { key: "3" },
  userCenter : { key: "4" }
};
var sessionJs = {
  getMap: function(key) {
    var keyValue = map[key];
    return keyValue;
  },
  setMap: function(key, value) {
    map[key] = value;
  },
  removeMap: function(key) {
    delete map[key];
  },
  getLocalStorage: function(key) {
    return localStorage[key];
  },
  setLocalStorage: function(key, value) {
    localStorage[key] = value;
    window.localStorage = localStorage;
  }
};
var reload = function(pageName){
  if (sessionJs.getLocalStorage(pageName)=="true") { 
    sessionJs.setLocalStorage(pageName,"false");
    window.location.reload();
  }else{
    sessionJs.setLocalStorage(pageName,"true");
  }
}
var ajax = function(url, para, callBack) {
  $.ajax({
    url: "http://192.168.10.241:8051" + url,
    data: para,
    dataType: "json", //数据类型
    type: "get", //请求方式
    timeout: 10000, //请求超时
    async: true,
    cache: false,
    success: function(result) {
      console.log(result);
      if (callBack != null) {
        callBack(result);
      }
    },
    error: function(xhr, ajaxOptions, thrownError, request, error) {
      console.log(
        "xrs.status = " +
          xhr.status +
          "\n" +
          "thrown error = " +
          thrownError +
          "\n" +
          "xhr.statusText = " +
          xhr.statusText +
          "\n" +
          "request = " +
          request +
          "\n" +
          "error = " +
          error
      );
      if (xhr.status == "timeout") {
        alert("超时了");
      }
    }
  });
};
var utilJs = {
  initUploadPic: function(groupId, callBack, message) {
    $("#file").change(function() {
      if ($("#file").val() == "") {
        return false;
      }
      let _this = $(this)[0], _file = _this.files[0], fileType = _file.type;
      if (fileType.indexOf("image") > -1) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(_file);
        fileReader.onload = function(event) {
          var result = event.target.result; //返回的dataURL
          var image = new Image();
          image.src = result;
          image.onload = function() {
            //创建一个image对象，给canvas绘制使用
            var cvs = document.createElement("canvas");
            var scale = 1;
            if (this.width > 1000 || this.height > 1000) {
              //1000只是示例，可以根据具体的要求去设定
              if (this.width > this.height) {
                scale = 1000 / this.width;
              } else {
                scale = 1000 / this.height;
              }
            }
            cvs.width = this.width * scale;
            cvs.height = this.height * scale; //计算等比缩小后图片宽高
            var ctx = cvs.getContext("2d");
            ctx.drawImage(this, 0, 0, cvs.width, cvs.height);
            var newImageData = cvs.toDataURL(fileType, 0.8); //重新生成图片，<span style="font-family: Arial, Helvetica, sans-serif;">fileType为用户选择的图片类型</span>
            var sendData = newImageData.replace(
              "data:" + fileType + ";base64,",
              ""
            );
            $.post(
              "http://120.92.226.217:8020/upload/uploadPhonePic",
              { groupId: groupId, file: sendData },
              function(data) {
                var result = JSON.parse(data);
                if (result.status == "success") {
                  callBack(result);
                } else {
                  message(result.message, 2);
                }
              }
            );
          };
        };
      } else {
        toast("文件格式不正确");
      }
    });
  },
  getMenuKeys: function() {
    var url = window.location.href;
    console.log(url);
    console.log(url.split("#/")[1]);
    var menu = url.split("#/")[1].split("?")[0].split("/")[0];
    return menuMap[menu];
  },
  //数字转换
  float: function(num) {
    return parseFloat(num);
  },
  to2bits: function(flt) {
    if (parseFloat(flt) == flt) {
      return Math.round(flt * 100) / 100;
    } else {
      return 0;
    }
  },
  //去掉字符串头尾空格
  trim: function(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
  },
  Wi: [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1], // 加权因子
  ValideCode: [1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2], // 身份证验证位值.10代表X
  IdCardValidate: function(idCard) {
    idCard = trim(idCard.replace(/ /g, ""));
    if (idCard.length == 15) {
      return isValidityBrithBy15IdCard(idCard);
    } else if (idCard.length == 18) {
      var a_idCard = idCard.split(""); // 得到身份证数组
      if (
        isValidityBrithBy18IdCard(idCard) &&
        isTrueValidateCodeBy18IdCard(a_idCard)
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  },
  /**
   * 判断身份证号码为18位时最后的验证位是否正确
   * @param a_idCard 身份证号码数组
   * @return
   */
  isTrueValidateCodeBy18IdCard: function(a_idCard) {
    var sum = 0; // 声明加权求和变量
    if (a_idCard[17].toLowerCase() == "x") {
      a_idCard[17] = 10; // 将最后位为x的验证码替换为10方便后续操作
    }
    for (var i = 0; i < 17; i++) {
      sum += Wi[i] * a_idCard[i]; // 加权求和
    }
    valCodePosition = sum % 11; // 得到验证码所位置
    if (a_idCard[17] == ValideCode[valCodePosition]) {
      return true;
    } else {
      return false;
    }
  },
  /**
   * 验证18位数身份证号码中的生日是否是有效生日
   * @param idCard 18位书身份证字符串
   * @return
   */
  isValidityBrithBy18IdCard: function(idCard18) {
    var year = idCard18.substring(6, 10);
    var month = idCard18.substring(10, 12);
    var day = idCard18.substring(12, 14);
    var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
    // 这里用getFullYear()获取年份，避免千年虫问题
    if (
      temp_date.getFullYear() != parseFloat(year) ||
      temp_date.getMonth() != parseFloat(month) - 1 ||
      temp_date.getDate() != parseFloat(day)
    ) {
      return false;
    } else {
      return true;
    }
  },
  /**
   * 验证15位数身份证号码中的生日是否是有效生日
   * @param idCard15 15位书身份证字符串
   * @return
   */
  isValidityBrithBy15IdCard: function(idCard15) {
    var year = idCard15.substring(6, 8);
    var month = idCard15.substring(8, 10);
    var day = idCard15.substring(10, 12);
    var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
    // 对于老身份证中的你年龄则不需考虑千年虫问题而使用getYear()方法
    if (
      temp_date.getYear() != parseFloat(year) ||
      temp_date.getMonth() != parseFloat(month) - 1 ||
      temp_date.getDate() != parseFloat(day)
    ) {
      return false;
    } else {
      return true;
    }
  },
  /**
   * 通过身份证判断是男是女
   * @param idCard 15/18位身份证号码
   * @return 'female'-女、'male'-男
   */
  maleOrFemalByIdCard: function(idCard) {
    idCard = trim(idCard.replace(/ /g, "")); // 对身份证号码做处理。包括字符间有空格。
    if (idCard.length == 15) {
      if (idCard.substring(14, 15) % 2 == 0) {
        return "female";
      } else {
        return "male";
      }
    } else if (idCard.length == 18) {
      if (idCard.substring(14, 17) % 2 == 0) {
        return "female";
      } else {
        return "male";
      }
    } else {
      return null;
    }
  },
  //倒计时
  intCC: "",
  countdown: "60"
};

Date.prototype.format = function(format) {
  var o = {
    "M+": this.getMonth() + 1,
    "d+": this.getDate(),
    "h+": this.getHours(),
    "m+": this.getMinutes(),
    "s+": this.getSeconds(),
    "q+": Math.floor((this.getMonth() + 3) / 3),
    S: this.getMilliseconds()
  };
  if (/(y+)/.test(format)) {
    format = format.replace(
      RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
    }
  }
  return format;
};

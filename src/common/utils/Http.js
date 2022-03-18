import Vue from 'vue'
import qs from 'qs'
import Fly from 'flyio/dist/npm/wx'

const fly = new Fly();
fly.config.baseURL = process.env.VUE_APP_API
fly.config.timeout = 3600000


/**
 * 缓存formData请求
 */
let cacheFormData = {}

/**
 * 请求拦截
 */
fly.interceptors.request.use((config) => {
  let mconstant = Vue.prototype.$constant
  let mutils = Vue.prototype.$utils;
  if (process.env.NODE_ENV == 'development') {
    console.log('---[Request]- ' + config.method + ' ---')
    console.log(config.url)
    if (config.method == 'GET') {
      console.log(config.params)
    } else {
      console.log(config.body)
    }
  }

  // 添加时间戳，nonce，请求参数并生成签名 防御攻击
  const nonce = mutils.getGuid();
  const timestamp = mutils.getNowTimestamp();
  let sign = mutils.md5Sign(nonce + timestamp);
  config.headers['Ql-Client-Id'] = mconstant.CATALOG;
  config.headers['Ql-Auth-Timestamp'] = timestamp;
  config.headers['Ql-Auth-Nonce'] = nonce;
  config.headers['Ql-Auth-Sign'] = sign;

  if (config.headers['Content-Type'] && config.headers['Content-Type'].indexOf('multipart/form-data') == 0) {
    cacheFormData = config.data
  }
  let tokenInfo = mconstant.GET_TOKEN() == null ? null : mconstant.GET_TOKEN()
  if (config.url.indexOf(mconstant.API_NSC + 'auth/login') < 0 && tokenInfo) {
    if (config.headers.Authorization == null || config.headers.Authorization == '' ||
      config.headers.Authorization == undefined) {
      config.headers.Authorization = `Bearer ` + tokenInfo
    }
  }
  return config
})

/**
 * 响应拦截
 */
fly.interceptors.response.use(
  (data, promise) => {
    let mconstant = Vue.prototype.$constant
    if (process.env.NODE_ENV == 'development') {
      console.log('---[RESPONSE SUCCESS]- ' + data.request.method + ' ---' + data.request.url)
      console.log(data.data)
    }
    if (data.status && data.status == 200 && data.data.status == 'error') {
      return promise.resolve(data.data.msg)
    }

    if (data.request.url.indexOf(mconstant.API_NSC + 'auth/login') < 0 && data.request.url.indexOf(mconstant.API_NSC + 'auth/refreshToken') < 0) {
      let cacheOldConfig = data.request
      if (mconstant.BIZ_RESPONSE_TOKEN_INVALID_CODE == data.data.code ||
        mconstant.BIZ_RESPONSE_TOKEN_REFRESH_CODE == data.data.code ||
        mconstant.BIZ_RESPONSE_TOKEN_UNKNOWN_CODE == data.data.code ||
        mconstant.BIZ_RESPONSE_TOKEN_BLACKLIST_CODE == data.data.code) {
        return promise.reject('无效的访问令牌,请重新登录申请')
      } else if (mconstant.BIZ_RESPONSE_TOKEN_EXPIRED_CODE == data.data.code) {
        // 刷新token
        return refreshToken().then((res) => {
          if (mconstant.BIZ_RESPONSE_CODE == res.data.code) {
            // 取出最新的token
            if (res.data.data.access_token) {
              // 重新请求
              mconstant.SET_TOKEN(res.data.data.access_token)
              cacheOldConfig.headers.Authorization = `Bearer ` + res.data.data.access_token
              if (cacheOldConfig.headers['Content-Type'] == 'application/json') {
                if (!cacheOldConfig.data) {
                  cacheOldConfig.body = JSON.parse(cacheOldConfig.body)
                } else {
                  cacheOldConfig.data = JSON.parse(cacheOldConfig.data)
                }
              }
              if (Object.keys(cacheFormData).length > 0) {
                cacheOldConfig.data = cacheFormData
                cacheFormData = {}
              }
              return fly.request(cacheOldConfig)
            } else {
              mconstant.CLEAR_ALL();
              return mconstant.showModal('提示', '您长时间未登录了，为了账号安全，请重新登录！', false, '立即登录', succ => {
                uni.navigateTo({ url: "../login/Login" });
              })
            }
          } else {
            mconstant.CLEAR_ALL();
            return mconstant.showModal('提示', '您长时间未登录了，为了账号安全，请重新登录！', false, '立即登录', succ => {
              uni.navigateTo({ url: "../login/Login" });
            })
          }
        }).catch(() => {
          mconstant.CLEAR_ALL();
          return mconstant.showModal('提示', '您长时间未登录了，为了账号安全，请重新登录！', false, '立即登录', succ => {
            uni.navigateTo({ url: "../login/Login" });
          })
        })
      }
    }
    return data
  },
  (err, promise) => {
    let mconstant = Vue.prototype.$constant;
    let cacheOldConfig = null;
    if (process.env.NODE_ENV == 'development') {
      if (err.response) {
        console.log('---[RESPONSE ERROR]- ' + err.response.config.method + ' ---')
        console.log(err)
      }
    }
    err.data = {};
    if (err && err.response) {
      cacheOldConfig = err.response.config;
      err.data.code = err.response.status;
      switch (err.response.status) {
        case 400:
          err.message = '错误的请求'
          break
        case 401:
          err.message = '未授权,请重新登录'
          let bizCode = err.response.data.code
          if (!err.response.data.code) {
            return promise.reject(err.msg)
          }
          if (mconstant.BIZ_RESPONSE_TOKEN_INVALID_CODE == bizCode ||
            mconstant.BIZ_RESPONSE_TOKEN_REFRESH_CODE == bizCode ||
            mconstant.BIZ_RESPONSE_TOKEN_UNKNOWN_CODE == bizCode ||
            mconstant.BIZ_RESPONSE_TOKEN_BLACKLIST_CODE == bizCode) {
            mconstant.CLEAR_ALL();
            return mconstant.showModal('提示', '您长时间未登录了，为了账号安全，请重新登录！', false, '立即登录', succ => {
              uni.navigateTo({ url: "../login/Login" });
            })
          } else if (mconstant.BIZ_RESPONSE_TOKEN_EXPIRED_CODE == bizCode) {
            // 刷新token
            return refreshToken().then((res) => {
              if (mconstant.BIZ_RESPONSE_CODE == res.data.code) {
                // 取出最新的token
                if (res.data.data.access_token) {
                  // 重新请求
                  mconstant.SET_TOKEN(res.data.data.access_token)
                  cacheOldConfig.headers.Authorization = `Bearer ` + res.data.data.access_token
                  if (cacheOldConfig.headers['Content-Type'] == 'application/json') {
                    if (!cacheOldConfig.data) {
                      cacheOldConfig.body = JSON.parse(cacheOldConfig.body)
                    } else {
                      cacheOldConfig.data = JSON.parse(cacheOldConfig.data)
                    }
                  }
                  if (Object.keys(cacheFormData).length > 0) {
                    cacheOldConfig.data = cacheFormData
                    cacheFormData = {}
                  }
                  return fly(cacheOldConfig)
                } else {
                  mconstant.CLEAR_ALL();
                  return mconstant.showModal('提示', '您长时间未登录了，为了账号安全，请重新登录！', false, '立即登录', succ => {
                    uni.navigateTo({ url: "../login/Login" });
                  })
                }
              } else {
                mconstant.CLEAR_ALL();
                return mconstant.showModal('提示', '您长时间未登录了，为了账号安全，请重新登录！', false, '立即登录', succ => {
                  uni.navigateTo({ url: "../login/Login" });
                })
              }
            }).catch(() => {
              mconstant.CLEAR_ALL();
              return mconstant.showModal('提示', '您长时间未登录了，为了账号安全，请重新登录！', false, '立即登录', succ => {
                uni.navigateTo({ url: "../login/Login" });
              })
            })
          }
          break
        case 403:
          err.message = '拒绝访问'
          break
        case 404:
          err.message = '请求错误,未找到该资源'
          break
        case 405:
          err.message = '请求方法未允许'
          break
        case 408:
          err.message = '请求超时'
          break
        case 500:
          err.message = '服务器端出错'
          break
        case 501:
          err.message = '网络未实现'
          break
        case 502:
          err.message = '网络错误'
          break
        case 503:
          err.message = '服务不可用'
          break
        case 504:
          err.message = '网络超时'
          break
        case 505:
          err.message = 'http版本不支持该请求'
          break
        default:
          err.message = `连接错误${err.response.status}`
      }
      err.data.msg = err.message;
    } else {
      err.data = {}
      err.data.code = 408,
        err.data.msg = '连接到服务器失败！！！',
        err.message = '连接到服务器失败！！！'
    }
    return promise.resolve(err)
  }
)


/**
 * 刷新token
 * @param {*} mconstant
 * @param {*} responseData
 */
function refreshToken() {
  return fly.post('/api/nsc/auth/refreshToken?requestType=mobile', {})
}

/**
 * 判断是否为数组
 * @param {*} obj
 */
function isArray(obj) {
  return Object.prototype.toString.call(obj) == '[object Array]'
}

export default {
  install(Vue) {
    Vue.prototype.$mhttp = {
      httpGet: (url, param, contentType) => {
        if (contentType == null || contentType == '' ||
          contentType == 'undefined' ||
          contentType == 'application/json') {
          contentType = 'application/x-www-form-urlencoded'
        }
        if (param) {
          param.v = Math.random(10)
        }
        return fly.request({
          method: 'GET',
          url: url,
          params: qs.stringify(param),
          headers: {
            'Content-Type': contentType
          }
        })
      },

      httpFileGet: (url, param, contentType) => {
        if (contentType == null || contentType == '' ||
          contentType == 'undefined' ||
          contentType == 'application/json') {
          contentType = 'application/x-www-form-urlencoded'
        }
        return fly.request({
          method: 'GET',
          url: url,
          params: qs.stringify(param),
          responseType: 'blob',
          headers: {
            'Content-Type': contentType
          }
        })
      },

      httpPost: (url, param, contentType) => {
        if (contentType == null || contentType == '' || contentType == 'undefined') {
          contentType = 'application/x-www-form-urlencoded'
        }
        if (contentType == 'application/json') {
          param = JSON.stringify(param)
        } else {
          let ret = ''
          for (let it in param) {
            if (isArray(param[it])) {
              for (let arrayLen in param[it]) {
                if (ret == '') {
                  ret += encodeURIComponent(it + '[]') + '=' + encodeURIComponent(param[it][arrayLen])
                } else {
                  ret += '&' + encodeURIComponent(it + '[]') + '=' + encodeURIComponent(param[it][arrayLen])
                }
              }
            } else {
              if (ret == '') {
                ret += encodeURIComponent(it) + '=' + encodeURIComponent(param[it])
              } else {
                ret += '&' + encodeURIComponent(it) + '=' + encodeURIComponent(param[it])
              }
            }
          }
          param = ret
        }
        return fly.request({
          method: 'POST',
          url: url,
          body: param,
          parseJson: false,
          headers: {
            'Content-Type': contentType
          }
        })
      },

      httpFilePost: (url, param, contentType, succ, fail) => {
        contentType = 'multipart/form-data'
        let file = param.file[0];
        delete param['file'];
        return uni.uploadFile({
          url: url,
          name: 'file',
          filePath: file.path,
          formData: param,
          header: {
            'Content-Type': contentType
          },
          success(res) {
            succ(JSON.parse(res.data));
          },
          fail(err) {
            fail(err);
          }
        })
      },

      httpDelete: (url, param, contentType) => {
        if (contentType == null || contentType == '' ||
          contentType == 'undefined' ||
          contentType == 'application/json') {
          contentType = 'application/x-www-form-urlencoded'
        }
        return fly.request({
          method: 'DELETE',
          url: url,
          data: qs.stringify(param),
          headers: {
            'Content-Type': contentType
          }
        })
      }
    }
  }
}


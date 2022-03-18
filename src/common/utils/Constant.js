/**
 * 全局的参数 author by xc
 */
export default {
	install(Vue, options) {
		let STORAGE_PREFIX = 'H5-'
        let TOKEN_INFO_PREFIX = STORAGE_PREFIX + 'tokenInfo'
        let USER_INFO_PREFIX = STORAGE_PREFIX + 'userInfo'

		Vue.prototype.$constant = {
			CATALOG: 10, // 所属系统
			BIZ_RESPONSE_CODE: 10000, // 成功
			BIZ_RESPONSE_TOKEN_INVALID_CODE: 10032, // 无效的TOKEN
		    BIZ_RESPONSE_TOKEN_EXPIRED_CODE: 10033, // TOKEN已过期
			BIZ_RESPONSE_TOKEN_UNKNOWN_CODE: 10034, // TOKEN未知异常
			BIZ_RESPONSE_TOKEN_NOTREFRESH_CODE: 10035, // TOKEN无法刷新
			BIZ_RESPONSE_USER_NOEXIST: 20002, //用户不存在
			
			MD5_SALT: 'abcdefg!@#123321!!!!',
		    TOKEN_INFO_PREFIX: TOKEN_INFO_PREFIX,
			// 基础服务调用前缀
			API_NSC: '/api/nsc/',
			
			/**
			 * 本地存储存值
			 */
			PUT_DATA: (KEY, VALUE) => {
				uni.setStorageSync(KEY, VALUE)
			},
			/**
			 * 本地存储取值
			 */
			GET_DATA: (KEY) => {
				return uni.getStorageSync(KEY)
			},

			
			/**
		   * 设置token
		   */
			SET_TOKEN: (tokenData) => {
			 uni.setStorageSync(TOKEN_INFO_PREFIX, JSON.stringify(tokenData));
			},
			GET_TOKEN: () => {
			   let tokenInfo = uni.getStorageSync(TOKEN_INFO_PREFIX);
			   let jsonTokenInfo = null;
			   if (tokenInfo) {
				 jsonTokenInfo = JSON.parse(tokenInfo);
			   }
			   return jsonTokenInfo;
			},
			 /**
			 * 清除token
			 */
			CLEAR_TOKEN: () => {
				uni.removeStorageSync(TOKEN_INFO_PREFIX);
			},
			/**
			 * 设置用户
			 */
			SET_USER: (userData) => {
				uni.setStorageSync(USER_INFO_PREFIX, JSON.stringify(userData))
			},
			/**
			 * 获取用户
			 */
			GET_USER: () => {
				let userInfo = uni.getStorageSync(USER_INFO_PREFIX)
				if (userInfo) {
					return JSON.parse(userInfo)
				}
				return null;
			},
			/**
			 * 清除用户
			 */
			CLEAR_USER: () => {
				uni.removeStorageSync(USER_INFO_PREFIX)
			},
			/**
			 * 清除所有存储
			 */
			CLEAR_ALL: () => {
				uni.clearStorageSync()
			},
			
			showToast: (title) => {
				uni.showToast({
				    title: title,
				    duration: 2000
				});
			},
			showLoading: (title) => {
				uni.showLoading({
				    title: title
				});
			},
			hideLoading: (title) => {
				uni.hideLoading({
				    title: title
				});
			},
			showModal: (title, content, showCancel,confirmText, confirm, cancel) => {
				if (title == null || title == '' || title == undefined) {
				  title = '提示';
				}
				uni.showModal({
				  title: title,
				  content: content,
				  showCancel: showCancel,
				  confirmText: confirmText,
				  success(res) {
					if (res.confirm) {
						confirm();
					} else if (res.cancel) {
						cancel();
					}
				  }
				})
			}
		}
	}
}

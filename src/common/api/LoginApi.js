/**
 * 登录API
 */
import BaseApi from '@/common/api/BaseApi'
export default class LoginApi extends BaseApi {
	static get() {
		if (!this.instance) {
			this.instance = new LoginApi();
		}
		return this.instance;
	}

	// 微信登录
	wxLogin = (code, wxLoginType) => {
		return this.$mhttp.httpPost(this.$constant.API_NSC + 'auth/wxLogin', {
			code: code
		}, null);
	}

	// 普通登录
	login = (username, password) => {
		return this.$mhttp.httpPost(this.$constant.API_NSC + 'auth/login', {
			userName: username,
			password: password,
			requestType: 'mobile'
		}, null);
	}

	// 获取用户信息
	userInfo = () => {
		return this.$mhttp.httpGet(this.$constant.API_NSC + 'uc/user/me', {}, null);
	}


}
import Vue from 'vue'
import md5 from 'js-md5'

export default {
	
	/**
	 * 获取GUID
	 * len 生成的长度 默认为32
	 * radix 基数 默认为16
	 */
	getGuid: (len, radix) => {
		if (len == null || len == 0 || len == '' || len == undefined) {
			len = 32;
		}
		if (radix == null || radix == 0 || radix == '' || radix == undefined) {
			radix = 16;
		}

		let CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
		let chars = CHARS, uuid = [], i;
		radix = radix || chars.length;

		if (len) {
			// Compact form 
			for (i = 0; i < len; i++) {
				uuid[i] = chars[0 | Math.random() * radix];
			}
		} else {
			// rfc4122, version 4 form 
			let r;
			// rfc4122 requires these characters 
			uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
			uuid[14] = '4';

			// Fill in random data.  At i==19 set the high bits of clock sequence as 
			// per rfc4122, sec. 4.1.5 
			for (i = 0; i < 36; i++) {
				if (!uuid[i]) {
					r = 0 | Math.random() * 16;
					uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
				}
			}
		}
		return uuid.join('');
	},
	
	md5Sign: (md5Value) => {
		const mConstant = Vue.prototype.$constant;
		return md5(md5(md5Value) + mConstant.MD5_SALT)
	},
	/** 
	* 获取当前时间的时间戳
	*/
	getNowTimestamp: () => {
		let timestamp = (new Date().getTime().toString()).substr(0,10);
		return timestamp;
	}
	
}
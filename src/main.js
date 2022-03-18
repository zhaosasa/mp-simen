import Vue from 'vue'
import App from './App'
import $constant from './common/utils/Constant.js'
import $mhttp from './common/utils/Http.js'
import Utils from './common/utils/Utils.js'

Vue.config.productionTip = false
Vue.use($constant, {})
Vue.use($mhttp, {})
Vue.prototype.$utils = Utils;

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()

<template>
  <view class="home">
    <!-- 设置圆角 -->
    <uni-search-bar :radius="100" @confirm="search"></uni-search-bar>
    <view class="title">
      UNIAPP H5版本 通用的首页，自定义的业务可以在此扩展
    </view>
    <view>{{ content }}</view>
    <button type="primary" @click="login" v-show="!this.$constant.GET_USER()">
      重新登录
    </button>
  </view>
</template>

<script>
import LoginApi from "@/common/api/LoginApi.js";
export default {
  data() {
    return {
      content: "未登录，请重新刷新并触发登录",
    };
  },
  onLoad() {
    console.log("home onLoad ");
    let userInfo = this.$constant.GET_USER();
    if (!userInfo) {
      this.login();
    }
  },
  onShow() {
    let user = this.$constant.GET_USER();
    if (user) {
      this.content = " 登录成功！ 欢迎: " + user.userName;
    } else {
      this.content = "未登录，请重新刷新并触发登录";
    }
  },
  methods: {
    search(val) {
      console.log("我是搜索内容");
    },
    login() {
      uni.navigateTo({
        url: "../login/Login",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.home {
  padding: 20px;
  font-size: 14px;
  line-height: 24px;
  .title {
    text-align: center;
  }
}
</style>

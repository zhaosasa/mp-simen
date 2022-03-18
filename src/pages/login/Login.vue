<template>
  <view class="login">
    <uni-forms ref="form" :value="formData" :rules="rules">
      <uni-forms-item label="用户名" name="username">
        <uni-easyinput
          type="text"
          v-model="formData.username"
          placeholder="请输入用户名"
        />
      </uni-forms-item>
      <uni-forms-item label="密码" name="password" placeholder="请输入密码">
        <uni-easyinput
          type="password"
          v-model="formData.password"
          placeholder="请输入密码"
        />
      </uni-forms-item>
      <button type="primary" @click="submit">Submit</button>
    </uni-forms>
  </view>
</template>

<script>
import LoginApi from "@/common/api/LoginApi.js";
export default {
  data() {
    return {
      formData: {
        username: "",
        password: "",
      },
      rules: {
        // 对name字段进行必填验证
        username: {
          rules: [
            {
              required: true,
              errorMessage: "请输入用户名",
            },
            {
              minLength: 3,
              maxLength: 50,
              errorMessage: "用户名长度在 {minLength} 到 {maxLength} 个字符",
            },
          ],
        },
        password: {
          rules: [
            {
              required: true,
              errorMessage: "请输入密码",
            },
          ],
        },
      },
    };
  },
  onLoad() {
    console.log(" login onload ");
  },
  methods: {
    submit() {
      this.$refs.form
        .submit()
        .then((res) => {
          this.$constant.showLoading();
          LoginApi.get()
            .login(res.username, res.password)
            .then((res) => {
              if (this.$constant.BIZ_RESPONSE_CODE == res.data.code) {
                this.$constant.SET_TOKEN(res.data.data.access_token);
                this.paltformGetMe();
              } else {
                this.$constant.hideLoading();
                this.$constant.showToast(res.data.msg);
              }
            })
            .catch((err) => {
              this.$constant.hideLoading();
              console.log(" 请求失败 " + err);
            });
        })
        .catch((err) => {
          this.$constant.hideLoading();
        });
    },
    paltformGetMe() {
      LoginApi.get()
        .userInfo()
        .then((res2) => {
          if (this.$constant.BIZ_RESPONSE_CODE == res2.data.code) {
            this.$constant.SET_USER(res2.data.data);
            this.$constant.hideLoading();
            uni.switchTab({
              url: "/pages/home/Home",
            });
          } else {
            this.$constant.hideLoading();
            this.$constant.showToast(res2.data.msg);
          }
        })
        .catch((err) => {
          this.$constant.hideLoading();
          this.$constant.showToast("获取用户信息失败: " + err);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.login-btn {
  margin-top: 40%;
}
</style>
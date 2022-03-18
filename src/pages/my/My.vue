<template>
	<view class="my">
		<image class="logo" src="/static/logo.png"></image>
		<view>
			<button type="primary" v-show="showLogout" @click="onLogout">退出</button>
		</view>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				showLogout: false
			}
		},
		onShow() {
			this.showLogout = this.$constant.GET_USER() == null ? false : true;
		},
		methods: {
			onLogout() {
				this.$constant.CLEAR_ALL();
				uni.switchTab({
					url: "../home/Home"
				})
			}
		}
	}
</script>
<style lang="scss" scoped>
	.my {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	
	.logo {
		height: 200rpx;
		width: 200rpx;
		margin: 200rpx auto 50rpx auto;
	}
	
	.text-area {
		display: flex;
		justify-content: center;
	}
	
	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>
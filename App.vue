<style lang="scss">	
	@import "uni_modules/uview-plus/index.scss";
</style>
<script>
import { initSampleData } from './api/api.js'

	export default {
		onLaunch: function() {
			console.log('App Launch')
		
		// 初始化样本数据
		initSampleData()
		
		// 记录应用启动状态
		uni.setStorageSync('appLaunched', true)
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>
<style>
	/*每个页面公共css */
</style>

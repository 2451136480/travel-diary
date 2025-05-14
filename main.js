import App from './App'
import uviewPlus from '@/uni_modules/uview-plus'
import './api/mock.js'
import { initSampleData } from './api/api.js'

// 初始化样本数据
initSampleData()

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
export function createApp() {
	const app = createSSRApp(App)
	app.use(uviewPlus)
	
	// 初始化样本数据
	initSampleData()
	
	return {
		app
	}
	
}// #endif

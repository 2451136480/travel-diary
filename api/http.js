/**
 * 简化版 http.js - 仅提供本地存储支持
 * 移除所有网络请求相关代码，只保留基本功能
 */

// 基础配置
const config = {
	baseUrl: '', // 不再需要后端服务器地址
	timeout: 1000,
	header: {
		'Content-Type': 'application/json;charset=UTF-8'
}
}

// 模拟请求结果
const mockResult = (data, code = 0, msg = 'success') => {
	return { code, msg, data }
}

// 简化的核心函数 - 不再执行实际网络请求，仅用于兼容旧代码
const http = (url, data = {}, method = 'GET', isUpload = false) => {
	console.log(`模拟请求: ${method} ${url}`, data)
	
	return new Promise((resolve, reject) => {
		// 延迟执行，模拟网络请求
		setTimeout(() => {
			// 统一返回格式, 具体业务逻辑已移至 api.js
			resolve(mockResult({}))
		}, 300)
	})
}

// 本地存储工具函数
const storage = {
	// 保存数据
	set: (key, data) => {
		try {
			uni.setStorageSync(key, typeof data === 'object' ? JSON.stringify(data) : data)
			return true
		} catch (e) {
			console.error('存储数据失败', e)
			return false
		}
	},
	
	// 获取数据
	get: (key, defaultValue = null) => {
		try {
			const value = uni.getStorageSync(key)
			if (value === '' || value === undefined || value === null) {
				return defaultValue
			}
			
			// 尝试解析JSON
			try {
				return JSON.parse(value)
			} catch (e) {
				// 不是有效的JSON，直接返回原始值
				return value
			}
		} catch (e) {
			console.error('获取数据失败', e)
			return defaultValue
		}
	},
	
	// 删除数据
	remove: (key) => {
		try {
			uni.removeStorageSync(key)
			return true
		} catch (e) {
			console.error('删除数据失败', e)
			return false
		}
	},
	
	// 清空所有数据
	clear: () => {
		try {
			uni.clearStorageSync()
			return true
		} catch (e) {
			console.error('清空数据失败', e)
			return false
		}
	}
}

// 用户工具函数
const user = {
	// 获取用户信息
	getUserInfo: () => {
		const userInfoStr = uni.getStorageSync('userInfo')
		if (!userInfoStr) return null
		
		try {
			return JSON.parse(userInfoStr)
		} catch (e) {
			console.error('解析用户信息失败', e)
			return null
		}
	},
	
	// 检查登录状态
	checkLogin: () => {
		const token = uni.getStorageSync('token')
		if (!token) return false
		
		const userInfo = user.getUserInfo()
		return !!userInfo
	},
	
	// 退出登录
	logout: () => {
		uni.removeStorageSync('token')
		uni.removeStorageSync('userInfo')
		
		// 清除记住登录但不过期
		const savedLoginStr = uni.getStorageSync('savedLogin')
		if (savedLoginStr) {
			try {
				const savedLogin = JSON.parse(savedLoginStr)
				// 保留用户名但移除密码和过期时间
				uni.setStorageSync('savedLogin', JSON.stringify({
					username: savedLogin.username
				}))
			} catch (e) {
				uni.removeStorageSync('savedLogin')
			}
		}
	},
	
	// 跳转到登录页
	goLogin: (redirectUrl) => {
		if (redirectUrl) {
			// 记录当前页面，登录后跳回
			uni.setStorageSync('loginRedirect', redirectUrl)
		}
		
		uni.navigateTo({
			url: '/pages/login'
		})
	},
	
	// 跳转到主页
	goHome: () => {
		uni.switchTab({
			url: '/pages/index/index'
		})
	},
	
	// 跳转到个人中心
	goProfile: () => {
		uni.switchTab({
			url: '/pages/my/my'
		})
	}
}

// 文件工具函数
const file = {
	// 从本地选择图片
	chooseImage: (count = 1) => {
		return new Promise((resolve, reject) => {
			uni.chooseImage({
				count,
				sizeType: ['original', 'compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					resolve(res.tempFilePaths)
				},
				fail: (err) => {
					reject(err)
				}
			})
		})
	},
	
	// 从本地选择视频
	chooseVideo: () => {
		return new Promise((resolve, reject) => {
			uni.chooseVideo({
				sourceType: ['album', 'camera'],
				success: (res) => {
					resolve({
						tempFilePath: res.tempFilePath,
						duration: res.duration,
						size: res.size
					})
				},
				fail: (err) => {
					reject(err)
				}
			})
		})
	},
	
	// 保存文件到本地 (模拟上传)
	saveFile: (tempFilePath) => {
		return new Promise((resolve, reject) => {
			// 模拟保存延迟
			setTimeout(() => {
				// 实际应用中需要保存到本地，这里只返回原路径
				resolve({ url: tempFilePath })
			}, 500)
		})
	}
}

// 工具函数
const utils = {
	// 显示消息提示
	toast: (title, icon = 'none', duration = 1500) => {
				uni.showToast({
			title,
			icon,
			duration
		})
	},
	
	// 显示加载
	showLoading: (title = '加载中...') => {
		uni.showLoading({
			title,
			mask: true
		})
	},
	
	// 隐藏加载
	hideLoading: () => {
		uni.hideLoading()
	},
	
	// 显示模态框
	modal: (content, title = '提示', showCancel = true) => {
		return new Promise((resolve) => {
			uni.showModal({
				title,
				content,
				showCancel,
				success: (res) => {
					resolve(res.confirm)
			}
		})
	})
	},
	
	// 生成唯一ID
	genId: () => {
		return 'id_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
	},
	
	// 格式化日期
	formatDate: (date, format = 'YYYY-MM-DD') => {
		if (!date) return ''
		
		if (typeof date === 'string') {
			date = new Date(date)
		}
		
		const year = date.getFullYear()
		const month = date.getMonth() + 1
		const day = date.getDate()
		const hour = date.getHours()
		const minute = date.getMinutes()
		const second = date.getSeconds()
		
		return format
			.replace(/YYYY/g, year)
			.replace(/MM/g, month < 10 ? '0' + month : month)
			.replace(/DD/g, day < 10 ? '0' + day : day)
			.replace(/HH/g, hour < 10 ? '0' + hour : hour)
			.replace(/mm/g, minute < 10 ? '0' + minute : minute)
			.replace(/ss/g, second < 10 ? '0' + second : second)
	}
}

// 请求状态管理
// 存储所有活跃请求
let activeRequests = [];

// 获取请求状态信息
export const getRequestStatus = () => {
  // 清理超过30秒的过期请求
  const now = Date.now();
  activeRequests = activeRequests.filter(req => (now - req.timestamp) < 30000);
  
  return {
    activeCount: activeRequests.length,
    requests: [...activeRequests]
  };
};

// 清理过期请求
export const cleanStaleRequests = () => {
  const now = Date.now();
  const prevCount = activeRequests.length;
  
  // 清理超过10秒的请求
  activeRequests = activeRequests.filter(req => (now - req.timestamp) < 10000);
  
  return prevCount - activeRequests.length;
};

// 记录API请求
export const trackedRequest = async (requestFn, reqInfo = {}) => {
  // 添加到活跃请求列表
  const requestId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const requestInfo = {
    id: requestId,
    ...reqInfo,
    timestamp: Date.now()
  };
  
  activeRequests.push(requestInfo);
  
  try {
    const result = await requestFn();
    return result;
  } finally {
    // 请求完成后从活跃列表中移除
    activeRequests = activeRequests.filter(req => req.id !== requestId);
  }
};

// 导出
export default http

// 工具函数导出
export {
	storage,
	user,
	file,
	utils
}
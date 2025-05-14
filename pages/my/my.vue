<template>
	<view class="profile-container">
		<!-- 顶部背景 -->
		<view class="profile-header">
			<!-- 顶部状态栏 -->
			<view class="header-tools">
				<view class="tool-item" @click="navigateTo('/pages/setting')">
					<up-icon name="setting" color="#ffffff" size="24"></up-icon>
				</view>
				<view class="tool-item" @click="navigateTo('/pages/message')">
					<up-icon name="chat" color="#ffffff" size="24"></up-icon>
					<view class="badge" v-if="hasUnreadMessages">{{unreadCount}}</view>
				</view>
			</view>
			
			<!-- 用户信息 -->
			<view class="user-profile" @click="handleUserClick">
				<view class="avatar-container">
					<image class="avatar" :src="(userInfo && userInfo.avatarUrl) || '/static/headimg/zm.jpg'" mode="aspectFill"></image>
					<view class="avatar-edit" v-if="isLoggedIn">
						<up-icon name="camera-fill" color="#ffffff" size="14"></up-icon>
					</view>
				</view>
				<view class="user-info">
					<view class="username">{{ isLoggedIn && userInfo ? userInfo.nickname : '登录/注册' }}</view>
					<view class="user-id" v-if="isLoggedIn && userInfo">ID: {{ userInfo.userId || '10086' }}</view>
					<view class="login-tip" v-else>点击登录，体验更多功能</view>
				</view>
			</view>
		</view>
		
		<!-- 用户数据统计 -->
		<view class="user-stats">
			<view class="stat-item" @click="navigateTo('/pages/likes')">
				<view class="stat-value">{{ userStats.likes || 0 }}</view>
				<view class="stat-label">获赞</view>
			</view>
			<view class="stat-item" @click="navigateTo('/pages/follows')">
				<view class="stat-value">{{ userStats.follows || 0 }}</view>
				<view class="stat-label">关注</view>
			</view>
			<view class="stat-item" @click="navigateTo('/pages/fans')">
				<view class="stat-value">{{ userStats.fans || 0 }}</view>
				<view class="stat-label">粉丝</view>
			</view>
			<view class="stat-item" @click="navigateTo('/pages/collections')">
				<view class="stat-value">{{ userStats.collections || 0 }}</view>
				<view class="stat-label">收藏</view>
			</view>
		</view>
		
		<!-- 我的游记板块 -->
		<view class="my-travels" @click="navigateTo('/pages/travel-List/my-travels')">
			<view class="section-header">
				<view class="section-title">
					<up-icon name="bookmark" color="#506fff" size="18"></up-icon>
					<text>我的游记</text>
				</view>
				<view class="section-more">
					<text>查看全部</text>
					<up-icon name="arrow-right" color="#999999" size="14"></up-icon>
				</view>
			</view>
			
			<view class="travel-preview">
				<view class="empty-travel" v-if="!travelPreview.length">
					<up-empty mode="list" text="暂无游记" icon="file-text"></up-empty>
					<view class="add-travel-btn" @click.stop="navigateTo('/pages/travel-edit/travel-edit')">发布游记</view>
				</view>
				<scroll-view v-else scroll-x class="travel-scroll" show-scrollbar="false">
					<view 
						class="travel-item" 
						v-for="(item, index) in travelPreview" 
						:key="index"
						@click.stop="navigateTo(`/pages/detail/detail?id=${item.id}`)"
					>
						<image class="travel-cover" :src="item.img || '/static/imgg/default.jpg'" mode="aspectFill"></image>
						<view class="travel-title">{{ item.title }}</view>
					</view>
				</scroll-view>
			</view>
						</view>
		
		<!-- 功能菜单 -->
		<view class="feature-menu">
			<!-- 常用功能 -->
			<view class="menu-section">
				<view class="section-header">
					<view class="section-title">
						<up-icon name="star" color="#506fff" size="18"></up-icon>
						<text>常用功能</text>
						</view>
				</view>
				
				<view class="menu-grid">
					<view class="menu-item" @click="navigateTo('/pages/favorites')">
						<view class="menu-icon">
							<up-icon name="heart" color="#ff6b6b" size="24"></up-icon>
						</view>
						<view class="menu-name">我的喜欢</view>
					</view>
					<view class="menu-item" @click="navigateTo('/pages/collections')">
						<view class="menu-icon">
							<up-icon name="star" color="#ffc107" size="24"></up-icon>
						</view>
						<view class="menu-name">我的收藏</view>
					</view>
					<view class="menu-item" @click="navigateTo('/pages/history')">
						<view class="menu-icon">
							<up-icon name="clock" color="#4dabf7" size="24"></up-icon>
						</view>
						<view class="menu-name">浏览历史</view>
					</view>
					<view class="menu-item" @click="navigateTo('/pages/draft')">
						<view class="menu-icon">
							<up-icon name="file-text" color="#20c997" size="24"></up-icon>
						</view>
						<view class="menu-name">草稿箱</view>
					</view>
				</view>
			</view>
			
			<!-- 其他功能菜单 -->
			<view class="menu-list">
				<view class="menu-item-row" @click="navigateTo('/pages/profile')">
					<view class="menu-item-left">
						<up-icon name="account" color="#506fff" size="20"></up-icon>
						<text>个人资料</text>
					</view>
					<up-icon name="arrow-right" color="#cccccc" size="16"></up-icon>
				</view>
				
				<view class="menu-item-row" @click="navigateTo('/pages/feedback')">
					<view class="menu-item-left">
						<up-icon name="help-circle" color="#506fff" size="20"></up-icon>
						<text>反馈与帮助</text>
		</view>
					<up-icon name="arrow-right" color="#cccccc" size="16"></up-icon>
			</view>
				
				<view class="menu-item-row" @click="navigateTo('/pages/about')">
					<view class="menu-item-left">
						<up-icon name="info" color="#506fff" size="20"></up-icon>
						<text>关于我们</text>
		</view>
					<up-icon name="arrow-right" color="#cccccc" size="16"></up-icon>
				</view>
				
				<view v-if="isLoggedIn" class="menu-item-row logout" @click="handleLogout">
					<view class="menu-item-left">
						<up-icon name="power" color="#ff5252" size="20"></up-icon>
						<text>退出登录</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { onShow } from '@dcloudio/uni-app'
import { ref, computed } from 'vue'
import { getUserInfo, getMyTravels } from '../../api/api.js'
import { user, utils, file } from '../../api/http.js'

export default {
	setup() {
		// 用户信息
		const userInfo = ref(null)
		
		// 我的游记
		const myTravels = ref([])
		
		// 我的游记预览数据（首页显示）
		const travelPreview = ref([])
		
		// 用户统计数据
		const userStats = ref({
			likes: 0,
			follows: 0,
			fans: 0,
			collections: 0
		})
		
		// 获取用户信息
		const loadUserInfo = async () => {
			try {
				// 检查是否已登录
				if (!user.checkLogin()) {
					userInfo.value = null
					return
				}
				
				// 获取用户信息
				const userInfoData = user.getUserInfo()
				
				if (userInfoData) {
					userInfo.value = userInfoData
					
					// 获取我的游记
					loadMyTravels()
				} else {
					console.error('用户信息不存在')
					userInfo.value = null
				}
			} catch (error) {
				console.error('获取用户信息失败', error)
				userInfo.value = null
			}
		}
		
		// 获取我的游记列表
		const loadMyTravels = async () => {
			try {
				// 必须登录才能获取
				if (!user.checkLogin()) return
				
				// 获取已发布的游记
				const result = await getMyTravels(1, 1, 10)
				myTravels.value = result.list || []
				
				// 更新统计数据
				updateStats()
			} catch (error) {
				console.error('获取我的游记失败', error)
			}
		}
		
		// 更新统计数据
		const updateStats = async () => {
			try {
				// 获取全部游记（包括草稿和审核中）
				const result = await getMyTravels(undefined, 1, 100)
				const allTravels = result.list || []
				
				// 计算统计数据
				userStats.value = {
					likes: allTravels.reduce((sum, travel) => sum + (travel.likeCount || 0), 0),
					follows: allTravels.reduce((sum, travel) => sum + (travel.followCount || 0), 0),
					fans: allTravels.reduce((sum, travel) => sum + (travel.fansCount || 0), 0),
					collections: allTravels.reduce((sum, travel) => sum + (travel.collectionCount || 0), 0)
				}
			} catch (error) {
				console.error('更新统计数据失败', error)
			}
		}
		
		// 跳转到登录页
		const goToLogin = () => {
			uni.navigateTo({
				url: '/pages/login'
			})
		}
		
		// 跳转到我的游记列表
		const goToMyTravels = () => {
			uni.navigateTo({
				url: '/pages/travel-List/travel-List'
			})
		}
		
		// 跳转到发布游记
		const goToPublish = () => {
			uni.navigateTo({
				url: '/pages/travel-edit/travel-edit'
			})
		}
		
		// 选择头像
		const chooseAvatar = async () => {
			try {
				// 选择图片
				const tempFilePaths = await file.chooseImage(1)
				if (tempFilePaths && tempFilePaths.length > 0) {
					// 在正式环境中需要调用上传API，这里直接修改本地储存
					if (userInfo.value) {
						// 获取用户列表
						const userListStr = uni.getStorageSync('userList') || '[]'
						const userList = JSON.parse(userListStr)
						
						// 查找当前用户并更新头像
						const userIndex = userList.findIndex(u => u.userId === userInfo.value.userId)
						if (userIndex !== -1) {
							userList[userIndex].avatarUrl = tempFilePaths[0]
							
							// 保存更新后的用户列表
							uni.setStorageSync('userList', JSON.stringify(userList))
							
							// 更新当前用户信息
							userInfo.value.avatarUrl = tempFilePaths[0]
							
							// 更新本地存储的用户信息
							const storedUserInfo = uni.getStorageSync('userInfo')
							if (storedUserInfo) {
								const updatedUserInfo = JSON.parse(storedUserInfo)
								updatedUserInfo.avatarUrl = tempFilePaths[0]
								uni.setStorageSync('userInfo', JSON.stringify(updatedUserInfo))
							}
							
							utils.toast('头像已更新', 'success')
						}
					}
				}
			} catch (error) {
				utils.toast('更新头像失败')
				console.error('更新头像失败:', error)
			}
		}
		
		// 退出登录
		const handleLogout = () => {
	uni.showModal({
				title: '确认退出',
				content: '确定要退出登录吗？',
				success: function(res) {
			if (res.confirm) {
						// 执行退出登录操作
						user.logout()
						
						// 清空页面数据
						userInfo.value = null
						myTravels.value = []
						travelPreview.value = []
						
						// 显示提示
						uni.showToast({
							title: '已退出登录',
							icon: 'success'
						})
					}
				}
			})
		}
		
		// 检查登录状态
		const isLoggedIn = computed(() => {
			return user.checkLogin() && userInfo.value !== null
		})
		
		// 每次显示页面时获取最新数据
		onShow(() => {
			loadUserInfo()
		})
		
		// 处理用户信息点击
		const handleUserClick = () => {
			if (user.checkLogin()) {
				// 已登录，跳转到个人资料编辑页面
				navigateTo('/pages/profile')
			} else {
				// 未登录，跳转到登录页面
				user.goLogin('/pages/my/my')
			}
		}
		
		// 导航函数
		const navigateTo = (url) => {
			// 判断是否是tabBar页面
			const tabBarPages = ['/pages/index/index', '/pages/my/my', '/pages/travel-List/my-travels']
			if (tabBarPages.includes(url)) {
				uni.switchTab({ url })
			} else {
				uni.navigateTo({ url })
			}
		}
		
		return {
			userInfo,
			myTravels,
			travelPreview,
			userStats,
			goToLogin,
			goToMyTravels,
			goToPublish,
			chooseAvatar,
			handleLogout,
			isLoggedIn,
			handleUserClick,
			navigateTo
		}
	}
}
</script>

<style lang="scss" scoped>
.profile-container {
	padding-bottom: 20rpx;
	background-color: #f5f5f5;
}

.profile-header {
	position: relative;
	padding: 40rpx 20rpx;
	background-color: #00aaff;
	color: #ffffff;
}

.header-tools {
	display: flex;
	justify-content: flex-end;
	align-items: center;
}

.tool-item {
	margin-left: 20rpx;
}

.badge {
	position: absolute;
	top: 10rpx;
	right: 10rpx;
	padding: 4rpx 8rpx;
	font-size: 20rpx;
	color: #ffffff;
	background-color: #ff5252;
	border-radius: 20rpx;
}

.user-profile {
	display: flex;
	align-items: center;
	margin-top: 20rpx;
}

.avatar-container {
		position: relative;
	width: 120rpx;
	height: 120rpx;
	border-radius: 50%;
		overflow: hidden;
}

.avatar {
	width: 100%;
	height: 100%;
}

.avatar-edit {
		position: absolute;
	right: 0;
	bottom: 0;
	width: 40rpx;
	height: 40rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: rgba(0, 0, 0, 0.5);
	border-radius: 50%;
}

.user-info {
	margin-left: 20rpx;
}

.username {
	font-size: 36rpx;
	font-weight: bold;
}

.user-id {
	margin-top: 10rpx;
	font-size: 24rpx;
}

.login-tip {
	margin-top: 10rpx;
	font-size: 24rpx;
}

.user-stats {
		display: flex;
	justify-content: space-around;
		align-items: center;
	padding: 20rpx;
	background-color: #ffffff;
	border-radius: 12rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.stat-item {
	text-align: center;
}

.stat-value {
	font-size: 32rpx;
	font-weight: bold;
}

.stat-label {
	margin-top: 10rpx;
	font-size: 24rpx;
	color: #999999;
}

.my-travels {
	margin: 20rpx;
	padding: 20rpx;
	background-color: #ffffff;
	border-radius: 12rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.section-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

.section-title {
	display: flex;
	align-items: center;
	font-size: 32rpx;
	font-weight: bold;
}

.section-more {
	display: flex;
	align-items: center;
	font-size: 24rpx;
	color: #999999;
}

.travel-preview {
	margin-top: 20rpx;
}

.empty-travel {
			display: flex;
	flex-direction: column;
			align-items: center;
	justify-content: center;
	height: 200rpx;
}

.add-travel-btn {
	margin-top: 20rpx;
	padding: 10rpx 20rpx;
	font-size: 24rpx;
	color: #ffffff;
	background-color: #00aaff;
	border-radius: 20rpx;
}

.travel-scroll {
	white-space: nowrap;
}

.travel-item {
	display: inline-block;
	width: 200rpx;
				margin-right: 20rpx;
			}

.travel-cover {
	width: 100%;
	height: 150rpx;
	border-radius: 12rpx;
}

.travel-title {
	margin-top: 10rpx;
	font-size: 24rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.feature-menu {
	margin: 20rpx;
	padding: 20rpx;
	background-color: #ffffff;
	border-radius: 12rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.menu-section {
	margin-bottom: 20rpx;
}

.menu-grid {
			display: flex;
			justify-content: space-around;
			align-items: center;
	margin-top: 20rpx;
}

.menu-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 25%;
			text-align: center;
		}

.menu-icon {
	width: 80rpx;
	height: 80rpx;
			display: flex;
	justify-content: center;
			align-items: center;
	background-color: #f5f5f5;
	border-radius: 50%;
}

.menu-name {
	margin-top: 10rpx;
	font-size: 24rpx;
}

.menu-list {
	margin-top: 20rpx;
}

.menu-item-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx;
	border-bottom: 1px solid #f5f5f5;
}

.menu-item-left {
	display: flex;
	align-items: center;
}

.logout {
	color: #ff5252;
}

</style>

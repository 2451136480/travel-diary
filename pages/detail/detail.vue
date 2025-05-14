<template>
	<view class="detail-container">
		<!-- 顶部轮播图 -->
		<swiper 
			class="swiper-container" 
			:indicator-dots="travelDetail.images && travelDetail.images.length > 1" 
			:autoplay="false" 
			:interval="3000" 
			:duration="500" 
			:circular="true"
			indicator-active-color="#ffffff"
			indicator-color="rgba(255, 255, 255, 0.5)"
		>
			<!-- 如果有视频，第一项显示视频封面 -->
			<swiper-item v-if="travelDetail.video" @click="playVideo">
				<view class="video-preview">
					<image 
						:src="travelDetail.images && travelDetail.images.length ? travelDetail.images[0] : '/static/imgg/default.jpg'" 
						mode="aspectFill"
					></image>
					<view class="play-icon">
						<up-icon name="play-right-fill" color="#ffffff" size="60"></up-icon>
					</view>
				</view>
			</swiper-item>
			
			<!-- 图片轮播 -->
			<swiper-item v-for="(img, index) in travelDetail.images" :key="index" @click="previewImage(index)">
				<image :src="img" mode="aspectFill" class="swiper-image"></image>
			</swiper-item>
			
			<!-- 如果没有图片和视频，显示默认图片 -->
			<swiper-item v-if="!travelDetail.images || travelDetail.images.length === 0 && !travelDetail.video">
				<image src="/static/imgg/default.jpg" mode="aspectFill" class="swiper-image"></image>
			</swiper-item>
		</swiper>
		
		<!-- 返回按钮 -->
		<view class="back-btn" @click="goBack">
			<up-icon name="arrow-left" color="#ffffff" size="20"></up-icon>
		</view>
		
		<!-- 内容区域 -->
		<view class="content-card">
			<!-- 标题 -->
			<view class="title-section">
				<text class="title">{{ travelDetail.title || '游记详情' }}</text>
			</view>
			
			<!-- 作者信息 -->
			<view class="author-section">
				<view class="author-left">
					<image :src="travelDetail.author?.avatarUrl || '/static/headimg/zm.jpg'" class="avatar"></image>
					<view class="author-info">
						<text class="author-name">{{ travelDetail.author?.nickname || '游客' }}</text>
						<text class="publish-time">{{ formatDate(travelDetail.createTime) }}</text>
					</view>
				</view>
				
				<!-- 关注按钮 -->
				<view class="follow-btn" @click="toggleFollow">
					<text>{{ isFollowed ? '已关注' : '关注' }}</text>
						</view>
					</view>
			
			<!-- 主体内容 -->
			<view class="content-section">
				<text class="content-text">{{ travelDetail.content }}</text>
			</view>
			
			<!-- 互动栏 -->
			<view class="action-bar">
				<view class="action-item" @click="handleLike">
					<up-icon :name="isLiked ? 'heart-fill' : 'heart'" :color="isLiked ? '#ff5555' : '#666'" size="24"></up-icon>
					<text :class="['action-text', isLiked ? 'liked' : '']">{{ likeCount }}</text>
								</view>
				<view class="action-item" @click="handleComment">
					<up-icon name="chat" color="#666" size="24"></up-icon>
					<text class="action-text">{{ commentCount }}</text>
									</view>
				<view class="action-item" @click="handleShare">
					<up-icon name="share" color="#666" size="24"></up-icon>
					<text class="action-text">分享</text>
								</view>
				<view class="action-item" @click="handleCollect">
					<up-icon :name="isCollected ? 'star-fill' : 'star'" :color="isCollected ? '#ffc107' : '#666'" size="24"></up-icon>
					<text :class="['action-text', isCollected ? 'collected' : '']">收藏</text>
							</view>
						</view>
					</view>
		
		<!-- 视频播放器弹窗 -->
		<view v-if="showVideo" class="video-modal" @click.self="closeVideo">
			<view class="video-wrapper">
				<video 
					:src="travelDetail.video" 
					class="full-video" 
					autoplay 
					:controls="true"
					:show-fullscreen-btn="true"
					object-fit="contain"
					@ended="closeVideo"
				></video>
				<view class="close-btn" @click="closeVideo">
					<up-icon name="close" color="#ffffff" size="20"></up-icon>
				</view>
			</view>
		</view>
		
		<!-- 分享操作表 -->
		<up-action-sheet 
			:show="showShareSheet" 
			title="分享到" 
			:cancel-text="'取消'" 
			@close="showShareSheet = false"
			:actions="shareActions"
			@select="handleShareSelect"
		></up-action-sheet>
		
		<!-- 加载状态 -->
		<view v-if="loading" class="loading-mask">
			<up-loading-icon size="36" color="#506fff"></up-loading-icon>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import { getTravelDetail } from '../../api/api.js'

// 游记详情
const travelDetail = ref({})
// 加载状态
const loading = ref(false)
// 视频播放器状态
const showVideo = ref(false)
// 分享面板状态
const showShareSheet = ref(false)
// 是否已关注
const isFollowed = ref(false)
// 是否已点赞
const isLiked = ref(false)
// 点赞数
const likeCount = ref(0)
// 评论数
const commentCount = ref(0)
// 是否已收藏
const isCollected = ref(false)

// 分享选项
const shareActions = [
	{ name: '微信好友', icon: 'weixin', color: '#07c160' },
	{ name: '朋友圈', icon: 'moments', color: '#07c160' },
	{ name: '复制链接', icon: 'link', color: '#1890ff' },
	{ name: '生成海报', icon: 'photo', color: '#ff9800' }
]

// 加载游记详情
const fetchTravelDetail = async (id) => {
	loading.value = true
	
	try {
		const result = await getTravelDetail(id)
		if (result) {
			travelDetail.value = result
			// 初始化互动数据
			likeCount.value = result.likeCount || 0
			commentCount.value = result.commentCount || 0
			// 从本地存储获取互动状态
			checkInteractionStatus(id)
		}
	} catch (error) {
		console.error('获取游记详情失败', error)
		uni.showToast({
			title: '获取详情失败',
			icon: 'none'
		})
	} finally {
		loading.value = false
	}
}

// 检查互动状态
const checkInteractionStatus = (id) => {
	try {
		// 获取互动状态
		const interactionsStr = uni.getStorageSync('userInteractions') || '{}'
		const interactions = JSON.parse(interactionsStr)
		const travelInteraction = interactions[id] || {}
		
		// 设置状态
		isLiked.value = travelInteraction.liked || false
		isCollected.value = travelInteraction.collected || false
		isFollowed.value = travelInteraction.followed || false
	} catch (error) {
		console.error('获取互动状态失败', error)
	}
}

// 保存互动状态
const saveInteractionStatus = (id) => {
	try {
		// 获取已有状态
		const interactionsStr = uni.getStorageSync('userInteractions') || '{}'
		const interactions = JSON.parse(interactionsStr)
		
		// 更新状态
		interactions[id] = {
			liked: isLiked.value,
			collected: isCollected.value,
			followed: isFollowed.value,
			updatedAt: new Date().toISOString()
		}
		
		// 保存状态
		uni.setStorageSync('userInteractions', JSON.stringify(interactions))
	} catch (error) {
		console.error('保存互动状态失败', error)
	}
}

// 图片预览
const previewImage = (current) => {
	if (!travelDetail.value.images || !travelDetail.value.images.length) return
	
	uni.previewImage({
		current,
		urls: travelDetail.value.images
	})
}

// 播放视频
const playVideo = () => {
	if (!travelDetail.value.video) return
	showVideo.value = true
}

// 关闭视频
const closeVideo = () => {
	showVideo.value = false
}

// 返回上一页
const goBack = () => {
	uni.navigateBack()
}

// 点赞操作
const handleLike = () => {
	// 切换点赞状态
	isLiked.value = !isLiked.value
	
	// 更新点赞数
	if (isLiked.value) {
		likeCount.value += 1
	} else {
		likeCount.value = Math.max(0, likeCount.value - 1)
	}
	
	// 保存状态
	saveInteractionStatus(travelDetail.value.id)
	
	// 显示提示
	uni.showToast({
		title: isLiked.value ? '点赞成功' : '已取消点赞',
		icon: 'none'
		})
	}
	
// 评论操作
const handleComment = () => {
	uni.showToast({
		title: '评论功能开发中',
		icon: 'none'
	})
}

// 分享操作
const handleShare = () => {
	showShareSheet.value = true
}

// 处理分享选择
const handleShareSelect = (index) => {
	const action = shareActions[index]
	
	if (action.name === '复制链接') {
		// 生成分享链接
		const shareLink = `${travelDetail.value.id}`
		uni.setClipboardData({
			data: shareLink,
			success: () => {
				uni.showToast({
					title: '链接已复制',
					icon: 'success'
				})
			}
		})
	} else if (action.name === '生成海报') {
		uni.showToast({
			title: '海报生成功能开发中',
			icon: 'none'
		})
	} else {
		// 微信分享API调用
		uni.showToast({
			title: `分享到${action.name}功能开发中`,
			icon: 'none'
		})
	}
	
	showShareSheet.value = false
}

// 收藏操作
const handleCollect = () => {
	// 切换收藏状态
	isCollected.value = !isCollected.value
	
	// 保存状态
	saveInteractionStatus(travelDetail.value.id)
	
	// 显示提示
	uni.showToast({
		title: isCollected.value ? '收藏成功' : '已取消收藏',
		icon: 'none'
	})
}

// 关注操作
const toggleFollow = () => {
	// 切换关注状态
	isFollowed.value = !isFollowed.value
	
	// 保存状态
	saveInteractionStatus(travelDetail.value.id)
	
	// 显示提示
	uni.showToast({
		title: isFollowed.value ? '关注成功' : '已取消关注',
		icon: 'none'
	})
}

// 格式化日期
const formatDate = (dateString) => {
	if (!dateString) return ''
	const date = new Date(dateString)
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 页面加载
onLoad((options) => {
	if (options.id) {
		// 通过ID获取详情
		fetchTravelDetail(options.id)
	} else if (options.item) {
		// 兼容旧版参数传递方式
		try {
			const data = JSON.parse(decodeURIComponent(options.item))
			travelDetail.value = data
			// 初始化互动数据
			likeCount.value = data.likeCount || 0
			commentCount.value = data.commentCount || 0
			// 检查互动状态
			checkInteractionStatus(data.id)
		} catch (error) {
			console.error('参数解析错误', error)
			uni.showToast({
				title: '参数错误',
				icon: 'none'
			})
		}
	} else {
		uni.showToast({
			title: '参数错误',
			icon: 'none'
		})
	}
})

// 设置分享信息
onShareAppMessage(() => {
	return {
		title: travelDetail.value.title || '精彩游记分享',
		path: `/pages/detail/detail?id=${travelDetail.value.id}`,
		imageUrl: travelDetail.value.images && travelDetail.value.images.length ? travelDetail.value.images[0] : ''
	}
})
</script>

<style lang="scss">
.detail-container {
	min-height: 100vh;
	background-color: #f8f8f8;
	position: relative;
}

/* 轮播图样式 */
.swiper-container {
	width: 100%;
	height: 500rpx;
	position: relative;
}

.swiper-image {
	width: 100%;
	height: 100%;
}

/* 返回按钮 */
.back-btn {
	position: fixed;
	top: 60rpx;
	left: 30rpx;
	width: 70rpx;
	height: 70rpx;
	background-color: rgba(0, 0, 0, 0.5);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10;
}

/* 视频预览 */
.video-preview {
	position: relative;
	width: 100%;
	height: 100%;
	
		 image {
			 width: 100%;
		height: 100%;
		 }
	
	.play-icon {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100rpx;
		height: 100rpx;
		background-color: rgba(0, 0, 0, 0.5);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
}

/* 内容卡片 */
.content-card {
			 margin-top: -40rpx;
	padding: 40rpx 30rpx;
			 background-color: #fff;
	border-radius: 40rpx 40rpx 0 0;
	min-height: 50vh;
			 position: relative;
	z-index: 2;
	box-shadow: 0 -10rpx 20rpx rgba(0, 0, 0, 0.05);
		 }

/* 标题部分 */
.title-section {
			 margin-bottom: 30rpx;
	
	.title {
		font-size: 38rpx;
		font-weight: bold;
		color: #333;
		line-height: 1.4;
				 }
			 }

/* 作者信息 */
.author-section {
				 display: flex;
				 justify-content: space-between;
	align-items: center;
	margin-bottom: 40rpx;
	padding-bottom: 30rpx;
	border-bottom: 1px solid #f0f0f0;
	
	.author-left {
		display: flex;
		align-items: center;
	}
	
	.avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		margin-right: 20rpx;
		border: 2rpx solid #fff;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
					 }
	
	.author-info {
		display: flex;
		flex-direction: column;
	}
	
	.author-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 6rpx;
	}
	
	.publish-time {
		font-size: 24rpx;
		color: #999;
						 }
	
	.follow-btn {
		padding: 10rpx 30rpx;
		background-color: #506fff;
		color: #fff;
		border-radius: 30rpx;
								font-size: 26rpx;
	}
}

/* 内容区域 */
.content-section {
	margin-bottom: 60rpx;
	
	.content-text {
		font-size: 30rpx;
		color: #333;
		line-height: 1.8;
	}
}

/* 互动栏 */
.action-bar {
	display: flex;
	justify-content: space-around;
	align-items: center;
	padding: 20rpx 0;
	border-top: 1px solid #f0f0f0;
	
	.action-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 16rpx 30rpx;
							}
	
	.action-text {
		margin-top: 10rpx;
		font-size: 24rpx;
		color: #666;
	}
	
	.liked {
		color: #ff5555;
	}
	
	.collected {
		color: #ffc107;
				 }
			 }

/* 视频模态框 */
.video-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.9);
	z-index: 999;
	display: flex;
	align-items: center;
	justify-content: center;
	
	.video-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.full-video {
		width: 100%;
		height: 80%;
	}
	
	.close-btn {
		position: absolute;
		top: 60rpx;
		right: 30rpx;
		width: 70rpx;
		height: 70rpx;
		background-color: rgba(0, 0, 0, 0.5);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
}

/* 加载遮罩 */
.loading-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(255, 255, 255, 0.8);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
 }
</style>

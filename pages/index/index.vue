<template>
	<view class="content">
		<!-- 搜索框：支持游记标题、作者昵称搜索 -->
		<view class="search-box">
			<up-search 
				placeholder="搜索游记标题或作者" 
				bg-color="#e3e3e3" 
				v-model="keyword"
				@search="() => debounceSearch(handleSearch)"
				@clear="resetSearch"
				border-radius="25"
				height="70"
				show-action
				action-text="搜索"
			></up-search>
		</view>
		
		<!-- 轮播图 -->
		<up-transition mode="fade-up" :show="bannerList.length > 0">
			<up-swiper 
				v-if="bannerList.length" 
				:list="bannerList" 
				keyName="image" 
				show-title 
				radius="8" 
				:autoplay="true"
				height="160"
			></up-swiper>
		</up-transition>
		
		<!-- 骨架屏加载 -->
		<up-skeleton 
			v-if="loading && flowList.length === 0" 
			:loading="true" 
			rows="3" 
			avatar
			title
			animated
		></up-skeleton>
		
		<!-- 通知栏 -->
		<up-notice-bar text="欢迎来到旅游日记平台，记录您的美好旅程" color="#FF9500"></up-notice-bar>
		
		<!-- 瀑布流游记列表 -->
		<view class="list">
			<view v-if="loading && flowList.length > 0" class="loading-wrapper">
				<up-loading-icon mode="circle" color="#2979ff"></up-loading-icon>
			</view>
			
			<up-transition mode="fade" :show="!loading || flowList.length > 0">
				<up-waterfall v-model="flowList" ref="uWaterfallRef" column-gap="10" :loading="loading">
					<!-- 左侧列表 -->
				<template v-slot:left="{leftList}">
						<view 
							class="travel-card" 
							v-for="(item, index) in leftList" 
							:key="item.id" 
							@click="goDetail(item)"
						>
							<view class="travel-image">
								<up-lazy-load 
									threshold="-150" 
									border-radius="10" 
									:image="item.img" 
									:index="index"
								></up-lazy-load>
							</view>
							<view class="travel-title">
							{{item.title}}
						</view>
						<view class="user-info">
								<up-avatar :src="item.head" size="36"></up-avatar>
								<up-text :text="item.nick" font-size="28rpx" color="#666"></up-text>
							</view>
					</view>
				</template>
					
					<!-- 右侧列表 -->
				<template v-slot:right="{rightList}">
						<view 
							class="travel-card" 
							v-for="(item, index) in rightList" 
							:key="item.id" 
							@click="goDetail(item)"
						>
							<view class="travel-image">
								<up-lazy-load 
									threshold="-450" 
									border-radius="10" 
									:image="item.img" 
									:index="index"
								></up-lazy-load>
							</view>
							<view class="travel-title">
							{{item.title}}
						</view>
						<view class="user-info">
								<up-avatar :src="item.head" size="36"></up-avatar>
								<up-text :text="item.nick" font-size="28rpx" color="#666"></up-text>
							</view>
						</view>
					</template>
					
					<!-- 加载更多/无数据 -->
					<template v-slot:bottom>
						<view v-if="isEnd && flowList.length > 0" class="bottom-text">—— 已经到底啦 ——</view>
						<view v-if="flowList.length === 0 && !loading" class="empty-list">
							<up-empty text="暂无游记" mode="search"></up-empty>
					</view>
				</template>
			</up-waterfall>
			</up-transition>
		</view>
		
		<!-- 回到顶部按钮 -->
		<view v-if="showTopBtn" @click="toTop" class="top-btn">
			<up-icon name="arrow-upward" color="#fff" size="28"></up-icon>
		</view>
	</view>
</template>

<script setup>
	import {
		getBanner,
		getHomeList,
		searchTravels
	} from '../../api/api.js'
	import {
		onLoad,
		onReachBottom,
		onPageScroll,
		onPullDownRefresh
	} from '@dcloudio/uni-app'
	import {
		ref,
		reactive,
		onUnmounted
	} from 'vue'
	import { getRequestStatus, cleanStaleRequests, trackedRequest } from '../../api/http.js'

	// 搜索关键词
	const keyword = ref('')
	// 首页轮播图数据
	const bannerList = ref([])
	// 瀑布流数据 
	const flowList = ref([])
	// 是否显示回到顶部
	const showTopBtn = ref(false)
	// 加载状态
	const loading = ref(false)
	// 是否加载完所有数据
	const isEnd = ref(false)
	// 当前页码
	const currentPage = ref(1)
	// 每页大小
	const pageSize = ref(10)
	// 原始数据备份(用于搜索)
	const originalList = ref([])

	// 页面加载
	onLoad(() => {
		// 获取轮播图数据
		fetchBanners()
		// 获取首页游记列表
		fetchTravelList()
	})

	// 获取轮播图
	const fetchBanners = () => {
		getBanner().then(res => {
			if (res && Array.isArray(res)) {
				// 直接返回数组
				bannerList.value = res;
			} else if (res && res.bannerList && Array.isArray(res.bannerList)) {
				// 返回对象中包含bannerList数组
				bannerList.value = res.bannerList;
			} else if (res) {
				// 其他情况，尝试转换为数组格式
				const formattedList = [];
				
				// 如果返回的是单个对象而不是数组
				if (typeof res === 'object' && !Array.isArray(res)) {
					try {
						// 构造默认的banner项目
						const keys = Object.keys(res);
						if (keys.length > 0) {
							// 尝试找到可能的图片URL和标题字段
							let imageField = keys.find(k => 
								k.includes('img') || 
								k.includes('image') || 
								k.includes('url') || 
								k.includes('src')
							) || keys[0];
							
							let titleField = keys.find(k => 
								k.includes('title') || 
								k.includes('name') || 
								k.includes('text')
							) || '';
							
							formattedList.push({
								image: res[imageField] || '',
								title: titleField ? (res[titleField] || '精彩游记') : '精彩游记'
							});
						}
					} catch (e) {
						console.error('处理轮播图数据出错', e);
					}
				}
				
				if (formattedList.length > 0) {
					bannerList.value = formattedList;
				} else {
					// 如果无法处理返回的数据，使用默认轮播图
					bannerList.value = [
						{
							image: '/static/imgg/jzz.jpg',
							title: '记录旅行中的美好瞬间'
						},
						{
							image: '/static/imgg/xz.jpg',
							title: '分享你的精彩游记'
						}
					];
				}
			}
		}).catch(err => {
			console.error('获取轮播图失败', err);
			// 使用默认轮播图
			bannerList.value = [
				{
					image: '/static/imgg/jzz.jpg',
					title: '记录旅行中的美好瞬间'
				},
				{
					image: '/static/imgg/xz.jpg',
					title: '分享你的精彩游记'
				}
			];
			
			uni.showToast({
				title: '获取轮播图失败',
				icon: 'none'
			});
		});
	}

	// 获取游记列表
	const fetchTravelList = (isRefresh = false) => {
		if (loading.value) return
		
		// 请求前先检查状态
		const requestStatus = getRequestStatus()
		if (!isRefresh && requestStatus.activeCount >= 2) {
			// 清理过期请求
			cleanStaleRequests()
			// 如果不是刷新操作且活跃请求数仍然过多，延迟加载
			setTimeout(() => {
				fetchTravelList(isRefresh)
			}, 1000)
			return
		}
		
		loading.value = true
		
		if (isRefresh) {
			currentPage.value = 1
			isEnd.value = false
		}
		
		// 使用trackedRequest跟踪API请求
		trackedRequest(
			() => getHomeList(currentPage.value, pageSize.value),
			{ url: '/travels', method: 'GET', params: { page: currentPage.value, pageSize: pageSize.value } }
		)
			.then(res => {
				if (res && res.list && Array.isArray(res.list)) {
					if (isRefresh) {
						flowList.value = []
						originalList.value = [...res.list]
					} else {
						originalList.value = [...originalList.value, ...res.list]
					}
					
					// 如果是搜索状态，则过滤数据
					if (keyword.value) {
						handleSearch()
					} else {
						if (isRefresh) {
							flowList.value = [...res.list]
						} else {
							flowList.value = [...flowList.value, ...res.list]
						}
					}
					
					// 判断是否还有更多数据
					if (!res.hasMore) {
						isEnd.value = true
					} else {
						currentPage.value++
					}
				} else {
					isEnd.value = true
				}
			})
			.catch(err => {
				console.error('获取游记列表失败', err)
				uni.showToast({
					title: '获取游记列表失败',
					icon: 'none'
				})
			})
			.finally(() => {
				loading.value = false
				uni.stopPullDownRefresh()
			})
	}

	// 搜索功能
	const handleSearch = () => {
		if (!keyword.value.trim()) {
			resetSearch()
			return
		}
		
		// 如果已经在搜索中，则不重复搜索
		if (loading.value) return
		
		// 检查请求状态
		const requestStatus = getRequestStatus()
		if (requestStatus.activeCount >= 2) {
			// 请求数量已达上限，先清理过期请求
			const cleaned = cleanStaleRequests()
		}
		
		// 本地搜索 - 从原始数据中搜索
		if (originalList.value.length > 0) {
			// 本地搜索，不用发请求
			const key = keyword.value.toLowerCase()
			flowList.value = originalList.value.filter(item => {
				// 游记标题搜索
				const titleMatch = item.title && item.title.toLowerCase().includes(key)
				// 作者昵称搜索
				const authorMatch = item.nick && item.nick.toLowerCase().includes(key)
				// 内容搜索
				const contentMatch = item.introduce && item.introduce.toLowerCase().includes(key)
				
				return titleMatch || authorMatch || contentMatch
			})
			
			// 如果本地搜索结果为空，发起远程搜索
			if (flowList.value.length === 0) {
				remoteSearch()
			}
		} else {
			// 原始数据为空，直接远程搜索
			remoteSearch()
		}
	}

	// 远程搜索 - 调用API
	const remoteSearch = () => {
		loading.value = true
		
		// 使用trackedRequest跟踪搜索请求
		trackedRequest(
			() => searchTravels(keyword.value, 1, 20),
			{ url: '/travels/search', method: 'GET', params: { keyword: keyword.value } }
		)
			.then(res => {
				if (res && res.list && Array.isArray(res.list)) {
					flowList.value = res.list
					// 如果结果为空，显示提示
					if (flowList.value.length === 0) {
						uni.showToast({
							title: '没有找到相关游记',
							icon: 'none'
						})
					}
				} else {
					flowList.value = []
					uni.showToast({
						title: '搜索结果为空',
						icon: 'none'
					})
				}
			})
			.catch(err => {
				console.error('搜索失败', err)
				// 搜索失败，显示错误提示
				uni.showToast({
					title: '搜索失败，请重试',
					icon: 'none'
				})
			})
			.finally(() => {
				loading.value = false
			})
	}

	// 定义防抖函数
	let searchTimer = null
	const debounceSearch = (func, delay = 800) => {  // 增加延迟时间，减少请求次数
		// 清除之前的定时器
		if (searchTimer) clearTimeout(searchTimer)
		
		// 设置新的定时器
		searchTimer = setTimeout(() => {
			func()
		}, delay)
	}

	// 重置搜索
	const resetSearch = () => {
		keyword.value = ''
		flowList.value = [...originalList.value]
	}

	// 下拉刷新
	onPullDownRefresh(() => {
		fetchTravelList(true)
	})

	// 触底加载更多 - 添加防抖
	let loadMoreTimer = null
	onReachBottom(() => {
		if (!isEnd.value && !keyword.value) {
			// 清除之前的定时器
			if (loadMoreTimer) clearTimeout(loadMoreTimer)
			
			// 设置加载更多的定时器，避免频繁触发
			loadMoreTimer = setTimeout(() => {
				fetchTravelList()
			}, 300)
		}
	})

	// 页面滚动监听（显示回到顶部按钮）
	onPageScroll((e) => {
		showTopBtn.value = e.scrollTop > 600
	})
	
	// 回到顶部
	const toTop = () => {
		uni.pageScrollTo({
			scrollTop: 0,
			duration: 300
		})
	}

	// 跳转到游记详情页
	const goDetail = (item) => {
		uni.navigateTo({
			url: `/pages/detail/detail?id=${item.id}`
		})
	}

	// 在组件卸载时清除定时器
	onUnmounted(() => {
		if (searchTimer) {
			clearTimeout(searchTimer)
			searchTimer = null
		}
		
		if (loadMoreTimer) {
			clearTimeout(loadMoreTimer)
			loadMoreTimer = null
		}
	})
</script>

<style lang="scss">
	.content {
		padding: 20rpx;
		padding-bottom: 100rpx;
		background-color: #f8f8f8;
	}
	
	.search-box {
		margin-bottom: 20rpx;
		transition: all 0.3s;
		
		&:active {
			transform: scale(0.98);
		}
	}

	.list {
		margin: 30rpx 0;
		position: relative;
		min-height: 300rpx;
		
		.loading-wrapper {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			z-index: 9;
		}

		.travel-card {
			margin: 10rpx 10rpx 20rpx;
			background-color: #fff;
			border-radius: 16rpx;
			padding: 20rpx;
			box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
			transition: all 0.2s;
			
			&:active {
				transform: scale(0.97);
				opacity: 0.9;
				box-shadow: 0 1rpx 5rpx rgba(0,0,0,0.03);
			}
		}

		.travel-title {
			font-size: 32rpx;
			margin: 16rpx 0;
			color: #303133;
			font-weight: 500;
			line-height: 1.4;
		}
		
		.travel-image {
			width: 100%;
			border-radius: 10rpx;
			overflow: hidden;
		}
		
		.user-info {
			display: flex;
			align-items: center;
			margin-top: 16rpx;
			
			.up-avatar {
				margin-right: 16rpx;
			}
		}
		
		.empty-list {
			padding: 60rpx 0;
		}
		
		.bottom-text {
			text-align: center;
			color: #909399;
			font-size: 24rpx;
			padding: 30rpx 0;
		}
	}
	
	.top-btn {
		position: fixed;
		bottom: 120rpx;
		right: 30rpx;
		background-color: rgba(0,0,0,0.5);
		padding: 20rpx;
		width: 44rpx;
		height: 44rpx;
		border-radius: 40rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 99;
		transition: all 0.3s;
		
		&:active {
			transform: scale(0.9);
			opacity: 0.8;
		}
	}
	
	// 动画效果
	.fade-enter-active, .fade-leave-active {
		transition: opacity 0.3s;
	}
	.fade-enter, .fade-leave-to {
		opacity: 0;
	}
	
	.fade-up-enter-active, .fade-up-leave-active {
		transition: all 0.5s;
	}
	.fade-up-enter, .fade-up-leave-to {
		opacity: 0;
		transform: translateY(30rpx);
	}
	
	.list-enter-active, .list-leave-active {
		transition: all 0.3s;
	}
	.list-enter, .list-leave-to {
		opacity: 0;
		transform: translateY(20rpx);
	}
</style>
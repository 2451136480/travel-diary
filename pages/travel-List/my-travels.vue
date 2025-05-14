<template>
  <view class="container">
    <!-- 顶部标题栏 -->
    <view class="header">
      <text class="title">我的游记</text>
    </view>

    <!-- 状态切换选项卡 -->
    <view class="tabs">
      <view 
        v-for="(tab, index) in tabs" 
        :key="index"
        class="tab-item"
        :class="{ active: currentTab === index }"
        @click="changeTab(index)"
      >
        <text>{{ tab.name }}</text>
        <text class="badge" v-if="tab.count > 0">{{ tab.count }}</text>
      </view>
    </view>

    <!-- 游记列表内容 -->
    <scroll-view 
      scroll-y 
      class="travel-list" 
      @scrolltolower="loadMoreData"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 空状态提示 -->
      <view v-if="filteredList.length === 0 && !loading" class="empty-state">
        <up-empty 
          mode="list" 
          :text="emptyText"
        ></up-empty>
        <button class="create-btn" @click="createTravel">立即发布游记</button>
      </view>

      <!-- 游记列表 -->
      <view v-else class="list-content">
        <view 
          v-for="item in filteredList" 
          :key="item.id" 
          class="travel-card"
        >
          <!-- 状态标签 -->
          <view class="status-tag" :class="statusClass[item.status]">
            {{ statusMap[item.status] }}
          </view>

          <!-- 游记内容预览 -->
          <view class="card-content">
            <!-- 游记图片 -->
            <view class="travel-image">
              <image 
                :src="item.images && item.images.length > 0 ? item.images[0] : '/static/imgg/default.jpg'" 
                mode="aspectFill"
                lazy-load
              ></image>
            </view>

            <!-- 游记信息 -->
            <view class="travel-info">
              <view class="travel-title" @click="viewTravelDetail(item)">{{ item.title }}</view>
              <view class="travel-time">{{ formatDate(item.createTime) }}</view>
              
              <!-- 拒绝原因(未通过) -->
              <view v-if="item.status === 2" class="reject-reason">
                <text class="reason-label">拒绝原因：</text>
                <text class="reason-content">{{ item.rejectReason || '内容不符合规范' }}</text>
              </view>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="action-buttons">
            <button 
              class="action-btn edit" 
              v-if="[0, 2].includes(item.status)" 
              @click="editTravel(item)"
            >编辑</button>
            <button 
              class="action-btn delete" 
              @click="handleDeleteTravel(item)"
            >删除</button>
          </view>
        </view>

        <!-- 加载状态 -->
        <view v-if="loading" class="loading">
          <up-loading-icon size="30" color="#8a8a8a"></up-loading-icon>
        </view>
        <view v-if="!loading && !hasMore && filteredList.length > 0" class="no-more">
          - 已经到底了 -
        </view>
      </view>
    </scroll-view>

    <!-- 悬浮发布按钮 -->
    <view class="float-btn" @click="createTravel">
      <up-icon name="plus" color="#ffffff" size="30"></up-icon>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getMyTravels, deleteTravel } from '../../api/api.js';
import { user } from '../../api/http.js';

// 状态映射
const statusMap = {
  0: '待审核',
  1: '已通过',
  2: '未通过'
};

const statusClass = {
  0: 'pending',
  1: 'approved',
  2: 'rejected'
};

// 选项卡定义
const tabs = ref([
  { name: '全部', status: -1, count: 0 },
  { name: '待审核', status: 0, count: 0 },
  { name: '已通过', status: 1, count: 0 },
  { name: '未通过', status: 2, count: 0 },
]);

// 当前选中的选项卡
const currentTab = ref(0);

// 游记列表
const travelList = ref([]);
const loading = ref(false);
const refreshing = ref(false);
const hasMore = ref(true);
const currentPage = ref(1);
const pageSize = ref(10);

// 定时器
let loadMoreTimer = null;

// 请求状态管理
const activeRequests = ref([]);

// 获取请求状态信息
const getRequestStatus = () => {
  // 清理超过30秒的过期请求
  const now = Date.now();
  activeRequests.value = activeRequests.value.filter(req => (now - req.timestamp) < 30000);
  
  return {
    activeCount: activeRequests.value.length,
    requests: [...activeRequests.value]
  };
};

// 清理过期请求
const cleanStaleRequests = () => {
  const now = Date.now();
  const prevCount = activeRequests.value.length;
  
  // 清理超过10秒的请求
  activeRequests.value = activeRequests.value.filter(req => (now - req.timestamp) < 10000);
  
  return prevCount - activeRequests.value.length;
};

// 检查登录状态
const checkLoginStatus = () => {
  if (!user.checkLogin()) {
    uni.showModal({
      title: '提示',
      content: '请先登录',
      showCancel: false,
      success: () => {
        // 使用user工具中的goLogin方法
        user.goLogin('/pages/travel-List/my-travels');
      }
    });
    return false;
  }
  return true;
};

// 获取状态对应的游记数量
const calculateTabCounts = () => {
  tabs.value.forEach((tab, index) => {
    if (index === 0) {
      tab.count = travelList.value.length;
    } else {
      tab.count = travelList.value.filter(item => item.status === tab.status).length;
    }
  });
};

// 获取当前选项卡过滤后的列表
const filteredList = computed(() => {
  if (currentTab.value === 0) {
    return travelList.value;
  } else {
    const status = tabs.value[currentTab.value].status;
    return travelList.value.filter(item => item.status === status);
  }
});

// 空状态提示文本
const emptyText = computed(() => {
  const tabName = tabs.value[currentTab.value].name;
  return `暂无${tabName}游记`;
});

// 切换选项卡
const changeTab = (index) => {
  if (currentTab.value === index) return;
  
  currentTab.value = index;
  // 切换选项卡后重新加载
  refreshing.value = true;
  currentPage.value = 1;
  fetchMyTravels(true);
};

// 格式化日期显示
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 记录API请求
const trackedRequest = async (requestFn, reqInfo) => {
  // 添加到活跃请求列表
  const requestId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const requestInfo = {
    id: requestId,
    ...reqInfo,
    timestamp: Date.now()
  };
  
  activeRequests.value.push(requestInfo);
  
  try {
    const result = await requestFn();
    return result;
  } finally {
    // 请求完成后从活跃列表中移除
    activeRequests.value = activeRequests.value.filter(req => req.id !== requestId);
  }
};

// 获取我的游记列表
const fetchMyTravels = async (isRefresh = false) => {
  if (!checkLoginStatus() || loading.value) return;
  
  // 检查请求状态并清理过期请求
  const requestStatus = getRequestStatus();
  if (requestStatus.activeCount >= 2) {
    cleanStaleRequests();
  }
  
  loading.value = true;
  
  if (isRefresh) {
    currentPage.value = 1;
    hasMore.value = true;
  }
  
  try {
    // 获取当前状态筛选
    const status = currentTab.value !== 0 ? tabs.value[currentTab.value].status : undefined;
    
    // 调用API获取数据并跟踪请求
    const res = await trackedRequest(
      () => getMyTravels(status, currentPage.value, pageSize.value),
      { url: '/travels/my', method: 'GET', params: { status, page: currentPage.value } }
    );
    
    // 处理返回的数据
    if (res && res.list && Array.isArray(res.list)) {
      // 首次加载或刷新，替换数据
      if (isRefresh) {
        travelList.value = res.list;
      } else {
        // 加载更多，追加数据
        travelList.value = [...travelList.value, ...res.list];
      }
      
      // 判断是否还有更多数据
      hasMore.value = res.hasMore === true;
      
      // 计算各状态数量
      calculateTabCounts();
    } else {
      // 处理空数据
      if (isRefresh) {
        travelList.value = [];
      }
      hasMore.value = false;
    }
  } catch (error) {
    console.error('[我的游记] 获取游记列表失败', error);
    uni.showToast({
      title: '获取列表失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
    refreshing.value = false;
    uni.stopPullDownRefresh();
  }
};

// 查看游记详情
const viewTravelDetail = (item) => {
  // 已通过的游记才可查看详情
  if (item.status === 1) {
    uni.navigateTo({
      url: `/pages/detail/detail?id=${item.id}`
    });
  } else {
    uni.showToast({
      title: '游记审核中，暂不可查看',
      icon: 'none'
    });
  }
};

// 编辑游记
const editTravel = (item) => {
  if ([0, 2].includes(item.status)) {
    uni.navigateTo({
      url: `/pages/travel-edit/travel-edit?id=${item.id}`
    });
  }
};

// 删除游记
const handleDeleteTravel = (item) => {
  uni.showModal({
    title: '确认删除',
    content: '确定删除该游记吗？删除后不可恢复',
    success: async (res) => {
      if (res.confirm) {
        try {
          // 检查网络请求状态
          const requestStatus = getRequestStatus();
          if (requestStatus.activeCount >= 2) {
            // 清理可能存在的过期请求
            cleanStaleRequests();
          }
          
          // 调用删除接口并跟踪请求
          await trackedRequest(
            () => deleteTravel(item.id),
            { url: `/travels/${item.id}`, method: 'DELETE' }
          );
          
          // 从列表中移除
          travelList.value = travelList.value.filter(travel => travel.id !== item.id);
          
          // 重新计算选项卡数量
          calculateTabCounts();
          
          uni.showToast({
            title: '删除成功'
          });
        } catch (error) {
          console.error('[我的游记] 删除失败', error);
          uni.showToast({
            title: '删除失败',
            icon: 'none'
          });
        }
      }
    }
  });
};

// 创建新游记
const createTravel = () => {
  if (!checkLoginStatus()) return;
  
  uni.navigateTo({
    url: '/pages/travel-edit/travel-edit'
  });
};

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true;
  fetchMyTravels(true);
};

// 加载更多
const loadMoreData = () => {
  if (hasMore.value && !loading.value) {
    // 清除之前的计时器
    if (loadMoreTimer) clearTimeout(loadMoreTimer);
    
    // 延迟执行，防止频繁触发
    loadMoreTimer = setTimeout(() => {
      currentPage.value++;
      fetchMyTravels();
    }, 300);
  }
};

// 页面显示时自动刷新
onShow(() => {
  // 检查是否需要强制刷新
  const needRefresh = uni.getStorageSync('needRefreshTravelList');
  if (needRefresh) {
    console.log('[我的游记] 检测到刷新标记，强制刷新数据');
    // 清除标记
    uni.removeStorageSync('needRefreshTravelList');
    // 刷新数据
    refreshing.value = true;
    currentPage.value = 1;
    fetchMyTravels(true);
  } else {
    // 正常刷新
    fetchMyTravels(true);
  }
});

// 页面加载
onMounted(() => {
  checkLoginStatus();
});

// 清理定时器
onUnmounted(() => {
  if (loadMoreTimer) {
    clearTimeout(loadMoreTimer);
    loadMoreTimer = null;
  }
});
</script>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f8f8;
}

.header {
  padding: 30rpx;
  background-color: #ffffff;

  .title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
  }
}

.tabs {
  display: flex;
  background-color: #ffffff;
  border-bottom: 1rpx solid #eee;
  padding: 0 20rpx;

  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24rpx 0;
    position: relative;
    font-size: 28rpx;
    color: #666;

    &.active {
      color: #3B7CFF;
      font-weight: 500;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 4rpx;
        background-color: #3B7CFF;
        border-radius: 2rpx;
      }
    }

    .badge {
      background-color: #ff5252;
      color: #fff;
      font-size: 20rpx;
      border-radius: 20rpx;
      padding: 2rpx 10rpx;
      margin-left: 8rpx;
      min-width: 30rpx;
      text-align: center;
    }
  }
}

.travel-list {
  flex: 1;
  width: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;

  .create-btn {
    margin-top: 40rpx;
    background-color: #3B7CFF;
    color: #fff;
    border-radius: 40rpx;
    padding: 20rpx 60rpx;
    font-size: 28rpx;
  }
}

.list-content {
  padding: 20rpx;
}

.travel-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.status-tag {
  position: absolute;
  right: 20rpx;
  top: 20rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  z-index: 1;
  color: #fff;

  &.pending {
    background-color: #faad14;
  }

  &.approved {
    background-color: #52c41a;
  }

  &.rejected {
    background-color: #f5222d;
  }
}

.card-content {
  display: flex;
  padding: 20rpx;
}

.travel-image {
  width: 200rpx;
  height: 140rpx;
  margin-right: 20rpx;
  border-radius: 8rpx;
  overflow: hidden;

  image {
    width: 100%;
    height: 100%;
  }
}

.travel-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 140rpx;
}

.travel-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 10rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.travel-time {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.reject-reason {
  font-size: 24rpx;
  color: #f5222d;
  background-color: rgba(245, 34, 45, 0.05);
  padding: 10rpx;
  border-radius: 4rpx;
  margin-top: 10rpx;

  .reason-label {
    font-weight: 500;
  }

  .reason-content {
    font-weight: 400;
  }
}

.action-buttons {
  display: flex;
  padding: 20rpx;
  border-top: 1rpx solid #f0f0f0;

  .action-btn {
    margin: 0 10rpx;
    background-color: transparent;
    font-size: 26rpx;
    padding: 10rpx 30rpx;
    border-radius: 30rpx;
    border: 1rpx solid;

    &.edit {
      border-color: #3B7CFF;
      color: #3B7CFF;
    }

    &.delete {
      border-color: #f5222d;
      color: #f5222d;
    }
  }
}

.loading, .no-more {
  text-align: center;
  padding: 30rpx 0;
  color: #999;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    margin-left: 10rpx;
  }
}

.float-btn {
  position: fixed;
  right: 30rpx;
  bottom: 100rpx;
  width: 100rpx;
  height: 100rpx;
  background-color: #3B7CFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(59, 124, 255, 0.5);
  z-index: 99;
}
</style> 
<template>
  <view class="container">
    <!-- 页面标题 -->
    <view class="page-header">
      <view class="back-btn" @click="goBack">
        <up-icon name="arrow-left" size="22" color="#333"></up-icon>
      </view>
      <text class="title">{{ isEdit ? '编辑游记' : '发布游记' }}</text>
      <view class="right-placeholder"></view>
    </view>

    <!-- 表单内容 -->
    <scroll-view scroll-y class="form-content">
      <!-- 标题输入 -->
      <view class="form-item">
        <view class="label">
          <text class="required">*</text>
          <text>标题</text>
        </view>
        <input
          class="input-field"
          v-model="form.title"
          placeholder="请输入游记标题"
          maxlength="50"
        />
        <view class="counter">{{ form.title.length }}/50</view>
      </view>

      <!-- 内容输入 -->
      <view class="form-item">
        <view class="label">
          <text class="required">*</text>
          <text>内容</text>
        </view>
        <textarea
          class="textarea-field"
          v-model="form.content"
          placeholder="分享你的旅行见闻和感受..."
          maxlength="5000"
          auto-height
        />
        <view class="counter">{{ form.content.length }}/5000</view>
      </view>

      <!-- 图片上传 -->
      <view class="form-item">
        <view class="label">
          <text class="required">*</text>
          <text>图片</text>
          <text class="tip">(至少上传1张图片，最多9张)</text>
        </view>
        <view class="upload-container">
          <view 
            v-for="(img, index) in form.images" 
            :key="index" 
            class="image-preview"
          >
            <image :src="img.url" mode="aspectFill"></image>
            <view class="delete-icon" @click="deleteImage(index)">
              <up-icon name="close" size="20" color="#fff"></up-icon>
            </view>
          </view>
          
          <view 
            v-if="form.images.length < 9" 
            class="upload-btn" 
            @click="chooseImage"
          >
            <up-icon name="camera-fill" size="30" color="#999"></up-icon>
            <text>上传图片</text>
          </view>
        </view>
      </view>

      <!-- 视频上传 -->
      <view class="form-item">
        <view class="label">
          <text>视频</text>
          <text class="tip">(可选，最多1个)</text>
        </view>
        
        <view class="upload-container">
          <view v-if="form.video" class="video-preview">
            <video :src="form.video" controls class="video-player"></video>
            <view class="delete-icon" @click="removeVideo">
              <up-icon name="close" size="20" color="#fff"></up-icon>
            </view>
          </view>
          
          <view 
            v-if="!form.video" 
            class="upload-btn" 
            @click="chooseVideo"
          >
            <up-icon name="videocam" size="30" color="#999"></up-icon>
            <text>上传视频</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="footer">
      <button 
        class="submit-btn" 
        :disabled="loading" 
        @click="submitForm"
      >
        <text>{{ isEdit ? '保存修改' : '发布游记' }}</text>
        <up-loading-icon v-if="loading" size="20" color="#fff"></up-loading-icon>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { getTravelDetail, publishTravel, updateTravel, uploadImage, uploadVideo } from '../../api/api.js';
import { getRequestStatus, cleanStaleRequests, user } from '../../api/http.js';

// 检查登录状态
const checkLoginStatus = () => {
  if (!user.checkLogin()) {
    uni.showModal({
      title: '提示',
      content: '请先登录',
      showCancel: false,
      success: () => {
        // 使用user服务中的goLogin方法
        user.goLogin('/pages/travel-edit/travel-edit');
      }
    });
    return false;
  }
  return true;
};

// 表单数据
const form = reactive({
  id: '',
  title: '',
  content: '',
  images: [],
  video: '',
});

// 控制状态
const loading = ref(false);
const isEdit = ref(false);

// 页面加载
onLoad((options) => {
  if (!checkLoginStatus()) return;
  
  if (options.id) {
    isEdit.value = true;
    fetchTravelDetail(options.id);
  }
});

// 获取游记详情
const fetchTravelDetail = async (id) => {
  try {
    loading.value = true;
    
    const res = await getTravelDetail(id);
    
    if (res) {
      // 填充表单
      Object.keys(res).forEach(key => {
        if (key in form) {
          form[key] = res[key];
        }
      });
    }
    
  } catch (error) {
    console.error('获取游记详情失败', error);
    uni.showToast({
      title: '获取详情失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 返回上一页
const goBack = () => {
  // 如果已有内容，提示用户是否放弃编辑
  if (form.title || form.content || form.images.length > 0 || form.video) {
    uni.showModal({
      title: '提示',
      content: '是否放弃当前编辑内容？',
      success: (res) => {
        if (res.confirm) {
          uni.navigateBack();
        }
      }
    });
  } else {
    uni.navigateBack();
  }
};

// 选择图片
const chooseImage = () => {
  // 检查当前请求队列状态
  const requestStatus = getRequestStatus();
  
  // 如果活跃请求数接近限制，提示用户稍后再试
  if (requestStatus.activeCount >= 2) {
    uni.showToast({
      title: '当前网络请求较多，请稍后再试',
      icon: 'none',
      duration: 2000
    });
    return;
  }
  
  uni.chooseImage({
    count: 9 - form.images.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      // 处理选中的图片
      handleSelectedImages(res.tempFilePaths);
    }
  });
};

// 处理选中的图片
const handleSelectedImages = async (tempFilePaths) => {
  if (!tempFilePaths || !tempFilePaths.length) return;
  
  const images = [...form.images];
  
  // 显示上传中状态
  for (let i = 0; i < tempFilePaths.length; i++) {
    if (images.length < 9) {
      images.push({
        url: tempFilePaths[i],
        status: 'uploading',
        progress: 0
      });
    }
  }
  
  form.images = images;
  
  // 显示全局上传提示
  uni.showLoading({
    title: '准备上传...',
    mask: true
  });
  
  // 串行上传图片，避免并发过多
  for (let i = 0; i < tempFilePaths.length; i++) {
    const index = form.images.findIndex(img => img.url === tempFilePaths[i] && img.status === 'uploading');
    if (index === -1) continue;
    
    try {
      // 更新上传进度提示
      uni.showLoading({
        title: `上传第${i+1}/${tempFilePaths.length}张`,
        mask: true
      });
      
      // 上传前检查队列状态，可能需要等待
      if (i > 0) {
        // 每上传一张图片后，延迟一小段时间再上传下一张
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 清理可能的过期请求
        cleanStaleRequests();
      }
      
      // 上传图片
      const result = await uploadImage(tempFilePaths[i]);
      
      // 更新图片数组
      form.images[index] = {
        url: result.url,
        status: 'success'
      };
      
    } catch (error) {
      console.error('图片上传失败', error);
      
      // 更新失败状态
      form.images[index] = {
        url: tempFilePaths[i],
        status: 'error',
        message: '上传失败'
      };
      
      // 显示错误提示
      uni.showToast({
        title: '部分图片上传失败',
        icon: 'none',
        duration: 2000
      });
    }
  }
  
  // 隐藏加载提示
  uni.hideLoading();
  
  // 上传完成提示
  if (tempFilePaths.length > 0) {
    uni.showToast({
      title: '图片上传完成',
      icon: 'success'
    });
  }
};

// 删除图片
const deleteImage = (index) => {
  uni.showModal({
    title: '提示',
    content: '确定删除这张图片吗？',
    success: (res) => {
      if (res.confirm) {
        form.images.splice(index, 1);
      }
    }
  });
};

// 预览图片
const previewImage = (index) => {
  const urls = form.images
    .filter(img => img.status !== 'error')
    .map(img => img.url);
  
  if (urls.length) {
    uni.previewImage({
      current: index,
      urls
    });
  }
};

// 选择视频
const chooseVideo = () => {
  // 检查当前请求队列状态
  const requestStatus = getRequestStatus();
  
  // 如果活跃请求数接近限制，提示用户稍后再试
  if (requestStatus.activeCount >= 2) {
    uni.showToast({
      title: '当前网络请求较多，请稍后再试',
      icon: 'none',
      duration: 2000
    });
    return;
  }
  
  uni.chooseVideo({
    sourceType: ['album', 'camera'],
    maxDuration: 60,
    camera: 'back',
    compressed: true,
    success: (res) => {
      // 检查视频大小
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (res.size > maxSize) {
        return uni.showToast({
          title: '视频不能超过50MB',
          icon: 'none'
        });
      }
      
      // 处理视频
      handleSelectedVideo(res.tempFilePath);
    }
  });
};

// 处理选中的视频
const handleSelectedVideo = async (tempFilePath) => {
  try {
    uni.showLoading({
      title: '准备上传视频...',
      mask: true
    });
    
    // 设置状态
    form.video = {
      url: tempFilePath,
      status: 'uploading',
      progress: 0
    };
    
    // 清理可能的过期请求
    cleanStaleRequests();
    
    // 创建上传提示
    const uploadTip = setInterval(() => {
      form.video.progress += 5;
      if (form.video.progress > 95) {
        form.video.progress = 95;
      }
      
      uni.showLoading({
        title: `视频上传中 ${form.video.progress}%`,
        mask: true
      });
    }, 1000);
    
    // 调用上传接口
    const result = await uploadVideo(tempFilePath);
    
    // 清除上传提示定时器
    clearInterval(uploadTip);
    
    // 设置视频URL
    form.video = result.url;
    
    uni.hideLoading();
    
    uni.showToast({
      title: '视频上传成功',
      icon: 'success'
    });
    
  } catch (error) {
    console.error('视频处理失败', error);
    uni.hideLoading();
    
    // 重置视频状态
    form.video = '';
    
    uni.showToast({
      title: '视频上传失败',
      icon: 'none'
    });
  }
};

// 删除视频
const removeVideo = () => {
  uni.showModal({
    title: '提示',
    content: '确定删除视频吗？',
    success: (res) => {
      if (res.confirm) {
        form.video = '';
      }
    }
  });
};

// 表单验证
const validateForm = () => {
  if (!form.title.trim()) {
    uni.showToast({
      title: '请输入游记标题',
      icon: 'none'
    });
    return false;
  }
  
  if (!form.content.trim()) {
    uni.showToast({
      title: '请输入游记内容',
      icon: 'none'
    });
    return false;
  }
  
  // 检查图片是否全部上传成功
  const hasUploadingImages = form.images.some(img => img.status === 'uploading');
  if (hasUploadingImages) {
    uni.showToast({
      title: '请等待图片上传完成',
      icon: 'none'
    });
    return false;
  }
  
  const hasErrorImages = form.images.some(img => img.status === 'error');
  if (hasErrorImages) {
    uni.showModal({
      title: '提示',
      content: '有图片上传失败，是否继续提交？',
      success: (res) => {
        if (res.confirm) {
          // 移除上传失败的图片
          form.images = form.images.filter(img => img.status !== 'error');
          return true;
        }
      }
    });
    return false;
  }
  
  return true;
};

// 提交表单
const submitForm = async () => {
  if (!validateForm()) return;
  
  loading.value = true;
  
  try {
    // 准备提交的数据
    const submitData = {
      title: form.title,
      content: form.content,
      images: form.images.map(img => img.url), // 提取URL
      video: form.video
    };
    
    let result;
    
    if (isEdit.value) {
      // 更新游记
      result = await updateTravel(form.id, submitData);
    } else {
      // 发布新游记
      result = await publishTravel(submitData);
    }
    
    uni.showToast({
      title: isEdit.value ? '修改成功' : '发布成功',
      icon: 'success',
      duration: 2000,
      success: () => {
        // 设置一个标记表示需要刷新
        uni.setStorageSync('needRefreshTravelList', true);
        
        // 延迟返回，让用户看到提示
        setTimeout(() => {
          // 使用reLaunch而不是switchTab，以确保页面会重新加载
          uni.reLaunch({
            url: '/pages/travel-List/my-travels'
          });
        }, 1000);
      }
    });
    
  } catch (error) {
    console.error('提交失败', error);
    uni.showToast({
      title: error.msg || '提交失败，请重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 页面显示时检查登录
onShow(() => {
  checkLoginStatus();
});

// 页面加载完成
onMounted(() => {
  checkLoginStatus();
});
</script>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f8f8;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 90rpx;
  padding: 0 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
  
  .title {
    font-size: 34rpx;
    font-weight: 600;
  }
  
  .back-btn {
    padding: 16rpx;
    margin-left: -16rpx;
  }
  
  .right-placeholder {
    width: 44rpx;
  }
}

.form-content {
  flex: 1;
  padding: 30rpx;
}

.form-item {
  margin-bottom: 40rpx;
  background-color: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  position: relative;
  
  .label {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    color: #333;
    font-size: 28rpx;
    font-weight: 500;
    
    .required {
      color: #f5222d;
      margin-right: 4rpx;
    }
    
    .tip {
      font-size: 24rpx;
      color: #999;
      font-weight: normal;
      margin-left: 16rpx;
    }
  }
  
  .counter {
    position: absolute;
    right: 24rpx;
    bottom: 24rpx;
    font-size: 24rpx;
    color: #999;
  }
}

.input-field {
  width: 100%;
  height: 80rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.textarea-field {
  width: 100%;
  min-height: 300rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;
  padding: 24rpx;
  font-size: 28rpx;
  line-height: 1.6;
}

.upload-container {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10rpx;
}

.image-preview, .video-preview {
  width: calc(33.33% - 20rpx);
  height: 180rpx;
  margin: 10rpx;
  position: relative;
  border-radius: 8rpx;
  overflow: hidden;
  
  image, .video-player {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .delete-icon {
    position: absolute;
    top: 8rpx;
    right: 8rpx;
    width: 40rpx;
    height: 40rpx;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.video-preview {
  width: calc(66.66% - 20rpx);
  height: 300rpx;
}

.upload-btn {
  width: calc(33.33% - 20rpx);
  height: 180rpx;
  margin: 10rpx;
  background-color: #f8f8f8;
  border: 1px dashed #ddd;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 24rpx;
  
  text {
    margin-top: 16rpx;
  }
}

.footer {
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;
  
  .submit-btn {
    width: 100%;
    height: 90rpx;
    background-color: #3B7CFF;
    color: #fff;
    font-size: 32rpx;
    font-weight: 500;
    border-radius: 45rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    text {
      margin-right: 8rpx;
    }
    
    &[disabled] {
      background-color: #a0bfff;
    }
  }
}
</style> 
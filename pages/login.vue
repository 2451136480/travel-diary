<template>
  <div class="login-container">
    <div class="login-box">
      <div class="avatar-upload" @click="onAvatarClick">
        <img :src="avatarUrl" class="avatar-img" />
        <div class="avatar-tip">点击上传头像</div>
        <input ref="avatarInput" type="file" accept="image/*" @change="onAvatarChange" style="display:none" />
      </div>
      <div class="tab-switch">
        <span :class="{active: isLogin}" @click="switchTab(true)">登录</span>
        <span :class="{active: !isLogin}" @click="switchTab(false)">注册</span>
      </div>
      
      <div v-if="errorMsg" class="error-message">
        {{ errorMsg }}
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="input-group">
          <input v-model="form.username" type="text" placeholder="请输入用户名" required />
        </div>
        <div v-if="!isLogin" class="input-group">
          <input v-model="form.nickname" type="text" placeholder="请输入昵称" required @blur="checkNickname" />
          <span v-if="nicknameStatus === 'checking'" class="nickname-tip">校验中...</span>
          <span v-if="nicknameStatus === 'duplicate'" class="nickname-tip error">昵称已存在</span>
          <span v-if="nicknameStatus === 'ok'" class="nickname-tip success">昵称可用</span>
        </div>
        <div class="input-group">
          <input v-model="form.password" type="password" placeholder="请输入密码" required />
        </div>
        
        <!-- 记住登录选项 -->
        <div v-if="isLogin" class="remember-login">
          <label class="checkbox-label">
            <input type="checkbox" v-model="rememberLogin" />
            <span>记住登录状态</span>
          </label>
        </div>
        
        <button class="login-btn" type="button" @click="handleSubmit" :disabled="loading || (nicknameStatus==='duplicate' && !isLogin)">
          {{ isLogin ? '登录' : '注册' }}
          <span v-if="loading" class="loading-spinner"></span>
        </button>
        
        <!-- 快速登录按钮 -->
        <div class="quick-login">
          <button type="button" class="quick-btn" @click="quickLogin('admin')">管理员登录</button>
          <button type="button" class="quick-btn" @click="quickLogin('tourist')">游客登录</button>
        </div>
      </form>
      
      <div v-if="debugInfo" class="debug-info">
        <p>调试信息: {{ debugInfo }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { login, register, checkNickname as checkNicknameApi, uploadAvatar } from '../api/api.js'

const isLogin = ref(true)
const loading = ref(false)
const form = reactive({
  username: '',
  password: '',
  nickname: '',
})
const rememberLogin = ref(false)
const nicknameStatus = ref('') // '', 'checking', 'duplicate', 'ok'
const avatarUrl = ref('/static/headimg/zm.jpg')
const avatarInput = ref(null)
const router = useRouter()
const errorMsg = ref('')
const debugInfo = ref('')

onMounted(() => {
  console.log('登录组件已加载')
  debugInfo.value = '组件已加载'
  
  // 检查是否有记住的登录状态
  checkSavedLogin()
})

// 检查保存的登录状态
function checkSavedLogin() {
  try {
    const savedLogin = uni.getStorageSync('savedLogin')
    if (savedLogin) {
      const loginData = JSON.parse(savedLogin)
      // 如果有过期时间且未过期
      if (loginData.expireTime && new Date(loginData.expireTime) > new Date()) {
        // 自动填充用户名和密码
        form.username = loginData.username
        form.password = loginData.password
        rememberLogin.value = true
        
        // 询问是否自动登录
        uni.showModal({
          title: '自动登录',
          content: `是否以 ${loginData.username} 身份自动登录？`,
          success: (res) => {
            if (res.confirm) {
              // 自动执行登录
              handleSubmit()
            }
          }
        })
      } else {
        // 已过期，清除存储
        uni.removeStorageSync('savedLogin')
      }
    }
  } catch (error) {
    console.error('检查已保存登录状态失败', error)
  }
}

function switchTab(loginMode) {
  isLogin.value = loginMode
  errorMsg.value = ''
  debugInfo.value = `切换到${loginMode ? '登录' : '注册'}模式`
}

// 快速登录 - 使用预设账号
function quickLogin(userType) {
  if (loading.value) return
  
  switch(userType) {
    case 'admin':
      form.username = 'admin'
      form.password = '123456'
      break
    case 'tourist':
      form.username = 'tourist'
      form.password = '123456'
      break
    default:
      return
  }
  
  debugInfo.value = `快速登录 - ${userType}`
  handleSubmit()
}

// 头像上传
function onAvatarClick() {
  avatarInput.value && avatarInput.value.click()
  debugInfo.value = '点击头像上传'
}

async function onAvatarChange(e) {
  if (!e.target.files || !e.target.files.length) return
  
  const file = e.target.files[0]
  
  // 在web环境下，转为临时URL显示
  avatarUrl.value = URL.createObjectURL(file)
  
  debugInfo.value = '已选择头像'
  
  // 在真实环境中，这里应该调用上传API
  try {
    // 小程序环境下会直接调用上传接口
    // const result = await uploadAvatar(file.path)
    // avatarUrl.value = result.avatarUrl
  } catch (error) {
    console.error('头像上传失败', error)
  }
}

// 校验昵称是否重复
async function checkNickname() {
  if (!form.nickname) return
  
  nicknameStatus.value = 'checking'
  debugInfo.value = '正在校验昵称...'
  
  try {
    const result = await checkNicknameApi(form.nickname)
    
    // API返回的是 duplicate: true/false
    if (result && result.duplicate === false) {
      nicknameStatus.value = 'ok'
      debugInfo.value = '昵称可用'
    } else {
      nicknameStatus.value = 'duplicate'
      debugInfo.value = '昵称已存在'
    }
  } catch (error) {
    console.error('昵称校验失败', error)
    nicknameStatus.value = ''
    debugInfo.value = '昵称校验失败: ' + (error.message || error)
  }
}

// 处理表单提交
function handleSubmit() {
  debugInfo.value = '点击了提交按钮'
  console.log('提交表单', form)
  
  if (!form.username || !form.password || (!isLogin.value && !form.nickname)) {
    errorMsg.value = '请填写所有必填项'
    return
  }
  
  onSubmit() // 调用实际提交逻辑
}

async function onSubmit() {
  if (loading.value) return
  loading.value = true
  errorMsg.value = ''
  debugInfo.value = isLogin.value ? '登录中...' : '注册中...'
  
  try {
    if (isLogin.value) {
      // 登录请求
      const loginData = {
        username: form.username,
        password: form.password
      }
      
      debugInfo.value = `尝试登录：${loginData.username}`
      
      try {
        const result = await login(loginData)
        
        // 存储token和用户信息
        uni.setStorageSync('token', result.token)
        uni.setStorageSync('userInfo', JSON.stringify({
          userId: result.userId,
          username: result.username,
          nickname: result.nickname,
          avatarUrl: result.avatarUrl
        }))
        
        // 如果选择了"记住登录"，保存登录信息
        if (rememberLogin.value) {
          // 保存7天
          const expireTime = new Date()
          expireTime.setDate(expireTime.getDate() + 7)
          
          uni.setStorageSync('savedLogin', JSON.stringify({
            username: form.username,
            password: form.password,
            expireTime: expireTime.toISOString()
          }))
          
          debugInfo.value = '已保存登录状态'
        } else {
          // 如果未选择记住登录，清除之前可能保存的信息
          uni.removeStorageSync('savedLogin')
        }
        
        // 登录成功后跳转
        uni.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500,
          success: () => {
            setTimeout(() => {
              // 检查是否有登录后需要跳转的页面
              const redirectUrl = uni.getStorageSync('loginRedirect');
              console.log('[登录页] 检查重定向地址:', redirectUrl);
              
              if (redirectUrl) {
                // 清除跳转记录
                uni.removeStorageSync('loginRedirect');
                
                // 判断是否是tabBar页面
                if (['/pages/index/index', '/pages/travel-List/my-travels', '/pages/my/my'].includes(redirectUrl)) {
                  console.log('[登录页] 跳转到TabBar页面:', redirectUrl);
                  uni.switchTab({
                    url: redirectUrl,
                    fail: (err) => {
                      console.error('[登录页] 跳转失败:', err);
                      // 跳转失败时回退到默认页面
                      uni.switchTab({ url: '/pages/my/my' });
                    }
                  });
                } else {
                  console.log('[登录页] 跳转到普通页面:', redirectUrl);
                  uni.navigateTo({
                    url: redirectUrl,
                    fail: (err) => {
                      console.error('[登录页] 跳转失败:', err);
                      // 跳转失败时回退到默认页面
                      uni.switchTab({ url: '/pages/my/my' });
                    }
                  });
                }
              } else {
                // 默认跳转到个人中心
                console.log('[登录页] 无重定向地址，跳转到个人中心');
                uni.switchTab({
                  url: '/pages/my/my'
                });
              }
            }, 1500);
          }
        })
        
        debugInfo.value = '登录成功，跳转中...'
      } catch (loginError) {
        console.error('登录失败', loginError)
        errorMsg.value = loginError.msg || '用户名或密码错误'
        debugInfo.value = '登录失败: ' + (loginError.msg || '未知错误')
      }
    } else {
      // 注册请求
      if (nicknameStatus.value === 'duplicate') {
        errorMsg.value = '昵称已存在，请更换'
        debugInfo.value = '注册失败：昵称重复'
        loading.value = false
        return
      }
      
      const registerData = {
        username: form.username,
        password: form.password,
        nickname: form.nickname,
        avatarUrl: avatarUrl.value
      }
      
      const result = await register(registerData)
      
      // 注册成功，切换到登录页
      uni.showToast({
        title: '注册成功',
        icon: 'success'
      })
      
      debugInfo.value = '注册成功'
      
      // 切换到登录
      setTimeout(() => {
        isLogin.value = true
        errorMsg.value = '注册成功，请登录'
        form.password = ''
      }, 1500)
    }
  } catch (error) {
    console.error('请求出错:', error)
    errorMsg.value = error.msg || '网络错误，请稍后再试'
    debugInfo.value = '请求出错: ' + (error.message || JSON.stringify(error))
  } finally {
    loading.value = false
  }
}

// 添加标题点击处理
let titleClickCount = 0;
let titleClickTimer = null;

const handleTitleClick = () => {
  titleClickCount++;
  
  // 清除之前的定时器
  if (titleClickTimer) clearTimeout(titleClickTimer);
  
  // 如果是双击
  if (titleClickCount >= 2) {
    toggleDataMode();
    titleClickCount = 0;
  }
  
  // 设置重置点击计数的定时器
  titleClickTimer = setTimeout(() => {
    titleClickCount = 0;
  }, 500);
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: #e3f0ff;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.login-box {
  width: 320px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(80, 112, 255, 0.08);
  padding: 32px 20px 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.avatar-upload {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 18px;
  position: relative;
  box-shadow: 0 2px 8px 0 rgba(80, 112, 255, 0.10);
  cursor: pointer;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-tip {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: rgba(0,0,0,0.35);
  color: #fff;
  font-size: 12px;
  text-align: center;
  padding: 2px 0;
}
.tab-switch {
  display: flex;
  width: 100%;
  justify-content: center;
  margin-bottom: 18px;
}
.tab-switch span {
  font-size: 16px;
  color: #506fff;
  margin: 0 28px;
  cursor: pointer;
  padding: 8px 32px;
  border: 2px solid #fff;
  border-radius: 20px;
  background: #fff;
  transition: all 0.2s;
  box-sizing: border-box;
  font-weight: 500;
  box-shadow: 0 2px 8px 0 rgba(80, 112, 255, 0.04);
}
.tab-switch .active {
  color: #fff;
  background: linear-gradient(90deg, #506fff 60%, #7c3aed 100%);
  border: 2px solid #506fff;
  box-shadow: 0 4px 16px 0 rgba(80, 112, 255, 0.10);
}
.input-group {
  width: 100%;
  margin-bottom: 16px;
}
.input-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  transition: border 0.2s;
}
.input-group input:focus {
  border: 1.5px solid #506fff;
}
.nickname-tip {
  font-size: 12px;
  margin-left: 6px;
  color: #a1a1aa;
}
.nickname-tip.error {
  color: #ef4444;
}
.nickname-tip.success {
  color: #22c55e;
}
.login-btn {
  width: 100%;
  background: linear-gradient(90deg, #506fff 60%, #7c3aed 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 0;
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  opacity: 1;
}
.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-left: 6px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.error-message {
  width: 100%;
  color: #ef4444;
  font-size: 14px;
  margin-bottom: 12px;
  text-align: center;
}
.debug-info {
  margin-top: 12px;
  font-size: 12px;
  color: #666;
  text-align: center;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.remember-login {
  display: flex;
  width: 100%;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 16px;
  font-size: 14px;
  color: #555;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-label input {
  margin-right: 6px;
}

.quick-login {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  gap: 12px;
}

.quick-btn {
  background: rgba(80, 111, 255, 0.15);
  color: #506fff;
  border: 1px solid rgba(80, 111, 255, 0.3);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover, .quick-btn:active {
  background: rgba(80, 111, 255, 0.25);
}
</style> 
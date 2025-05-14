import http from "./http.js"
import mockData from "./mockData/pageApi.js"

// 当前是否使用模拟数据
const useMock = true

/**
 * 初始化函数
 */
// 初始化样本数据
export const initSampleData = () => {
	if (useMock) {
		console.log('正在初始化模拟数据...');
		
		// 检查是否已经初始化过
		const hasInitialized = uni.getStorageSync('mockDataInitialized');
		if (hasInitialized) {
			console.log('模拟数据已初始化，无需重复操作');
			return;
		}
		
		// 初始化预设用户列表
		const presetUsers = [
			{
				userId: 'user_1',
				username: 'admin',
				password: '123456',
				nickname: '管理员',
				avatarUrl: '/static/headimg/zm.jpg',
				role: 'admin',
				createdAt: '2023-01-01T00:00:00.000Z'
			},
			{
				userId: 'user_2',
				username: 'test',
				password: 'test',
				nickname: '测试用户',
				avatarUrl: '/static/headimg/zm.jpg',
				role: 'user',
				createdAt: '2023-01-02T00:00:00.000Z'
			},
			{
				userId: 'user_3',
				username: 'tourist',
				password: '123456',
				nickname: '游客',
				avatarUrl: '/static/headimg/zm.jpg',
				role: 'user',
				createdAt: '2023-01-03T00:00:00.000Z'
			}
		];
		
		// 存储预设用户列表（实际应用中应该加密存储密码）
		uni.setStorageSync('userList', JSON.stringify(presetUsers));
		
		// 标记已初始化
		uni.setStorageSync('mockDataInitialized', true);
		console.log('模拟数据初始化完成');
	} else {
		console.log('使用真实API，无需初始化模拟数据');
	}
}

/**
 * 用户模块接口
 */

// 用户注册
export const register = (userData) => {
	// 使用模拟数据
	if (useMock) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				// 基础验证
				if (!userData.username || !userData.password || !userData.nickname) {
					return reject({ code: -1, msg: '用户名、密码和昵称不能为空' });
				}
				
				// 获取现有用户列表
				const userListStr = uni.getStorageSync('userList') || '[]';
				const userList = JSON.parse(userListStr);
				
				// 检查用户名是否已存在
				const existingUser = userList.find(u => u.username === userData.username);
				if (existingUser) {
					return reject({ code: -1, msg: '用户名已被注册' });
				}
				
				// 检查昵称是否已存在
				const existingNickname = userList.find(u => u.nickname === userData.nickname);
				if (existingNickname) {
					return reject({ code: -1, msg: '昵称已被使用' });
				}
				
				// 创建新用户
				const newUser = {
					userId: 'user_' + Date.now(),
					username: userData.username,
					password: userData.password, // 实际应用中应该加密密码
					nickname: userData.nickname,
					avatarUrl: userData.avatarUrl || '/static/headimg/zm.jpg',
					role: 'user',
					createdAt: new Date().toISOString()
				};
				
				// 添加到用户列表并保存
				userList.push(newUser);
				uni.setStorageSync('userList', JSON.stringify(userList));
				
				// 返回成功结果（不包含密码）
				const { password, ...userWithoutPassword } = newUser;
				resolve(userWithoutPassword);
			}, 800);
		});
	}
	
	return http('/user/register', userData, 'POST');
}

// 用户登录
export const login = (userData) => {
	// 使用模拟数据
	if (useMock) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				// 基础验证
				if (!userData.username || !userData.password) {
					return reject({ code: -1, msg: '用户名和密码不能为空' });
				}
				
				// 获取用户列表
				const userListStr = uni.getStorageSync('userList') || '[]';
				const userList = JSON.parse(userListStr);
				
				// 查找匹配的用户
				const user = userList.find(u => 
					u.username === userData.username && 
					u.password === userData.password
				);
				
				if (user) {
					// 登录成功，生成token并返回用户信息（不包含密码）
					const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2);
					const { password, ...userWithoutPassword } = user;
					
					// 记录登录状态
					const loginRecord = {
						userId: user.userId,
						loginTime: new Date().toISOString(),
						token: token
					};
					
					// 保存登录记录
					const loginRecords = JSON.parse(uni.getStorageSync('loginRecords') || '[]');
					loginRecords.push(loginRecord);
					uni.setStorageSync('loginRecords', JSON.stringify(loginRecords));
					
					resolve({
						...userWithoutPassword,
						token
					});
				} else {
					// 登录失败
					reject({ code: -1, msg: '用户名或密码错误' });
				}
			}, 300); // 缩短延迟时间，提升用户体验
		});
	}
	
	return http('/user/login', userData, 'POST');
}

// 获取用户信息
export const getUserInfo = () => {
	// 使用模拟数据
	if (useMock) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const token = uni.getStorageSync('token');
				if (!token) {
					return reject({ code: -1, msg: '未登录' });
				}
				
				// 从本地存储获取用户信息
				const userInfoStr = uni.getStorageSync('userInfo');
				if (!userInfoStr) {
					return reject({ code: -1, msg: '用户信息不存在' });
				}
				
				try {
					const userInfo = JSON.parse(userInfoStr);
					resolve(userInfo);
				} catch (error) {
					reject({ code: -1, msg: '用户信息解析失败' });
				}
			}, 200);
		});
	}
	
	return http('/user/info');
}

// 更新用户信息
export const updateUserInfo = (userData) => {
	return http('/user/update', userData, 'PUT')
}

// 昵称重复校验
export const checkNickname = (nickname) => {
	// 使用模拟数据
	if (useMock) {
		return new Promise((resolve) => {
			setTimeout(() => {
				// 获取用户列表
				const userListStr = uni.getStorageSync('userList') || '[]';
				const userList = JSON.parse(userListStr);
				
				// 检查昵称是否已存在
				const existingUser = userList.find(u => u.nickname === nickname);
				
				resolve({ duplicate: !!existingUser });
			}, 300);
		});
	}
	
	return http('/user/check-nickname', { nickname }, 'GET');
}

// 头像上传
export const uploadAvatar = (filePath) => {
	return http('/user/upload-avatar', { file: filePath }, 'POST', true)
}

/**
 * 游记模块接口
 */

// 获取首页轮播图
export const getBanner = () => {
	// 使用模拟数据
	if (useMock) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const mockResponse = mockData.getBanner();
				resolve(mockResponse.data.bannerList);
			}, 500); // 模拟网络延迟
		});
	}
	return http('/banner', {}, 'GET')
}

// 获取首页游记列表
export const getHomeList = (page = 1, pageSize = 10) => {
	// 使用模拟数据
	if (useMock) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const mockResponse = mockData.getHomeList();
				// 分页处理
				const totalList = mockResponse.data || [];
				const startIndex = (page - 1) * pageSize;
				const endIndex = startIndex + pageSize;
				const list = totalList.slice(startIndex, endIndex);
				// 判断是否还有更多数据
				const hasMore = endIndex < totalList.length;
				
				resolve({
					list,
					hasMore,
					total: totalList.length
				});
			}, 800); // 模拟网络延迟
		});
	}
	return http('/travels', { page, pageSize }, 'GET')
}

// 获取我的游记列表
export const getMyTravels = (status, page = 1, pageSize = 10) => {
	// 使用模拟数据
	if (useMock) {
		return new Promise((resolve) => {
			setTimeout(() => {
				// 获取本地存储的游记列表
				let travelsList = [];
				try {
					const travelsListStr = uni.getStorageSync('travelsList');
					if (travelsListStr) {
						travelsList = JSON.parse(travelsListStr);
					}
				} catch (e) {
					console.error('获取本地游记列表失败', e);
				}
				
				// 如果没有本地数据，回退到使用模拟数据
				if (!travelsList || travelsList.length === 0) {
					console.log('[getMyTravels] 本地无数据，使用模拟数据');
					const mockResponse = mockData.getHomeList();
					travelsList = mockResponse.data || [];
					
					// 修改模拟数据，添加状态和时间
					travelsList = travelsList.map((item, index) => {
						const itemStatus = index % 3;
						return {
							...item,
							status: status !== undefined ? status : itemStatus,
							createTime: new Date().toISOString(),
							updateTime: new Date().toISOString()
						};
					});
				}
				
				// 只保留当前用户的游记
				const userInfoStr = uni.getStorageSync('userInfo');
				if (userInfoStr) {
					try {
						const userInfo = JSON.parse(userInfoStr);
						if (userInfo && userInfo.userId) {
							travelsList = travelsList.filter(item => 
								item.userId === userInfo.userId || 
								(item.author && item.author.id === userInfo.userId)
							);
						}
					} catch (e) {
						console.error('过滤用户游记失败', e);
					}
				}
				
				// 如果传入了状态参数，进行过滤
				if (status !== undefined) {
					travelsList = travelsList.filter(item => item.status === status);
				}
				
				// 分页处理
				const startIndex = (page - 1) * pageSize;
				const endIndex = startIndex + pageSize;
				const pagedList = travelsList.slice(startIndex, endIndex);
				
				// 判断是否还有更多数据
				const hasMore = endIndex < travelsList.length;
				
				console.log(`[getMyTravels] 获取成功，共${travelsList.length}条，当前页${pagedList.length}条`);
				
				resolve({
					list: pagedList,
					hasMore,
					total: travelsList.length
				});
			}, 400); // 加快响应速度
		});
	}
	
	const params = { page, pageSize }
	if (status !== undefined) {
		params.status = status
	}
	return http('/travels/my', params, 'GET')
}

// 获取游记详情
export const getTravelDetail = (id) => {
	// 使用模拟数据
	if (useMock) {
		return new Promise((resolve) => {
			setTimeout(() => {
				// 查找对应ID的游记
				const mockResponse = mockData.getHomeList();
				const allTravels = mockResponse.data || [];
				const travel = allTravels.find(item => item.id == id) || allTravels[0];
				
				// 添加更多细节
				const detailTravel = {
					...travel,
					content: `这是一篇关于${travel.title}的详细游记内容。这里是游记的详细描述，包括旅行的心得体会和感受。\n\n${travel.introduce || ''}`,
					createTime: new Date().toISOString(),
					updateTime: new Date().toISOString(),
					viewCount: Math.floor(Math.random() * 1000),
					likeCount: Math.floor(Math.random() * 100),
					commentCount: Math.floor(Math.random() * 50),
					images: [travel.img, '/static/imgg/jzz.jpg', '/static/imgg/xz.jpg'].filter(Boolean),
					video: Math.random() > 0.5 ? '/static/imgg/VID20240125174947.mp4' : '',
					author: {
						id: 1,
						nickname: travel.nick || '旅行者',
						avatar: travel.head || '/static/headimg/zm.jpg'
					}
				};
				
				resolve(detailTravel);
			}, 700);
		});
	}
	return http(`/travels/${id}`, {}, 'GET')
}

// 删除游记
export const deleteTravel = (id) => {
	if (useMock) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({ success: true, message: '删除成功' });
			}, 500);
		});
	}
	return http(`/travels/${id}`, {}, 'DELETE')
}

// 发布游记
export const publishTravel = (travelData) => {
	if (useMock) {
		return new Promise((resolve) => {
			setTimeout(() => {
				// 创建新游记数据
				const newTravel = { 
					id: 'travel_' + Date.now(),
					...travelData,
					createTime: new Date().toISOString(),
					updateTime: new Date().toISOString(),
					status: 0, // 待审核状态
					author: {}, // 作者信息将从userInfo获取
					likeCount: 0,
					viewCount: 0,
					commentCount: 0
				};
				
				// 获取当前用户信息
				try {
					const userInfoStr = uni.getStorageSync('userInfo');
					if (userInfoStr) {
						const userInfo = JSON.parse(userInfoStr);
						newTravel.author = {
							id: userInfo.userId,
							nickname: userInfo.nickname,
							avatar: userInfo.avatarUrl
						};
						// 添加作者标识
						newTravel.userId = userInfo.userId;
						newTravel.nick = userInfo.nickname;
						newTravel.head = userInfo.avatarUrl;
					}
				} catch (e) {
					console.error('获取用户信息失败', e);
				}
				
				// 获取当前存储的游记列表
				try {
					const travelsListStr = uni.getStorageSync('travelsList') || '[]';
					const travelsList = JSON.parse(travelsListStr);
					
					// 将新游记添加到列表开头
					travelsList.unshift(newTravel);
					
					// 保存回本地存储
					uni.setStorageSync('travelsList', JSON.stringify(travelsList));
					
					console.log('[发布游记] 成功添加到本地存储');
				} catch (e) {
					console.error('保存游记列表失败', e);
				}
				
				// 返回新游记数据
				resolve(newTravel);
			}, 800); // 减少延迟时间提升体验
		});
	}
	return http('/travels', travelData, 'POST');
}

// 更新游记
export const updateTravel = (id, travelData) => {
	if (useMock) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({ 
					id,
					...travelData,
					updateTime: new Date().toISOString(),
					status: 0 // 更新后重新变为待审核状态
				});
			}, 800);
		});
	}
	return http(`/travels/${id}`, travelData, 'PUT')
}

// 搜索游记
export const searchTravels = (keyword, page = 1, pageSize = 10) => {
	if (useMock) {
		return new Promise((resolve) => {
			setTimeout(() => {
				// 从模拟数据中搜索
				const mockResponse = mockData.getHomeList();
				const allTravels = mockResponse.data || [];
				
				// 简单的关键词匹配
				const filteredList = allTravels.filter(item => 
					(item.title && item.title.includes(keyword)) || 
					(item.introduce && item.introduce.includes(keyword)) ||
					(item.nick && item.nick.includes(keyword))
				);
				
				// 分页处理
				const startIndex = (page - 1) * pageSize;
				const endIndex = startIndex + pageSize;
				const pagedList = filteredList.slice(startIndex, endIndex);
				
				// 判断是否还有更多数据
				const hasMore = endIndex < filteredList.length;
				
				resolve({
					list: pagedList,
					hasMore,
					total: filteredList.length
				});
			}, 700);
		});
	}
	return http('/travels/search', { keyword, page, pageSize }, 'GET')
}

/**
 * 上传接口
 */

// 上传图片
export const uploadImage = (filePath) => {
	if (useMock) {
		return new Promise((resolve) => {
			// 模拟上传延迟
			setTimeout(() => {
				// 返回一个模拟的图片URL
				const mockImages = [
					'/static/imgg/jzz.jpg',
					'/static/imgg/xz.jpg',
					'/static/imgg/deng.jpg',
					'/static/imgg/glm.jpg',
					'/static/imgg/bigben.jpg',
					'/static/imgg/ssds.jpg'
				];
				const randomIndex = Math.floor(Math.random() * mockImages.length);
				resolve({ 
					url: mockImages[randomIndex],
					width: 800,
					height: 600
				});
			}, 1000);
		});
	}
	return http('/upload/image', { file: filePath }, 'POST', true)
}

// 上传视频
export const uploadVideo = (filePath) => {
	if (useMock) {
		return new Promise((resolve) => {
			// 模拟上传延迟
			setTimeout(() => {
				// 返回一个模拟的视频URL
				resolve({ 
					url: '/static/imgg/VID20240125174947.mp4',
					duration: 15,
					size: 1024 * 1024 * 5 // 5MB
				});
			}, 2000);
		});
	}
	return http('/upload/video', { file: filePath }, 'POST', true)
}
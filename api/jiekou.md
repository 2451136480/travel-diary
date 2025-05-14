
# 旅游日记平台API接口文档

## 一、基本说明

- 基础URL：`/api`
- 数据格式：所有请求和响应均使用JSON格式
- 认证方式：Bearer Token（登录后获取token，后续请求在Header中携带）
- 错误码说明：
  - `0`: 成功
  - `1000`: 参数错误
  - `1001`: 未登录/token无效
  - `1002`: 权限不足
  - `1003`: 资源不存在
  - `1004`: 资源已存在
  - `2000`: 服务器内部错误

## 二、用户接口

### 1.1 用户注册

**请求路径：** `/api/user/register`  
**请求方法：** POST  
**接口说明：** 用户注册接口  

**请求参数：**

```json
{
  "username": "user123",      // 用户名，必填
  "password": "123456",       // 密码，必填
  "nickname": "旅行者",       // 昵称，必填
  "avatarUrl": "/static/default.jpg"  // 头像URL，可选
}
```

**响应结果：**

```json
{
  "code": 0,                  // 状态码：0-成功，其他-失败
  "msg": "注册成功",          // 状态信息
  "data": {
    "userId": "5f9a1b1b1b1b1b1b1b1b1b1b",  // 用户ID
    "username": "user123",    // 用户名
    "nickname": "旅行者",     // 昵称
    "avatarUrl": "/static/default.jpg"    // 头像URL
  }
}
```

### 1.2 用户登录

**请求路径：** `/api/user/login`  
**请求方法：** POST  
**接口说明：** 用户登录接口  

**请求参数：**

```json
{
  "username": "user123",      // 用户名，必填
  "password": "123456"        // 密码，必填
}
```

**响应结果：**

```json
{
  "code": 0,                  // 状态码：0-成功，其他-失败
  "msg": "登录成功",          // 状态信息
  "data": {
    "userId": "5f9a1b1b1b1b1b1b1b1b1b1b",  // 用户ID
    "username": "user123",    // 用户名
    "nickname": "旅行者",     // 昵称
    "avatarUrl": "/static/default.jpg",    // 头像URL
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // 登录令牌
  }
}
```

### 1.3 获取用户信息

**请求路径：** `/api/user/info`  
**请求方法：** GET  
**接口说明：** 获取当前登录用户信息  

**请求头：** 

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  // 登录令牌
```

**响应结果：**

```json
{
  "code": 0,                  // 状态码：0-成功，其他-失败
  "msg": "success",           // 状态信息
  "data": {
    "userId": "5f9a1b1b1b1b1b1b1b1b1b1b",  // 用户ID
    "username": "user123",    // 用户名
    "nickname": "旅行者",     // 昵称
    "avatarUrl": "/static/default.jpg"    // 头像URL
  }
}
```

### 1.4 昵称查重

**请求路径：** `/api/user/check-nickname`  
**请求方法：** GET  
**接口说明：** 检查昵称是否可用  

**请求参数：**

```
nickname=旅行者  // 要检查的昵称，URL参数
```

**响应结果：**

```json
{
  "code": 0,                  // 状态码：0-成功，其他-失败
  "msg": "昵称已存在",        // 状态信息
  "data": {
    "duplicate": true         // 是否重复：true-已存在，false-不存在
  }
}
```

## 三、游记接口

### 2.1 获取首页游记列表

**请求路径：** `/api/travel/home-list`  
**请求方法：** GET  
**接口说明：** 获取首页游记列表，分页加载，按时间排序  

**请求参数：**

```
page=1        // 页码，从1开始，默认1
pageSize=10   // 每页条数，默认10
```

**响应结果：**

```json
{
  "code": 0,                  // 状态码：0-成功，其他-失败
  "msg": "success",           // 状态信息
  "data": {
    "list": [
      {
        "id": "5f9a1b1b1b1b1b1b1b1b1b1c",  // 游记ID
        "title": "成都两日游",             // 标题
        "coverImage": "/uploads/images/chengdu1.jpg", // 封面图片（第一张图片）
        "userId": "5f9a1b1b1b1b1b1b1b1b1b1b", // 用户ID
        "nickname": "旅行者小明",          // 用户昵称
        "avatarUrl": "/static/headimg/zm.jpg", // 用户头像
        "createTime": "2023-02-15T08:30:00Z", // 创建时间
        "viewCount": 103,                 // 浏览量
        "likeCount": 25                   // 点赞数
      }
    ],
    "total": 100,             // 总条数
    "hasMore": true           // 是否有更多
  }
}
```

### 2.2 获取我的游记列表

**请求路径：** `/api/travel/my-list`  
**请求方法：** GET  
**接口说明：** 获取当前用户的游记列表，可按状态筛选  

**请求头：** 

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  // 登录令牌
```

**请求参数：**

```
status=0      // 状态：0-待审核，1-已通过，2-未通过，不传则查询全部
page=1        // 页码，从1开始，默认1
pageSize=10   // 每页条数，默认10
```

**响应结果：**

```json
{
  "code": 0,                  // 状态码：0-成功，其他-失败
  "msg": "success",           // 状态信息
  "data": {
    "list": [
      {
        "id": "5f9a1b1b1b1b1b1b1b1b1b1c",  // 游记ID
        "title": "上海一日游",             // 标题
        "coverImage": "/uploads/images/shanghai1.jpg", // 封面图片
        "status": 0,                      // 状态：0-待审核，1-已通过，2-未通过
        "rejectReason": "",               // 拒绝原因（当status=2时）
        "createTime": "2023-04-05T14:20:00Z", // 创建时间
        "updateTime": "2023-04-05T14:20:00Z"  // 更新时间
      }
    ],
    "total": 10,              // 总条数
    "hasMore": false          // 是否有更多
  }
}
```

### 2.3 获取游记详情

**请求路径：** `/api/travel/detail`  
**请求方法：** GET  
**接口说明：** 获取游记详情  

**请求参数：**

```
id=5f9a1b1b1b1b1b1b1b1b1b1c  // 游记ID
```

**响应结果：**

```json
{
  "code": 0,                  // 状态码：0-成功，其他-失败
  "msg": "success",           // 状态信息
  "data": {
    "id": "5f9a1b1b1b1b1b1b1b1b1b1c",  // 游记ID
    "title": "成都两日游",             // 标题
    "content": "成都是一座来了就不想走的城市，这里有美食、熊猫和休闲的生活方式。", // 内容
    "images": [                        // 图片URL数组
      "/uploads/images/chengdu1.jpg",
      "/uploads/images/chengdu2.jpg"
    ],
    "video": "/uploads/videos/chengdu-trip.mp4", // 视频URL
    "userId": "5f9a1b1b1b1b1b1b1b1b1b1b", // 用户ID
    "nickname": "旅行者小明",          // 用户昵称
    "avatarUrl": "/static/headimg/zm.jpg", // 用户头像
    "status": 1,                      // 状态：0-待审核，1-已通过，2-未通过
    "rejectReason": "",               // 拒绝原因（当status=2时）
    "viewCount": 103,                 // 浏览量
    "likeCount": 25,                  // 点赞数
    "commentCount": 8,                // 评论数
    "createTime": "2023-02-15T08:30:00Z", // 创建时间
    "updateTime": "2023-02-15T08:30:00Z"  // 更新时间
  }
}
```

### 2.4 发布游记

**请求路径：** `/api/travel/publish`  
**请求方法：** POST  
**接口说明：** 发布游记  
**Content-Type：** `multipart/form-data`

**请求头：** 

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  // 登录令牌
```

**请求参数：**

```
title: 杭州西湖游记     // 标题，必填
content: 西湖真美，太美了！  // 内容，必填
images: File[]          // 图片文件数组，至少一张，必填
video: File             // 视频文件，可选
```

**响应结果：**

```json
{
  "code": 0,                  // 状态码：0-成功，其他-失败
  "msg": "发布成功，等待审核",  // 状态信息
  "data": {
    "id": "5f9a1b1b1b1b1b1b1b1b1b1c",  // 游记ID
    "title": "杭州西湖游记",           // 标题
    "createTime": "2023-05-20T10:30:00Z" // 创建时间
  }
}
```

### 2.5 编辑游记

**请求路径：** `/api/travel/update`  
**请求方法：** PUT  
**接口说明：** 编辑游记（仅待审核或未通过状态可编辑）  
**Content-Type：** `multipart/form-data`

**请求头：** 

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  // 登录令牌
```

**请求参数：**

```
id: 5f9a1b1b1b1b1b1b1b1b1b1c  // 游记ID，必填
title: 杭州西湖三日游        // 标题，必填
content: 西湖真美，太美了！三天都看不够！ // 内容，必填
images: File[]               // 新增图片文件，选填
video: File                  // 视频文件，选填
deleteImages: ["/uploads/images/old1.jpg"] // 要删除的图片URL，选填
```

**响应结果：**

```json
{
  "code": 0,                  // 状态码：0-成功，其他-失败
  "msg": "更新成功，等待审核",  // 状态信息
  "data": {
    "id": "5f9a1b1b1b1b1b1b1b1b1b1c",  // 游记ID
    "updateTime": "2023-05-21T09:30:00Z" // 更新时间
  }
}
```

### 2.6 删除游记

**请求路径：** `/api/travel/delete`  
**请求方法：** DELETE  
**接口说明：** 删除游记  

**请求头：** 

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  // 登录令牌
```

**请求参数：**

```
id=5f9a1b1b1b1b1b1b1b1b1b1c  // 游记ID
```

**响应结果：**

```json
{
  "code": 0,                  // 状态码：0-成功，其他-失败
  "msg": "删除成功"            // 状态信息
}
```

### 2.7 搜索游记

**请求路径：** `/api/travel/search`  
**请求方法：** GET  
**接口说明：** 搜索游记  

**请求参数：**

```
keyword=成都     // 关键词
page=1          // 页码，从1开始，默认1
pageSize=10     // 每页条数，默认10
```

**响应结果：**

```json
{
  "code": 0,                  // 状态码：0-成功，其他-失败
  "msg": "success",           // 状态信息
  "data": {
    "list": [
      {
        "id": "5f9a1b1b1b1b1b1b1b1b1b1c",  // 游记ID
        "title": "成都两日游",             // 标题
        "coverImage": "/uploads/images/chengdu1.jpg", // 封面图片
        "userId": "5f9a1b1b1b1b1b1b1b1b1b1b", // 用户ID
        "nickname": "旅行者小明",          // 用户昵称
        "avatarUrl": "/static/headimg/zm.jpg", // 用户头像
        "createTime": "2023-02-15T08:30:00Z", // 创建时间
        "viewCount": 103,                 // 浏览量
        "likeCount": 25                   // 点赞数
      }
    ],
    "total": 5,               // 总条数
    "hasMore": false          // 是否有更多
  }
}
```

## 四、状态码说明

| 状态码 | 说明 |
| ----- | ---- |
| 0 | 成功 |
| 1000 | 参数错误 |
| 1001 | 未登录或token无效 |
| 1002 | 权限不足 |
| 1003 | 资源不存在 |
| 1004 | 资源已存在（如用户名、昵称重复） |
| 2000 | 服务器内部错误 |

## 五、数据模型说明

### 用户模型

```javascript
{
  _id: ObjectId,            // MongoDB自动生成的ID
  username: String,         // 用户名，唯一
  password: String,         // 密码（加密存储）
  nickname: String,         // 昵称，唯一
  avatarUrl: String,        // 头像URL
  createTime: Date,         // 创建时间
  updateTime: Date          // 更新时间
}
```

### 游记模型

```javascript
{
  _id: ObjectId,            // MongoDB自动生成的ID
  title: String,            // 游记标题
  content: String,          // 游记内容
  images: [String],         // 图片URL数组
  video: String,            // 视频URL（单视频）
  userId: ObjectId,         // 关联用户ID
  status: Number,           // 审核状态：0-待审核，1-已通过，2-未通过
  rejectReason: String,     // 拒绝原因（当status=2时）
  viewCount: Number,        // 浏览量
  likeCount: Number,        // 点赞数
  commentCount: Number,     // 评论数
  createTime: Date,         // 创建时间
  updateTime: Date          // 更新时间
}
```

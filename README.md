# 停车场管理系统前端 (Parking Management System Frontend)

基于 Vue.js 2.x 的停车场管理系统前端界面。

## 项目简介

本项目是停车场管理系统的前端部分，提供：
- 车辆记录查询和管理界面
- MQTT 实时消息测试
- Square 支付管理
- 车牌识别图片上传
- 数据可视化展示

## 运行环境要求

### 1. Node.js 环境
- **Node.js 版本**: 14.x 或以上（推荐 16.x/18.x）
- **npm 版本**: 6.x 或以上
- **下载地址**: https://nodejs.org/
- **验证安装**:
  ```bash
  node -v
  npm -v
  ```

## 技术栈

- **框架**: Vue.js 2.6.14
- **UI 组件库**: Element UI 2.15.13
- **路由**: Vue Router 3.5.1
- **状态管理**: Vuex 3.6.2
- **HTTP 客户端**: Axios 0.27.2
- **国际化**: Vue I18n 8.27.2
- **CSS 预处理器**: Sass
- **构建工具**: Vue CLI 5.0

## 安装和运行

### 1. 克隆项目

```bash
git clone https://github.com/sgy00411/Parking-vue.git
cd Parking-vue
```

### 2. 安装依赖

```bash
npm install
```

如果安装速度慢，可以使用国内镜像：

```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com
npm install
```

### 3. 配置后端 API 地址

编辑 `vue.config.js` 或在项目中查找 API 配置文件，修改后端接口地址：

```javascript
// 示例：修改为你的后端服务地址
const API_BASE_URL = 'http://localhost:8086'
```

### 4. 运行开发服务器

```bash
npm run serve
```

默认访问地址：http://localhost:8080

### 5. 构建生产版本

```bash
npm run build
```

构建后的文件在 `dist` 目录下，可以部署到任何静态文件服务器。

## 项目结构

```
quaer_vue/
├── public/              # 静态资源
│   ├── index.html       # HTML 模板
│   └── favicon.ico      # 网站图标
├── src/
│   ├── assets/          # 资源文件（图片、样式等）
│   ├── components/      # 公共组件
│   ├── views/           # 页面视图
│   ├── router/          # 路由配置
│   ├── store/           # Vuex 状态管理
│   ├── api/             # API 接口
│   ├── utils/           # 工具函数
│   ├── App.vue          # 根组件
│   └── main.js          # 入口文件
├── .gitignore           # Git 忽略文件
├── babel.config.js      # Babel 配置
├── package.json         # 项目配置和依赖
├── vue.config.js        # Vue CLI 配置
└── README.md            # 项目说明
```

## 开发说明

### 代码规范

项目使用 ESLint 进行代码检查：

```bash
npm run lint
```

### 常用依赖说明

- **axios**: 用于与后端 API 通信
- **element-ui**: 提供丰富的 UI 组件
- **vue-router**: 单页面路由管理
- **vuex**: 全局状态管理
- **vue-i18n**: 多语言支持

## 后端接口对接

确保后端服务已启动（默认端口 8086）：

```bash
# 后端项目启动
cd ../quaer_api
mvn spring-boot:run
```

主要 API 接口：
- `GET /api/vehicles` - 获取车辆记录
- `GET /api/vehicles/{id}` - 获取单个车辆记录
- `POST /api/mqtt/send` - 发送 MQTT 消息
- `POST /api/square/terminal/checkout` - 创建支付

## 部署说明

### 方式一：Nginx 部署

1. 构建项目：
   ```bash
   npm run build
   ```

2. 将 `dist` 目录复制到 Nginx 的 `html` 目录

3. 配置 Nginx：
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           root /usr/share/nginx/html;
           index index.html;
           try_files $uri $uri/ /index.html;
       }

       # 代理后端 API
       location /api/ {
           proxy_pass http://localhost:8086;
       }
   }
   ```

### 方式二：使用静态服务器

```bash
# 安装 serve
npm install -g serve

# 运行
serve -s dist -p 8080
```

## 常见问题

### 1. npm install 失败

- 清除缓存：`npm cache clean --force`
- 删除 `node_modules` 和 `package-lock.json` 重新安装
- 使用国内镜像：`npm config set registry https://registry.npmmirror.com`

### 2. 端口被占用

修改开发服务器端口，在 `vue.config.js` 中：

```javascript
module.exports = {
  devServer: {
    port: 8081  // 修改为其他端口
  }
}
```

### 3. API 请求跨域问题

在 `vue.config.js` 中配置代理：

```javascript
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8086',
        changeOrigin: true
      }
    }
  }
}
```

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge
- IE 不支持

## 开发者

- 用户: susu
- 邮箱: 276746009@qq.com

## 相关项目

- 后端项目: [Parking-java](https://github.com/sgy00411/Parking-java)

## 许可

版权所有 © 2025

# KeyGuard

一个现代化的密码管理应用，帮助您安全地存储和管理所有密码。

## 功能特性

- 🔐 安全的密码存储（AES-256-CBC加密）
- 📱 响应式设计，支持多设备
- 🔍 密码搜索功能
- 📁 按分类管理密码
- 🎨 现代化UI设计
- 💾 本地SQLite数据库存储
- 🌐 REST API接口，前后端分离架构
- 🔄 密码强度验证
- 🎲 随机密码生成
- 🔒 主密码认证机制

## 技术栈

### 前端
- React 19
- TypeScript
- Vite
- CryptoJS (密码加密)

### 后端
- Python 3.10+
- Flask
- SQLite
- Flask-CORS

### 脚本
- Batch Script (.bat) - Windows命令行脚本
- PowerShell Script (.ps1) - Windows PowerShell脚本

## 快速开始

### 安装依赖

#### 前端依赖
```bash
cd frontend
npm install
cd ..
```

#### 后端依赖
```bash
python -m pip install -r backend/src/requirements.txt
```

### 启动应用

#### 一键启动（推荐）

**Windows命令行：**
```bash
# 在scripts目录下运行
cd scripts
run-project.bat
```

**PowerShell：**
```powershell
# 在scripts目录下运行
cd scripts
.
un-project.ps1
```

这些脚本将：
1. 检查Python和Node.js是否安装
2. 自动安装缺失的依赖
3. 启动后端服务（端口: 5000）
4. 启动前端开发服务器（端口: 3001）

#### 手动启动（高级用户）

##### 1. 启动后端服务
```bash
cd backend/src
python app.py
```
后端服务将运行在 http://localhost:5000/

##### 2. 启动前端开发服务器
```bash
cd frontend
npm run dev
```
前端应用将运行在 http://localhost:3001/

### 构建生产版本

```bash
cd frontend
npm run build
cd ..
```

构建后的文件将生成在 `frontend/dist` 目录中。

## 项目结构

```
KeyGuard/
├── backend/                  # 后端代码目录
│   ├── data/                # 后端数据目录（包含SQLite数据库文件）
│   └── src/                  # 后端源代码
├── frontend/                 # 前端代码目录
│   └── src/                  # 前端源代码
├── scripts/                  # 脚本文件目录
├── .gitignore                # Git忽略文件
└── README.md                 # 项目说明文档
```

## 安全说明

- 🔒 **密码加密**：使用AES-256-CBC算法加密，带128位盐值和128位IV，确保密码安全
- 🛡️ **主密码保护**：所有密码都使用主密码加密，主密码不会被发送到后端
- 💾 **本地存储**：密码数据存储在本地SQLite数据库中，不会上传到云端
- 📍 **数据库位置**：SQLite数据库文件位于 `backend/data/password_manager.db`
- ⚠️ **注意事项**：
  - 请妥善保管主密码，丢失后无法恢复
  - 建议使用强主密码（包含大小写字母、数字和特殊字符）
  - 定期备份 `backend/data/` 目录中的数据库文件

## 许可证

MIT License
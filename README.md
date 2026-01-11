# KeyGuard

一个安全、现代化的密码管理应用，帮助您安全地存储和管理所有密码。

## 核心功能

- 🔐 **AES-256-CBC加密**：所有密码数据使用强加密算法存储
- 📱 **响应式设计**：支持多设备访问
- 🔍 **快速搜索**：轻松查找存储的密码
- 📁 **分类管理**：按类别组织密码
-  **随机密码生成**：生成强密码
- 🔒 **主密码认证**：安全的身份验证机制
- � **本地存储**：数据存储在本地SQLite数据库中

## 技术栈

### 前端
- React 19 + TypeScript
- Vite
- CryptoJS (密码加密)

### 后端
- Python 3.10+ + Flask
- SQLite
- JWT (身份验证)
- PBKDF2 (密钥派生)

## 快速开始

### 安装依赖

```bash
# 前端依赖
cd frontend
npm install
cd ..

# 后端依赖
python -m pip install -r backend/src/requirements.txt
```

### 启动应用

#### 一键启动（推荐）

**Windows命令行：**
```bash
cd scripts
run-project.bat
```

**PowerShell：**
```powershell
cd scripts
./run-project.ps1
```

这些脚本将自动安装依赖并启动：
- 后端服务（http://localhost:5000）
- 前端开发服务器（http://localhost:3001）

#### 手动启动

```bash
# 启动后端
cd backend/src
python app.py

# 启动前端（新终端）
cd frontend
npm run dev
```

## 安全设计

### 核心安全机制

1. **密码加密**：
   - 前端使用AES-256-CBC算法加密密码数据
   - 每次加密生成新的随机盐值和IV
   - 使用PBKDF2算法从主密码派生加密密钥

2. **认证流程**：
   - 不存储明文主密码
   - 使用PBKDF2算法对主密码进行哈希验证
   - JWT令牌用于API访问控制（30分钟过期）
   - 密码数据在后端以加密形式存储

### 安全注意事项

- ⚠️ **主密码保护**：丢失后无法恢复，请妥善保管
- 🔐 **强密码建议**：使用包含大小写字母、数字和特殊字符的主密码
- 💾 **定期备份**：备份`backend/data/`目录中的数据库文件
- 🔄 **环境配置**：生产环境中使用环境变量配置SECRET_KEY

## 许可证

MIT License

## 重要提示

- 首次使用需要输入邀请码和主密码
- 定期检查密码健康状况，更新弱密码
- 生产环境建议配置HTTPS
- 定期备份数据库文件以防止数据丢失
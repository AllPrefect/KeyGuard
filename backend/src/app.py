from flask import Flask, send_from_directory
from flask_cors import CORS
import os
import sys

# 获取当前脚本所在目录
current_dir = os.path.dirname(os.path.abspath(__file__))

# 添加本地deps目录到Python路径（优先使用本地依赖）
local_deps_dir = os.path.join(current_dir, 'deps')
if os.path.exists(local_deps_dir):
    sys.path.insert(0, local_deps_dir)

# 将当前目录添加到Python路径
sys.path.append(current_dir)

from config.config import config
from utils.db import Database
from utils.log import Logger
from routes.password_routes import password_bp
from routes.auth_routes import auth_bp

# 初始化日志
logger = Logger.get_logger('app')

# 获取当前环境配置
env = os.getenv('FLASK_ENV', 'default')
current_config = config[env]
logger.info(f"加载{env}环境配置")

# 创建Flask应用
app = Flask(__name__)
app.config.from_object(current_config)
logger.info("Flask应用创建完成")

# 允许跨域请求
CORS(app)
logger.info("CORS配置完成")

# 初始化数据库
logger.info("开始初始化数据库...")
Database.init_db()
logger.info("数据库初始化完成")

## 注册蓝图
logger.info("开始注册蓝图...")
app.register_blueprint(password_bp)
app.register_blueprint(auth_bp)
logger.info("蓝图注册完成")

# 健康检查端点
@app.route('/health')
def health_check():
    """健康检查端点"""
    return {'status': 'ok', 'message': 'KeyGuard backend is running'}

# 静态文件服务配置
@app.route('/')
def serve_index():
    """服务前端index.html"""
    # 尝试从frontend/dist目录获取静态文件（分发版本）
    frontend_dist_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend', 'dist')
    # 如果frontend/dist不存在，尝试从根目录的dist目录获取（开发版本）
    if not os.path.exists(frontend_dist_dir):
        frontend_dist_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dist')
    return send_from_directory(frontend_dist_dir, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """服务前端静态文件"""
    # 尝试从frontend/dist目录获取静态文件（分发版本）
    frontend_dist_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend', 'dist')
    # 如果frontend/dist不存在，尝试从根目录的dist目录获取（开发版本）
    if not os.path.exists(frontend_dist_dir):
        frontend_dist_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dist')
    return send_from_directory(frontend_dist_dir, path)

if __name__ == '__main__':
    logger.info(f"KeyGuard后端服务启动，监听端口5000，环境: {env}")
    app.run(debug=current_config.DEBUG, host='0.0.0.0', port=5000, use_reloader=False)

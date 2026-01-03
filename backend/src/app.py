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
from routes.password_routes import password_bp

# 获取当前环境配置
env = os.getenv('FLASK_ENV', 'default')
current_config = config[env]

# 创建Flask应用
app = Flask(__name__)
app.config.from_object(current_config)

# 允许跨域请求
CORS(app)

# 初始化数据库
@app.before_first_request
def init_database():
    Database.init_db()

# 注册蓝图
app.register_blueprint(password_bp)

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
    app.run(debug=current_config.DEBUG, port=5000)

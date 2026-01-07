from flask import Blueprint
from controllers.auth_controller import AuthController
from middleware.auth_middleware import token_required

# 创建认证蓝图
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# 路由定义
auth_bp.route('/master-password', methods=['POST'])(AuthController.authenticate_master_password)
auth_bp.route('/salt', methods=['GET'])(AuthController.get_salt)
auth_bp.route('/verify-token', methods=['GET'])(AuthController.verify_token)
auth_bp.route('/change-password', methods=['POST'])(AuthController.change_master_password)


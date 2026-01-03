from flask import Blueprint
from controllers.password_controller import PasswordController

# 创建蓝图
password_bp = Blueprint('password', __name__, url_prefix='/api/passwords')

# 路由定义
password_bp.route('/', methods=['GET'])(PasswordController.get_all_passwords)
password_bp.route('/<string:password_id>', methods=['GET'])(PasswordController.get_password_by_id)
password_bp.route('/', methods=['POST'])(PasswordController.create_password)
password_bp.route('/<string:password_id>', methods=['PUT'])(PasswordController.update_password)
password_bp.route('/<string:password_id>', methods=['DELETE'])(PasswordController.delete_password)

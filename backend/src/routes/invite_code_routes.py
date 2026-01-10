from flask import Blueprint
from controllers.invite_code_controller import InviteCodeController
from middleware.auth_middleware import token_required

# 创建邀请码管理蓝图
invite_code_bp = Blueprint('invite_code', __name__, url_prefix='/api/invite-codes')

# 路由定义
invite_code_bp.route('/', methods=['POST'])(token_required(InviteCodeController.create_invite_code))
invite_code_bp.route('/', methods=['GET'])(token_required(InviteCodeController.get_all_invite_codes))
invite_code_bp.route('/available', methods=['GET'])(token_required(InviteCodeController.get_available_invite_codes))
invite_code_bp.route('/<code>', methods=['GET'])(token_required(InviteCodeController.get_invite_code))
invite_code_bp.route('/<code>/status', methods=['PUT'])(token_required(InviteCodeController.update_invite_code_status))
invite_code_bp.route('/<code>/revoke', methods=['PUT'])(token_required(InviteCodeController.revoke_invite_code))
invite_code_bp.route('/<code>', methods=['DELETE'])(token_required(InviteCodeController.delete_invite_code))
invite_code_bp.route('/cleanup', methods=['POST'])(token_required(InviteCodeController.cleanup_expired_codes))
invite_code_bp.route('/batch', methods=['POST'])(token_required(InviteCodeController.batch_create_codes))
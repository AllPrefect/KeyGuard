from flask import jsonify, request
from models.user import User
from utils.jwt import JWTUtil
from utils.log import Logger

# 初始化日志
logger = Logger.get_logger('auth_controller')

class AuthController:
    @staticmethod
    def authenticate_master_password():
        """统一认证API：首先尝试登录，如果失败则使用邀请码创建新用户"""
        try:
            logger.info("开始主密码认证")
            data = request.json
            if not data or 'derivedHash' not in data or 'inviteCode' not in data:
                logger.warning("派生哈希值或邀请码缺失")
                return jsonify({'error': 'Missing derived hash or invite code'}), 400
            
            derived_hash = data['derivedHash']
            invite_code = data['inviteCode']
            ip_address = request.remote_addr  # 从请求中获取IP地址
            
            logger.info(f"认证请求 - IP地址: {ip_address}")
            
            # 1. 首先尝试根据password_hash和invite_code查找用户（登录场景）
            query = 'SELECT * FROM users WHERE password_hash = ? AND invite_code = ?'
            from utils.db import Database
            rows = Database.execute_query(query, (derived_hash, invite_code))
            
            if rows:
                # 找到匹配的用户，直接从行数据创建User对象，避免重复查询
                row = rows[0]
                user = User(
                    id=row['id'],
                    username=row['username'],
                    password_hash=row['password_hash'],
                    salt=row['salt'],
                    invite_code=row['invite_code'],
                    created_at=row['created_at'],
                    updated_at=row['updated_at']
                )
                logger.info(f"用户{user.username}主密码验证成功")
                
                # 生成JWT令牌
                token = JWTUtil.generate_token(user.id, user.username, ip_address=ip_address)
                logger.info(f"用户{user.username}认证成功，生成JWT令牌")
                return jsonify({'success': True, 'token': token, 'user': user.to_dict()}), 200
            else:
                # 2. 登录失败，尝试使用邀请码创建新用户
                logger.info(f"登录失败，尝试使用邀请码{invite_code}创建新用户")
                
                # 导入InviteCode模型
                from models.invite_code import InviteCode
                
                # 验证邀请码是否存在且未使用
                invite_code_obj = InviteCode.get_by_code(invite_code)
                if not invite_code_obj:
                    logger.warning(f"邀请码{invite_code}不存在")
                    return jsonify({'success': False, 'error': 'Invite code does not exist'}), 400
                
                if not invite_code_obj.is_valid():
                    logger.warning(f"邀请码{invite_code}无效或已过期")
                    return jsonify({'success': False, 'error': 'Invite code invalid or expired'}), 400
                
                # 3. 从请求中获取盐值
                if 'salt' not in data:
                    logger.warning("盐值缺失")
                    return jsonify({'error': 'Missing salt'}), 400
                
                salt = data['salt']
                
                # 4. 创建用户
                # 由于系统只支持单用户，用户名固定为'admin'
                username = 'admin'
                
                # 创建用户
                user_id = User.create(username, derived_hash, invite_code, salt)
                
                if user_id:
                    # 5. 将邀请码标记为已使用
                    InviteCode.mark_as_used(invite_code)
                    
                    logger.info("主密码创建成功")
                    # 生成JWT令牌
                    token = JWTUtil.generate_token(user_id, username, ip_address=ip_address)
                    logger.info("生成JWT令牌")
                    return jsonify({'success': True, 'token': token}), 200
                else:
                    logger.error("主密码创建失败")
                    return jsonify({'success': False, 'error': 'Failed to create master password'}), 500
                
        except Exception as e:
            logger.exception(f"认证过程发生错误: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    
    @staticmethod
    def get_salt():
        """获取用户盐值"""
        try:
            logger.info("开始获取盐值")
            # TODO: 从数据库中获取用户盐值返回
            
            # 使用User模型的generate_salt方法生成随机盐值
            from models.user import User
            salt = User.generate_salt()
            logger.info("生成随机盐值")
            return jsonify({'success': True, 'salt': salt}), 200
                
        except Exception as e:
            logger.exception(f"获取盐值过程发生错误: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def check_user_exists():
        """检查是否已有用户存在"""
        try:
            logger.info("检查是否已有用户存在")
            
            query = 'SELECT COUNT(*) as count FROM users'
            from utils.db import Database
            result = Database.execute_query(query)
            
            if result:
                count = result[0]['count']
                logger.info(f"当前用户数量: {count}")
                return jsonify({'success': True, 'hasUsers': count > 0}), 200
            else:
                logger.warning("查询用户数量失败")
                return jsonify({'success': False, 'error': 'Failed to check user existence'}), 500
                
        except Exception as e:
            logger.exception(f"检查用户存在状态过程发生错误: {str(e)}")
            return jsonify({'error': str(e)}), 500

    @staticmethod
    def create_master_password():
        """创建主密码"""
        try:
            logger.info("开始创建主密码")
            data = request.json
            if not data or 'derivedHash' not in data or 'salt' not in data or 'inviteCode' not in data:
                logger.warning("派生哈希值、盐值或邀请码缺失")
                return jsonify({'error': 'Missing derived hash, salt, or invite code'}), 400
            
            derived_hash = data['derivedHash']
            salt = data['salt']
            invite_code = data['inviteCode']
            ip_address = request.remote_addr  # 从请求中获取IP地址
            
            logger.info(f"创建主密码请求 - IP地址: {ip_address}")
            
            # 检查邀请码是否已经存在
            query = 'SELECT * FROM users WHERE invite_code = ?'
            from utils.db import Database
            result = Database.execute_query(query, (invite_code,))
            if result:
                logger.warning(f"邀请码{invite_code}已经存在")
                return jsonify({'success': False, 'error': 'Invite code already exists'}), 400
            
            # 创建用户
            # 由于系统只支持单用户，用户名固定为'admin'
            username = 'admin'
            
            # 创建用户
            user_id = User.create(username, derived_hash, salt, invite_code)
            
            if user_id:
                logger.info("主密码创建成功")
                # 生成JWT令牌
                token = JWTUtil.generate_token(user_id, username, ip_address=ip_address)
                logger.info("生成JWT令牌")
                return jsonify({'success': True, 'token': token}), 200
            else:
                logger.error("主密码创建失败")
                return jsonify({'success': False, 'error': 'Failed to create master password'}), 500
                
        except Exception as e:
            logger.exception(f"创建主密码过程发生错误: {str(e)}")
            return jsonify({'error': str(e)}), 500

    @staticmethod
    def verify_token():
        """验证令牌"""
        try:
            token = request.headers.get('Authorization')
            if not token:
                return jsonify({'error': 'Missing token'}), 401
            
            # 移除Bearer前缀
            if token.startswith('Bearer '):
                token = token[7:]
            
            # 验证令牌
            result = JWTUtil.verify_token(token)
            if result['valid']:
                return jsonify({'success': True, 'user_id': result['user_id'], 'username': result['username']}), 200
            else:
                return jsonify({'error': result['error']}), 401
                
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def change_master_password():
        """修改主密码"""
        try:
            logger.info("开始修改主密码操作")
            token = request.headers.get('Authorization')
            if not token:
                logger.warning("修改主密码请求缺少令牌")
                return jsonify({'error': 'Missing token'}), 401
            
            # 移除Bearer前缀
            if token.startswith('Bearer '):
                token = token[7:]
            
            # 验证令牌
            result = JWTUtil.verify_token(token)
            if not result['valid']:
                logger.warning(f"修改主密码令牌验证失败: {result['error']}")
                return jsonify({'error': result['error']}), 401
            
            data = request.json
            if not data or 'oldPassword' not in data or 'newPassword' not in data:
                logger.warning("修改主密码缺少必要字段")
                return jsonify({'error': 'Missing required fields'}), 400
            
            old_password = data['oldPassword']
            new_password = data['newPassword']
            
            # 获取当前用户
            user = User.get_by_id(result['user_id'])
            if not user:
                logger.error(f"修改主密码时未找到用户: {result['user_id']}")
                return jsonify({'error': 'User not found'}), 404
            
            logger.info(f"用户{user.username}尝试修改主密码")
            
            # 验证旧密码
            if not user.verify_password(old_password):
                logger.warning(f"用户{user.username}修改主密码时旧密码验证失败")
                return jsonify({'error': 'Invalid old password'}), 401
            
            # 更新密码
            success = User.update(user.id, password=new_password)
            if success:
                logger.info(f"用户{user.username}主密码修改成功")
                return jsonify({'success': True}), 200
            else:
                logger.error(f"用户{user.username}主密码修改失败")
                return jsonify({'error': 'Failed to update password'}), 500
                
        except Exception as e:
            logger.exception(f"修改主密码过程发生错误: {str(e)}")
            return jsonify({'error': str(e)}), 500
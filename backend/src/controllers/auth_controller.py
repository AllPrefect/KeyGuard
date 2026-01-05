from flask import jsonify, request
from models.user import User
from utils.jwt import JWTUtil
from utils.log import Logger

# 初始化日志
logger = Logger.get_logger('auth_controller')

class AuthController:
    @staticmethod
    def authenticate_master_password():
        """验证主密码"""
        try:
            logger.info("开始主密码认证")
            data = request.json
            if not data or 'masterPassword' not in data:
                logger.warning("主密码缺失")
                return jsonify({'error': 'Missing master password'}), 400
            
            master_password = data['masterPassword']
            ip_address = request.remote_addr  # 从请求中获取IP地址
            
            logger.info(f"认证请求 - IP地址: {ip_address}")
            
            # 检查是否有用户
            query = 'SELECT * FROM users'
            from utils.db import Database
            rows = Database.execute_query(query)
            
            if rows:
                # 有用户，遍历所有用户验证主密码
                for row in rows:
                    user = User.get_by_id(row['id'])
                    if user and user.verify_password(master_password):
                        logger.info(f"用户{user.username}主密码验证成功")
                        
                        # 生成JWT令牌
                        token = JWTUtil.generate_token(user.id, user.username, ip_address=ip_address)
                        logger.info(f"用户{user.username}认证成功，生成JWT令牌")
                        return jsonify({'success': True, 'token': token, 'user': user.to_dict()}), 200
                
                # 所有用户都验证失败
                logger.warning(f"主密码验证失败 - IP地址: {ip_address}")
                return jsonify({'error': 'Invalid master password'}), 401
            else:
                # 没有用户，创建第一个用户，使用主密码作为密码
                # 使用默认用户名
                username = 'user'
                logger.info(f"创建第一个用户: {username}")
                user_id = User.create(username, master_password)
                if user_id:
                    user = User.get_by_id(user_id)
                    if user:
                        # 生成JWT令牌
                        token = JWTUtil.generate_token(user.id, user.username, ip_address=ip_address)
                        logger.info(f"新用户{user.username}创建成功，生成JWT令牌")
                        return jsonify({'success': True, 'token': token, 'user': user.to_dict()}), 200
                logger.error("创建用户失败")
                return jsonify({'error': 'Failed to create user'}), 500
                
        except Exception as e:
            logger.exception(f"认证过程发生错误: {str(e)}")
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
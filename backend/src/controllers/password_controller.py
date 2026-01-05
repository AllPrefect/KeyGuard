from flask import jsonify, request
from models.password import Password
from middleware.auth_middleware import token_required
from utils.log import Logger

# 初始化日志
logger = Logger.get_logger('password_controller')

class PasswordController:
    @staticmethod
    @token_required
    def get_all_passwords():
        """获取所有密码"""
        try:
            logger.info("开始获取所有密码")
            passwords = Password.get_all()
            logger.info(f"成功获取{len(passwords)}条密码记录")
            return jsonify(passwords), 200
        except Exception as e:
            logger.exception(f"获取所有密码失败: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    @token_required
    def get_password_by_id(password_id):
        """根据ID获取密码"""
        try:
            logger.info(f"开始获取ID为{password_id}的密码")
            password = Password.get_by_id(password_id)
            if password:
                logger.info(f"成功获取ID为{password_id}的密码记录")
                return jsonify(password), 200
            logger.warning(f"未找到ID为{password_id}的密码记录")
            return jsonify({'error': 'Password not found'}), 404
        except Exception as e:
            logger.exception(f"获取ID为{password_id}的密码失败: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    @token_required
    def create_password():
        """创建新密码"""
        try:
            logger.info("开始保存密码操作")
            password_data = request.json
            
            # 验证必要字段
            required_fields = ['id', 'title', 'username', 'password', 'category']
            for field in required_fields:
                if field not in password_data:
                    logger.warning(f"保存密码缺少必要字段: {field}")
                    return jsonify({'error': f'Missing required field: {field}'}), 400
            
            # 隐藏敏感信息
            log_data = password_data.copy()
            if 'password' in log_data:
                log_data['password'] = '***'  # 隐藏密码内容
            
            # 检查密码是否已存在
            existing_password = Password.get_by_id(password_data['id'])
            if existing_password:
                # 更新现有密码
                logger.info(f"更新ID为{password_data['id']}的密码记录")
                logger.debug(f"更新密码数据: {log_data}")
                success = Password.update(password_data['id'], password_data)
                if success:
                    logger.info(f"成功更新ID为{password_data['id']}的密码记录")
                else:
                    logger.error(f"更新ID为{password_data['id']}的密码记录失败")
            else:
                # 创建新密码
                logger.info(f"创建ID为{password_data['id']}的新密码记录")
                logger.debug(f"创建密码数据: {log_data}")
                success = Password.create(password_data)
                if success:
                    logger.info(f"成功创建ID为{password_data['id']}的新密码记录")
                else:
                    logger.error(f"创建ID为{password_data['id']}的新密码记录失败")
            
            if success:
                return jsonify({'success': True}), 200
            return jsonify({'error': 'Failed to save password'}), 500
        except Exception as e:
            logger.exception(f"保存密码失败: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    @token_required
    def update_password(password_id):
        """更新密码"""
        try:
            logger.info(f"开始更新ID为{password_id}的密码")
            password_data = request.json
            if not password_data:
                logger.warning("更新密码缺少数据")
                return jsonify({'error': 'Missing password data'}), 400
            
            # 隐藏敏感信息
            log_data = password_data.copy()
            if 'password' in log_data:
                log_data['password'] = '***'  # 隐藏密码内容
            
            logger.debug(f"更新密码数据: {log_data}")
            success = Password.update(password_id, password_data)
            if success:
                logger.info(f"成功更新ID为{password_id}的密码")
                return jsonify({'success': True}), 200
            logger.error(f"更新ID为{password_id}的密码失败: 未找到或更新失败")
            return jsonify({'error': 'Password not found or update failed'}), 404
        except Exception as e:
            logger.exception(f"更新ID为{password_id}的密码失败: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    @token_required
    def delete_password(password_id):
        """删除密码"""
        try:
            logger.info(f"开始删除ID为{password_id}的密码")
            success = Password.delete(password_id)
            if success:
                logger.info(f"成功删除ID为{password_id}的密码")
                return jsonify({'success': True}), 200
            logger.warning(f"未找到ID为{password_id}的密码记录")
            return jsonify({'error': 'Password not found'}), 404
        except Exception as e:
            logger.exception(f"删除ID为{password_id}的密码失败: {str(e)}")
            return jsonify({'error': str(e)}), 500

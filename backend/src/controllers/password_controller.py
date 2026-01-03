from flask import jsonify, request
from models.password import Password

class PasswordController:
    @staticmethod
    def get_all_passwords():
        """获取所有密码"""
        try:
            passwords = Password.get_all()
            return jsonify(passwords), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def get_password_by_id(password_id):
        """根据ID获取密码"""
        try:
            password = Password.get_by_id(password_id)
            if password:
                return jsonify(password), 200
            return jsonify({'error': 'Password not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def create_password():
        """创建新密码"""
        try:
            password_data = request.json
            
            # 验证必要字段
            required_fields = ['id', 'title', 'username', 'password', 'category']
            for field in required_fields:
                if field not in password_data:
                    return jsonify({'error': f'Missing required field: {field}'}), 400
            
            # 检查密码是否已存在
            existing_password = Password.get_by_id(password_data['id'])
            if existing_password:
                # 更新现有密码
                success = Password.update(password_data['id'], password_data)
            else:
                # 创建新密码
                success = Password.create(password_data)
            
            if success:
                return jsonify({'success': True}), 200
            return jsonify({'error': 'Failed to save password'}), 500
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def update_password(password_id):
        """更新密码"""
        try:
            password_data = request.json
            
            success = Password.update(password_id, password_data)
            if success:
                return jsonify({'success': True}), 200
            return jsonify({'error': 'Password not found or update failed'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def delete_password(password_id):
        """删除密码"""
        try:
            success = Password.delete(password_id)
            if success:
                return jsonify({'success': True}), 200
            return jsonify({'error': 'Password not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500

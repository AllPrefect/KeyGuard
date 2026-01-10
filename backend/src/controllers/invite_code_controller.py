from flask import jsonify, request
from models.invite_code import InviteCode
from utils.log import Logger

# 初始化日志
logger = Logger.get_logger('invite_code_controller')

class InviteCodeController:
    @staticmethod
    def create_invite_code():
        """创建新邀请码"""
        try:
            logger.info("开始创建邀请码")
            data = request.json
            
            # 可选参数：自定义邀请码和过期时间
            code = data.get('code') if data else None
            expires_at = data.get('expiresAt') if data else None
            
            if expires_at:
                from datetime import datetime
                try:
                    # 验证过期时间格式
                    expires_at = datetime.fromisoformat(expires_at)
                except ValueError:
                    logger.warning("无效的过期时间格式")
                    return jsonify({'error': 'Invalid expiresAt format, use ISO 8601'}), 400
            
            # 创建邀请码
            new_code = InviteCode.create(code=code, expires_at=expires_at)
            
            if new_code:
                logger.info(f"邀请码创建成功: {new_code}")
                return jsonify({'success': True, 'code': new_code}), 200
            else:
                logger.error("邀请码创建失败")
                return jsonify({'error': 'Failed to create invite code'}), 500
        
        except Exception as e:
            logger.exception(f"创建邀请码时发生错误: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def get_all_invite_codes():
        """获取所有邀请码"""
        try:
            logger.info("开始获取所有邀请码")
            
            # 获取所有邀请码
            query = 'SELECT * FROM invite_codes'
            from utils.db import Database
            rows = Database.execute_query(query)
            
            invite_codes = [InviteCode(
                id=row['id'],
                code=row['code'],
                status=row['status'],
                created_at=row['created_at'],
                updated_at=row['updated_at'],
                expires_at=row['expires_at']
            ).to_dict() for row in rows]
            
            logger.info(f"成功获取{len(invite_codes)}个邀请码")
            return jsonify({'success': True, 'inviteCodes': invite_codes}), 200
            
        except Exception as e:
            logger.exception(f"获取邀请码时发生错误: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def get_available_invite_codes():
        """获取可用邀请码"""
        try:
            logger.info("开始获取可用邀请码")
            
            # 获取可用邀请码
            available_codes = InviteCode.get_available_codes()
            invite_codes = [code.to_dict() for code in available_codes]
            
            logger.info(f"成功获取{len(invite_codes)}个可用邀请码")
            return jsonify({'success': True, 'inviteCodes': invite_codes}), 200
            
        except Exception as e:
            logger.exception(f"获取可用邀请码时发生错误: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def get_invite_code(code):
        """获取指定邀请码"""
        try:
            logger.info(f"开始获取邀请码: {code}")
            
            # 获取邀请码
            invite_code = InviteCode.get_by_code(code)
            
            if invite_code:
                logger.info(f"成功获取邀请码: {code}")
                return jsonify({'success': True, 'inviteCode': invite_code.to_dict()}), 200
            else:
                logger.warning(f"邀请码不存在: {code}")
                return jsonify({'error': 'Invite code not found'}), 404
            
        except Exception as e:
            logger.exception(f"获取邀请码时发生错误: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def update_invite_code_status(code):
        """更新邀请码状态"""
        try:
            logger.info(f"开始更新邀请码状态: {code}")
            data = request.json
            
            if not data or 'status' not in data:
                logger.warning("状态信息缺失")
                return jsonify({'error': 'Missing status'}), 400
            
            status = data['status']
            
            # 更新状态
            success = InviteCode.update_status(code, status)
            
            if success:
                logger.info(f"邀请码状态更新成功: {code} -> {status}")
                return jsonify({'success': True}), 200
            else:
                logger.error(f"邀请码状态更新失败: {code}")
                return jsonify({'error': 'Failed to update invite code status'}), 500
            
        except ValueError as e:
            logger.warning(f"无效的邀请码状态: {str(e)}")
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            logger.exception(f"更新邀请码状态时发生错误: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def revoke_invite_code(code):
        """撤销邀请码"""
        try:
            logger.info(f"开始撤销邀请码: {code}")
            
            # 撤销邀请码
            success = InviteCode.revoke(code)
            
            if success:
                logger.info(f"邀请码撤销成功: {code}")
                return jsonify({'success': True}), 200
            else:
                logger.error(f"邀请码撤销失败: {code}")
                return jsonify({'error': 'Failed to revoke invite code'}), 500
            
        except Exception as e:
            logger.exception(f"撤销邀请码时发生错误: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def delete_invite_code(code):
        """删除邀请码"""
        try:
            logger.info(f"开始删除邀请码: {code}")
            
            # 删除邀请码
            success = InviteCode.delete(code)
            
            if success:
                logger.info(f"邀请码删除成功: {code}")
                return jsonify({'success': True}), 200
            else:
                logger.error(f"邀请码删除失败: {code}")
                return jsonify({'error': 'Failed to delete invite code'}), 500
            
        except Exception as e:
            logger.exception(f"删除邀请码时发生错误: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def cleanup_expired_codes():
        """清理过期邀请码"""
        try:
            logger.info("开始清理过期邀请码")
            
            # 清理过期邀请码
            success = InviteCode.cleanup_expired()
            
            if success:
                logger.info("过期邀请码清理成功")
                return jsonify({'success': True}), 200
            else:
                logger.error("过期邀请码清理失败")
                return jsonify({'error': 'Failed to cleanup expired codes'}), 500
            
        except Exception as e:
            logger.exception(f"清理过期邀请码时发生错误: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def batch_create_codes():
        """批量创建邀请码"""
        try:
            logger.info("开始批量创建邀请码")
            data = request.json
            
            if not data or 'count' not in data:
                logger.warning("批量创建参数缺失")
                return jsonify({'error': 'Missing count parameter'}), 400
            
            count = data['count']
            
            # 验证数量
            if not isinstance(count, int) or count <= 0 or count > 100:
                logger.warning("无效的批量创建数量")
                return jsonify({'error': 'Count must be an integer between 1 and 100'}), 400
            
            # 可选参数：过期时间
            expires_at = None
            if 'expiresAt' in data:
                from datetime import datetime
                try:
                    expires_at = datetime.fromisoformat(data['expiresAt'])
                except ValueError:
                    logger.warning("无效的过期时间格式")
                    return jsonify({'error': 'Invalid expiresAt format, use ISO 8601'}), 400
            
            # 批量创建邀请码
            created_codes = []
            for _ in range(count):
                code = InviteCode.create(expires_at=expires_at)
                if code:
                    created_codes.append(code)
            
            logger.info(f"批量创建完成，成功创建{len(created_codes)}个邀请码")
            return jsonify({'success': True, 'codes': created_codes}), 200
            
        except Exception as e:
            logger.exception(f"批量创建邀请码时发生错误: {str(e)}")
            return jsonify({'error': str(e)}), 500
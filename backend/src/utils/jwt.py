import jwt
from datetime import datetime, timedelta
from config.config import config
import os
from utils.log import Logger

# 初始化日志
logger = Logger.get_logger('jwt')

# 获取配置
current_config = config[os.getenv('FLASK_ENV', 'default')]

class JWTUtil:
    @staticmethod
    def generate_token(user_id, username, ip_address=None):
        """生成JWT令牌"""
        payload = {
            'user_id': user_id,
            'username': username,
            'ip_address': ip_address,
            'exp': datetime.utcnow() + timedelta(hours=24),  # 令牌有效期24小时
            'iat': datetime.utcnow()
        }
        
        try:
            token = jwt.encode(payload, current_config.SECRET_KEY, algorithm='HS256')
            logger.info(f"为用户{username}生成JWT令牌")
            logger.debug(f"JWT令牌生成 - 用户ID: {user_id}, IP地址: {ip_address}")
            return token
        except Exception as e:
            logger.error(f"生成JWT令牌失败: {str(e)}")
            raise
    
    @staticmethod
    def verify_token(token):
        """验证JWT令牌"""
        try:
            payload = jwt.decode(token, current_config.SECRET_KEY, algorithms=['HS256'])
            logger.info(f"JWT令牌验证成功 - 用户: {payload['username']}")
            logger.debug(f"JWT令牌内容 - 用户ID: {payload['user_id']}, IP地址: {payload.get('ip_address')}")
            return {
                'valid': True,
                'user_id': payload['user_id'],
                'username': payload['username'],
                'ip_address': payload.get('ip_address')
            }
        except jwt.ExpiredSignatureError:
            logger.warning("JWT令牌已过期")
            return {'valid': False, 'error': 'Token has expired'}
        except jwt.InvalidTokenError as e:
            logger.error(f"无效的JWT令牌: {str(e)}")
            return {'valid': False, 'error': 'Invalid token'}
        except Exception as e:
            logger.error(f"JWT令牌验证失败: {str(e)}")
            return {'valid': False, 'error': 'Token verification failed'}

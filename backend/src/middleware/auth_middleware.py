from flask import request, jsonify
from utils.jwt import JWTUtil
from models.user import User
from utils.log import Logger

# 初始化日志
logger = Logger.get_logger('auth_middleware')

def token_required(f):
    """认证中间件，验证JWT令牌"""
    def decorated(*args, **kwargs):
        logger.info(f"开始认证中间件检查 - 路径: {request.path}")
        
        token = request.headers.get('Authorization')
        
        if not token:
            logger.warning("请求缺少认证令牌")
            return jsonify({'error': 'Missing authentication token'}), 401
        
        # 移除Bearer前缀
        if token.startswith('Bearer '):
            token = token[7:]
        
        logger.debug("验证JWT令牌")
        # 验证令牌
        result = JWTUtil.verify_token(token)
        if not result['valid']:
            logger.warning(f"JWT令牌验证失败: {result['error']}")
            return jsonify({'error': result['error']}), 401
        
        logger.info(f"JWT令牌验证成功 - 用户: {result['username']}")
        
        # 从令牌中获取IP地址
        token_ip_address = result.get('ip_address')
        
        # 获取当前请求的IP地址
        current_ip_address = request.remote_addr
        
        # 检查IP地址是否匹配
        logger.debug(f"检查IP地址匹配 - 令牌IP: {token_ip_address}, 当前IP: {current_ip_address}")
        if token_ip_address != current_ip_address:
            logger.warning(f"IP地址不匹配 - 令牌IP: {token_ip_address}, 当前IP: {current_ip_address}")
            return jsonify({'error': 'IP address mismatch'}), 401
        
        # 将用户信息添加到请求上下文
        request.user_id = result['user_id']
        request.username = result['username']
        
        logger.debug(f"认证中间件检查通过 - 用户: {result['username']}, 路径: {request.path}")
        return f(*args, **kwargs)
    
    decorated.__name__ = f.__name__
    return decorated
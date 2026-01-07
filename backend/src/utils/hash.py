import hashlib
import binascii

def pbkdf2_hash(password, salt, iterations=10000, key_length=16):
    """使用PBKDF2算法生成哈希值，与前端CryptoJS.PBKDF2保持一致
    
    Args:
        password: 明文密码
        salt: 盐值
        iterations: 迭代次数，默认10000
        key_length: 密钥长度，默认16字节（对应512位/32）
        
    Returns:
        十六进制格式的哈希字符串
    """
    # 如果password或salt是字符串，转换为字节
    if isinstance(password, str):
        password = password.encode('utf-8')
    if isinstance(salt, str):
        salt = salt.encode('utf-8')
    
    # 使用PBKDF2-HMAC-SHA256算法
    key = hashlib.pbkdf2_hmac(
        'sha256',  # 哈希算法
        password,  # 密码
        salt,      # 盐值
        iterations, # 迭代次数
        key_length  # 输出密钥长度
    )
    
    # 转换为十六进制字符串
    return binascii.hexlify(key).decode('utf-8')
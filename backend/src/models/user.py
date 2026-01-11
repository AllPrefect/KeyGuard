from datetime import datetime
import bcrypt
from utils.db import Database

class User:
    def __init__(self, id, username, password_hash, salt, invite_code, created_at=None, updated_at=None):
        self.id = id
        self.username = username
        self.password_hash = password_hash
        self.salt = salt
        self.invite_code = invite_code
        self.created_at = created_at or datetime.now().isoformat()
        self.updated_at = updated_at or datetime.now().isoformat()
    
    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'username': self.username,
            'createdAt': self.created_at,
            'updatedAt': self.updated_at
        }
    
    @classmethod
    def generate_salt(cls):
        """生成随机盐值"""
        salt = bcrypt.gensalt().decode('utf-8')
        return salt

    @classmethod
    def hash_password(cls, password, salt=None):
        """使用PBKDF2算法生成哈希值，与前端保持一致"""
        from utils.hash import pbkdf2_hash
        
        if salt is None:
            salt = cls.generate_salt()
        
        # 为哈希派生添加固定后缀，与加密密钥区分，保持与前端一致
        hash_input = f"{password}{salt}hash"
        
        # 使用PBKDF2算法生成哈希值，key_length=64字节（512位），与前端保持一致
        return pbkdf2_hash(hash_input, salt, iterations=10000, key_length=64)
    
    def verify_password(self, password):
        """验证密码"""
        from utils.hash import pbkdf2_hash
        
        # 为哈希派生添加固定后缀，与加密密钥区分，保持与前端一致
        hash_input = f"{password}{self.salt}hash"
        
        # 使用相同的PBKDF2算法生成哈希值，key_length=64字节（512位），与前端保持一致
        generated_hash = pbkdf2_hash(hash_input, self.salt, iterations=10000, key_length=64)
        
        return generated_hash == self.password_hash
    
    @classmethod
    def get_by_username(cls, username):
        """根据用户名获取用户"""
        query = 'SELECT * FROM users WHERE username = ?'
        rows = Database.execute_query(query, (username,))
        
        if rows:
            row = rows[0]
            return cls(
                row['id'],
                row['username'],
                row['password_hash'],
                row['salt'],
                row['invite_code'],
                row['created_at'],
                row['updated_at']
            )
        return None
    
    @classmethod
    def get_by_id(cls, user_id):
        """根据ID获取用户"""
        query = 'SELECT * FROM users WHERE id = ?'
        rows = Database.execute_query(query, (user_id,))
        
        if rows:
            row = rows[0]
            return cls(
                row['id'],
                row['username'],
                row['password_hash'],
                row['salt'],
                row['invite_code'],
                row['created_at'],
                row['updated_at']
            )
        return None
    
    @classmethod
    def create(cls, username, password_hash, invite_code, salt=None):
        """创建新用户"""
        user_id = datetime.now().strftime('%Y%m%d%H%M%S%f')
        
        # 如果没有提供盐值，使用新的generate_salt方法生成
        if salt is None:
            salt = cls.generate_salt()
        
        # 不再重新哈希，直接使用前端传来的哈希值
        
        query = '''
            INSERT INTO users (id, username, password_hash, salt, invite_code, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        '''
        
        params = (
            user_id,
            username,
            password_hash,
            salt,
            invite_code,
            datetime.now().isoformat(),
            datetime.now().isoformat()
        )
        
        success = Database.execute_query(query, params, commit=True)
        if success:
            return user_id
        return None
    
    
    
    @classmethod
    def update(cls, user_id, *args, **kwargs):
        """更新用户信息
        
        支持两种调用方式：
        1. User.update(user_id, username="new_username", password="new_password")
        2. User.update(user_id, {"username": "new_username", "password": "new_password"})
        """
        # 先获取现有用户
        existing_user = cls.get_by_id(user_id)
        if not existing_user:
            return False
        
        # 处理参数
        if args and isinstance(args[0], dict):
            # 字典形式的参数
            update_data = args[0]
        else:
            # 关键字参数形式
            update_data = kwargs
        
        # 更新字段
        updated_at = datetime.now().isoformat()
        update_data['updated_at'] = updated_at
        
        # 处理密码更新
        if 'password' in update_data:
            new_password = update_data.pop('password')
            new_salt = cls.generate_salt()  # 使用现有的generate_salt方法
            password_hash = cls.hash_password(new_password, new_salt)
            update_data['password_hash'] = password_hash
            update_data['salt'] = new_salt
        
        # 构建查询
        if not update_data:
            return False
        
        # 构建SET子句
        set_clause = ', '.join([f"{key} = ?" for key in update_data.keys()])
        params = list(update_data.values()) + [user_id]
        
        query = f'''UPDATE users SET {set_clause} WHERE id = ?'''
        
        return Database.execute_query(query, params, commit=True)
    
    @classmethod
    def delete(cls, user_id):
        """删除用户
        
        Args:
            user_id (str): 用户ID
            
        Returns:
            bool: 删除成功返回True，否则返回False
        """
        # 先检查用户是否存在
        existing_user = cls.get_by_id(user_id)
        if not existing_user:
            return False
        
        # 删除用户的密码数据
        from models.password import Password
        if hasattr(Password, 'delete_by_user_id'):
            Password.delete_by_user_id(user_id)
        
        # 删除用户
        query = '''DELETE FROM users WHERE id = ?'''
        params = (user_id,)
        
        return Database.execute_query(query, params, commit=True)
    
    @classmethod
    def get_all(cls):
        """获取所有用户列表
        
        Returns:
            list[User]: 用户列表
        """
        query = '''SELECT * FROM users ORDER BY created_at DESC'''
        rows = Database.execute_query(query)
        
        users = []
        for row in rows:
            user = cls(
                id=row['id'],
                username=row['username'],
                password_hash=row['password_hash'],
                salt=row['salt'],
                invite_code=row['invite_code'],
                created_at=row['created_at'],
                updated_at=row['updated_at']
            )
            users.append(user)
        
        return users

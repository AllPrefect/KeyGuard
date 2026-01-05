from datetime import datetime
import bcrypt
from utils.db import Database

class User:
    def __init__(self, id, username, password_hash, created_at=None, updated_at=None):
        self.id = id
        self.username = username
        self.password_hash = password_hash
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
    def hash_password(cls, password):
        """使用bcrypt哈希密码"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, password):
        """验证密码"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
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
                row['created_at'],
                row['updated_at']
            )
        return None
    
    @classmethod
    def create(cls, username, password):
        """创建新用户"""
        user_id = datetime.now().strftime('%Y%m%d%H%M%S%f')
        password_hash = cls.hash_password(password)
        
        query = '''
            INSERT INTO users (id, username, password_hash, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
        '''
        
        params = (
            user_id,
            username,
            password_hash,
            datetime.now().isoformat(),
            datetime.now().isoformat()
        )
        
        return Database.execute_query(query, params, commit=True)
    

    
    @classmethod
    def update(cls, user_id, username=None, password=None):
        """更新用户信息"""
        # 先获取现有用户
        existing_user = cls.get_by_id(user_id)
        if not existing_user:
            return False
        
        # 更新字段
        updated_at = datetime.now().isoformat()
        
        # 根据需要更新的字段构建查询
        if username and password:
            password_hash = cls.hash_password(password)
            query = '''
                UPDATE users SET 
                    username = ?, password_hash = ?, updated_at = ? 
                WHERE id = ?
            '''
            params = (username, password_hash, updated_at, user_id)
        elif username:
            query = '''
                UPDATE users SET 
                    username = ?, updated_at = ? 
                WHERE id = ?
            '''
            params = (username, updated_at, user_id)
        elif password:
            password_hash = cls.hash_password(password)
            query = '''
                UPDATE users SET 
                    password_hash = ?, updated_at = ? 
                WHERE id = ?
            '''
            params = (password_hash, updated_at, user_id)
        else:
            return False
        
        return Database.execute_query(query, params, commit=True)

from datetime import datetime
from utils.db import Database

class Password:
    def __init__(self, id, user_id, title, username, password, category, url='', notes='', created_at=None, updated_at=None):
        self.id = id
        self.user_id = user_id
        self.title = title
        self.username = username
        self.password = password
        self.url = url
        self.category = category
        self.notes = notes
        self.created_at = created_at or datetime.now().isoformat()
        self.updated_at = updated_at or datetime.now().isoformat()
    
    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'userId': self.user_id,
            'title': self.title,
            'username': self.username,
            'password': self.password,
            'url': self.url or '',
            'category': self.category,
            'notes': self.notes or '',
            'createdAt': self.created_at,
            'updatedAt': self.updated_at
        }
    
    @classmethod
    def get_all(cls, user_id):
        """获取特定用户的所有密码"""
        query = 'SELECT * FROM passwords WHERE user_id = ? ORDER BY category, title'
        rows = Database.execute_query(query, (user_id,))
        
        return [cls(
            row['id'],
            row['user_id'],
            row['title'],
            row['username'],
            row['password'],
            row['category'],
            row['url'],
            row['notes'],
            row['created_at'],
            row['updated_at']
        ).to_dict() for row in rows]
    
    @classmethod
    def get_by_id(cls, password_id, user_id):
        """根据ID获取密码，确保只能访问自己的密码"""
        query = 'SELECT * FROM passwords WHERE id = ? AND user_id = ?'
        rows = Database.execute_query(query, (password_id, user_id))
        
        if rows:
            row = rows[0]
            return cls(
                row['id'],
                row['user_id'],
                row['title'],
                row['username'],
                row['password'],
                row['category'],
                row['url'],
                row['notes'],
                row['created_at'],
                row['updated_at']
            ).to_dict()
        return None
    
    @classmethod
    def create(cls, password_data):
        """创建新密码"""
        password = cls(
            password_data['id'],
            password_data['userId'],
            password_data['title'],
            password_data['username'],
            password_data['password'],
            password_data['category'],
            password_data.get('url', ''),
            password_data.get('notes', ''),
            password_data.get('createdAt'),
            datetime.now().isoformat()
        )
        
        query = '''
            INSERT INTO passwords (id, user_id, title, username, password, url, category, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        '''
        
        params = (
            password.id,
            password.user_id,
            password.title,
            password.username,
            password.password,
            password.url,
            password.category,
            password.notes,
            password.created_at,
            password.updated_at
        )
        
        return Database.execute_query(query, params, commit=True)
    
    @classmethod
    def update(cls, password_id, password_data):
        """更新密码，确保只能更新自己的密码"""
        # 先获取现有密码
        existing_password = cls.get_by_id(password_id, password_data['userId'])
        if not existing_password:
            return False
        
        # 更新字段
        updated_at = datetime.now().isoformat()
        
        query = '''
            UPDATE passwords SET 
                title = ?, username = ?, password = ?, url = ?, 
                category = ?, notes = ?, updated_at = ? 
            WHERE id = ? AND user_id = ?
        '''
        
        params = (
            password_data.get('title', existing_password['title']),
            password_data.get('username', existing_password['username']),
            password_data.get('password', existing_password['password']),
            password_data.get('url', existing_password['url']),
            password_data.get('category', existing_password['category']),
            password_data.get('notes', existing_password['notes']),
            updated_at,
            password_id,
            password_data['userId']
        )
        
        return Database.execute_query(query, params, commit=True)
    
    @classmethod
    def delete(cls, password_id, user_id):
        """删除密码，确保只能删除自己的密码"""
        query = 'DELETE FROM passwords WHERE id = ? AND user_id = ?'
        return Database.execute_query(query, (password_id, user_id), commit=True)

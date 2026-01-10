from datetime import datetime, timedelta
from utils.db import Database

class InviteCode:
    # 邀请码状态常量
    STATUS_ACTIVE = 'active'    # 可用
    STATUS_USED = 'used'        # 已使用
    STATUS_EXPIRED = 'expired'  # 已过期
    STATUS_REVOKED = 'revoked'  # 已撤销
    
    # 所有有效状态
    VALID_STATUSES = [STATUS_ACTIVE, STATUS_USED, STATUS_EXPIRED, STATUS_REVOKED]
    
    def __init__(self, id, code, status=STATUS_ACTIVE, created_at=None, updated_at=None, expires_at=None):
        self.id = id
        self.code = code
        self.status = status
        self.created_at = created_at or datetime.now().isoformat()
        self.updated_at = updated_at or datetime.now().isoformat()
        # 设置默认过期时间为创建后30天
        self.expires_at = expires_at or (datetime.now() + timedelta(days=30)).isoformat()
    
    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'code': self.code,
            'status': self.status,
            'createdAt': self.created_at,
            'updatedAt': self.updated_at,
            'expiresAt': self.expires_at
        }
    
    def is_valid(self):
        """检查邀请码是否有效（状态为active且未过期）"""
        if self.status != self.STATUS_ACTIVE:
            return False
        # 检查是否过期
        return datetime.fromisoformat(self.expires_at) > datetime.now()
    
    @classmethod
    def create(cls, code=None, expires_at=None):
        """创建新邀请码"""
        code_id = datetime.now().strftime('%Y%m%d%H%M%S%f')
        
        # 如果没有提供邀请码，生成一个两位数的随机邀请码
        if code is None:
            import random
            while True:
                # 生成10-99之间的随机数
                new_code = str(random.randint(10, 99))
                # 检查邀请码是否已经存在
                if not cls.get_by_code(new_code):
                    code = new_code
                    break
        
        # 设置默认过期时间为创建后30天
        if expires_at is None:
            expires_at = (datetime.now() + timedelta(days=30)).isoformat()
        elif isinstance(expires_at, datetime):
            expires_at = expires_at.isoformat()
        
        query = '''
            INSERT INTO invite_codes (id, code, status, created_at, updated_at, expires_at)
            VALUES (?, ?, ?, ?, ?, ?)
        '''
        
        params = (
            code_id,
            code,
            cls.STATUS_ACTIVE,  # 默认状态为active
            datetime.now().isoformat(),
            datetime.now().isoformat(),
            expires_at
        )
        
        success = Database.execute_query(query, params, commit=True)
        if success:
            return code
        return None
    
    @classmethod
    def get_by_code(cls, code):
        """根据邀请码获取邀请码对象"""
        query = 'SELECT * FROM invite_codes WHERE code = ?'
        result = Database.execute_query(query, (code,))
        
        if result:
            row = result[0]
            return cls(
                id=row['id'],
                code=row['code'],
                status=row['status'],
                created_at=row['created_at'],
                updated_at=row['updated_at'],
                expires_at=row['expires_at']
            )
        return None
    
    @classmethod
    def update_status(cls, code, new_status):
        """更新邀请码状态"""
        if new_status not in cls.VALID_STATUSES:
            raise ValueError(f'Invalid status: {new_status}. Valid statuses are: {cls.VALID_STATUSES}')
        
        query = '''
            UPDATE invite_codes SET status = ?, updated_at = ?
            WHERE code = ?
        '''
        
        params = (
            new_status,
            datetime.now().isoformat(),
            code
        )
        
        return Database.execute_query(query, params, commit=True)
    
    @classmethod
    def mark_as_used(cls, code):
        """将邀请码标记为已使用"""
        return cls.update_status(code, cls.STATUS_USED)
    
    @classmethod
    def revoke(cls, code):
        """撤销邀请码"""
        return cls.update_status(code, cls.STATUS_REVOKED)
    
    @classmethod
    def get_all_invite_codes(cls):
        """获取所有邀请码"""
        query = 'SELECT * FROM invite_codes'
        results = Database.execute_query(query)
        
        return [cls(
            id=row['id'],
            code=row['code'],
            status=row['status'],
            created_at=row['created_at'],
            updated_at=row['updated_at'],
            expires_at=row['expires_at']
        ) for row in results]
    
    @classmethod
    def get_available_codes(cls):
        """获取所有可用的邀请码（状态为active且未过期）"""
        query = 'SELECT * FROM invite_codes WHERE status = ?'
        results = Database.execute_query(query, (cls.STATUS_ACTIVE,))
        
        available_codes = []
        for row in results:
            invite_code = cls(
                id=row['id'],
                code=row['code'],
                status=row['status'],
                created_at=row['created_at'],
                updated_at=row['updated_at'],
                expires_at=row['expires_at']
            )
            # 检查是否过期
            if invite_code.is_valid():
                available_codes.append(invite_code)
        
        return available_codes
    
    @classmethod
    def get_by_status(cls, status):
        """根据状态获取邀请码列表"""
        if status not in cls.VALID_STATUSES:
            raise ValueError(f'Invalid status: {status}. Valid statuses are: {cls.VALID_STATUSES}')
        
        query = 'SELECT * FROM invite_codes WHERE status = ?'
        results = Database.execute_query(query, (status,))
        
        return [cls(
            id=row['id'],
            code=row['code'],
            status=row['status'],
            created_at=row['created_at'],
            updated_at=row['updated_at'],
            expires_at=row['expires_at']
        ) for row in results]
    
    @classmethod
    def delete(cls, code):
        """删除邀请码"""
        query = 'DELETE FROM invite_codes WHERE code = ?'
        return Database.execute_query(query, (code,), commit=True)
    
    @classmethod
    def cleanup_expired(cls):
        """清理所有已过期的邀请码，将其状态标记为expired"""
        query = '''
            UPDATE invite_codes SET status = ?, updated_at = ?
            WHERE status = ? AND expires_at < ?
        '''
        
        params = (
            cls.STATUS_EXPIRED,
            datetime.now().isoformat(),
            cls.STATUS_ACTIVE,
            datetime.now().isoformat()
        )
        
        return Database.execute_query(query, params, commit=True)

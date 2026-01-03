import sqlite3
import os
import sys

# 将当前目录添加到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.config import config

# 获取当前配置
current_config = config[os.getenv('FLASK_ENV', 'default')]

# 确保数据目录存在
os.makedirs(current_config.DATA_DIR, exist_ok=True)

class Database:
    @staticmethod
    def get_connection():
        """获取数据库连接"""
        conn = sqlite3.connect(current_config.DB_PATH)
        conn.row_factory = sqlite3.Row  # 使查询结果可以通过列名访问
        return conn
    
    @staticmethod
    def init_db():
        """初始化数据库"""
        conn = Database.get_connection()
        cursor = conn.cursor()
        
        # 创建密码表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS passwords (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                username TEXT NOT NULL,
                password TEXT NOT NULL,
                url TEXT,
                category TEXT NOT NULL,
                notes TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        ''')
        
        conn.commit()
        conn.close()
    
    @staticmethod
    def execute_query(query, params=None, commit=False):
        """执行查询"""
        conn = Database.get_connection()
        cursor = conn.cursor()
        
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            if commit:
                conn.commit()
                return True
            else:
                return cursor.fetchall()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

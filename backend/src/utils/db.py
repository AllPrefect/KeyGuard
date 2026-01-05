import sqlite3
import os
import sys

# 将当前目录添加到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.config import config
from utils.log import Logger

# 初始化日志
logger = Logger.get_logger('db')

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
        
        # 创建用户表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
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
            # 记录查询信息（隐藏敏感信息）
            query_type = query.strip().split()[0].upper()
            if query_type in ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER']:
                logger.debug(f"执行{query_type}查询")
                logger.debug(f"查询SQL: {query}")
                if params:
                    logger.debug(f"查询参数: {params}")
            
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            if commit:
                conn.commit()
                logger.info(f"{query_type}查询执行成功并提交")
                return True
            else:
                results = cursor.fetchall()
                logger.debug(f"{query_type}查询返回{len(results)}条记录")
                return results
        except Exception as e:
            conn.rollback()
            logger.error(f"数据库查询执行失败: {str(e)}")
            logger.error(f"失败的SQL: {query}")
            if params:
                logger.error(f"失败的参数: {params}")
            raise e
        finally:
            conn.close()

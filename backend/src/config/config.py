import os
import logging

# 基础配置类
class Config:
    DEBUG = True
    SECRET_KEY = 'your-secret-key'  # 在生产环境中应该使用环境变量
    
    # 数据目录配置
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), 'data')
    DB_PATH = os.path.join(DATA_DIR, 'key_guard.db')
    
    # 日志配置
    LOG_DIR = os.path.join(os.path.dirname(BASE_DIR), 'logs')
    LOG_LEVEL = logging.INFO
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    LOG_FILE = os.path.join(LOG_DIR, 'keyguard.log')  # 日志文件路径，按天滚动时会自动添加日期后缀
    LOG_BACKUP_COUNT = 30  # 保留30个备份文件（约一个月）
    LOG_ROTATION_WHEN = 'MIDNIGHT'  # 滚动时间单位：S（秒）, M（分钟）, H（小时）, D（天）, MIDNIGHT（午夜）, W{0-6}（星期）
    LOG_ROTATION_INTERVAL = 1  # 滚动间隔
    LOG_ROTATION_TIME = '00:00:00'  # 自定义滚动时间（仅当LOG_ROTATION_WHEN为MIDNIGHT时生效），格式：HH:MM:SS
    LOG_FILE_PREFIX = 'keyguard'  # 日志文件前缀
    LOG_FILE_SUFFIX = '.log'  # 日志文件后缀
    LOG_DATE_FORMAT = '%Y-%m-%d'  # 日志文件日期格式

# 生产环境配置
class ProductionConfig(Config):
    DEBUG = False
    LOG_LEVEL = logging.WARNING

# 开发环境配置
class DevelopmentConfig(Config):
    DEBUG = True

# 测试环境配置
class TestingConfig(Config):
    TESTING = True
    DB_PATH = os.path.join(Config.DATA_DIR, 'test_key_guard.db')

# 配置映射，根据环境变量选择配置
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

import os

# 基础配置类
class Config:
    DEBUG = True
    SECRET_KEY = 'your-secret-key'  # 在生产环境中应该使用环境变量
    
    # 数据目录配置
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), 'data')
    DB_PATH = os.path.join(DATA_DIR, 'password_manager.db')

# 生产环境配置
class ProductionConfig(Config):
    DEBUG = False

# 开发环境配置
class DevelopmentConfig(Config):
    DEBUG = True

# 测试环境配置
class TestingConfig(Config):
    TESTING = True
    DB_PATH = os.path.join(Config.DATA_DIR, 'test_password_manager.db')

# 配置映射，根据环境变量选择配置
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

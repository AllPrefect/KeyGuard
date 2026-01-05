import logging
import os
import re
from datetime import datetime
from logging.handlers import TimedRotatingFileHandler
from config.config import config

# 获取当前配置
env = os.getenv('FLASK_ENV', 'default')
current_config = config[env]

# 确保日志目录存在
os.makedirs(current_config.LOG_DIR, exist_ok=True)

# 自定义日志处理类，实现从生成时就按日命名的功能
class DailyLogFileHandler(TimedRotatingFileHandler):
    """自定义的日志处理类，实现日志文件从生成时就按日命名的功能
    
    继承自TimedRotatingFileHandler，重写了doRollover方法和initialRotation方法
    确保日志文件在生成时就包含当前日期，并且在滚动时能正确处理文件名
    """
    
    def __init__(self, filename, when='D', interval=1, backupCount=0, encoding=None, delay=False, utc=False):
        """初始化DailyLogFileHandler
        
        Args:
            filename (str): 日志文件路径
            when (str): 滚动时间单位，默认为'D'（天）
            interval (int): 滚动间隔，默认为1
            backupCount (int): 保留的备份文件数量，默认为0
            encoding (str): 日志文件编码，默认为None
            delay (bool): 是否延迟创建日志文件，默认为False
            utc (bool): 是否使用UTC时间，默认为False
        """
        # 初始化父类
        super().__init__(filename, when, interval, backupCount, encoding, delay, utc)
        
    def doRollover(self):
        """重写日志滚动方法
        
        当需要滚动日志时，创建一个新的包含当前日期的日志文件
        """
        # 关闭当前日志文件
        if self.stream:
            self.stream.close()
            self.stream = None
        
        # 生成新的日志文件名
        new_log_file = get_log_file_with_date()
        
        # 确保新的日志文件名与当前不同
        if self.baseFilename != new_log_file:
            # 如果备份文件数量大于0，且当前日志文件存在，则将其重命名为备份文件
            if self.backupCount > 0:
                if os.path.exists(self.baseFilename):
                    # 直接使用当前文件名作为备份文件名
                    backup_name = self.baseFilename
                    if not os.path.exists(backup_name):
                        os.rename(self.baseFilename, backup_name)
            
            # 更新baseFilename为新的日志文件名
            self.baseFilename = new_log_file
        
        # 重新打开日志文件
        if not self.delay:
            self.stream = self._open()
        
        # 更新下一次滚动时间
        self.rolloverAt = self.computeRollover(self.rolloverAt)

# 生成包含当前日期的日志文件名
def get_log_file_with_date():
    """生成包含当前日期的日志文件名
    
    Returns:
        str: 包含当前日期的日志文件路径
    """
    # 检查配置中是否有日期相关的配置
    if hasattr(current_config, 'LOG_FILE_PREFIX') and hasattr(current_config, 'LOG_DATE_FORMAT'):
        # 使用配置的前缀、日期和后缀生成日志文件名
        today = datetime.now().strftime(current_config.LOG_DATE_FORMAT)
        filename = f"{current_config.LOG_FILE_PREFIX}.{today}"
        if hasattr(current_config, 'LOG_FILE_SUFFIX'):
            filename += current_config.LOG_FILE_SUFFIX
        else:
            filename += '.log'
        return os.path.join(current_config.LOG_DIR, filename)
    else:
        # 回退到默认的日志文件名
        return current_config.LOG_FILE

class Logger:
    _loggers = {}
    
    @staticmethod
    def get_logger(name=None):
        """获取logger实例
        
        Args:
            name (str, optional): logger名称. Defaults to None.
            
        Returns:
            logging.Logger: logger实例
        """
        if not name:
            name = 'keyguard'
        
        if name in Logger._loggers:
            return Logger._loggers[name]
        
        # 创建logger
        logger = logging.getLogger(name)
        logger.setLevel(current_config.LOG_LEVEL)
        logger.propagate = False  # 防止日志重复输出
        
        # 清除已存在的处理器
        if logger.handlers:
            logger.handlers.clear()
        
        # 创建格式化器
        formatter = logging.Formatter(current_config.LOG_FORMAT)
        
        # 获取包含当前日期的日志文件名
        log_file_path = get_log_file_with_date()
        
        # 创建文件处理器，使用我们自定义的DailyLogFileHandler
        file_handler = DailyLogFileHandler(
            log_file_path,
            when=getattr(current_config, 'LOG_ROTATION_WHEN', 'D'),
            interval=getattr(current_config, 'LOG_ROTATION_INTERVAL', 1),
            backupCount=current_config.LOG_BACKUP_COUNT,
            encoding='utf-8',
            utc=False
        )
        file_handler.setLevel(current_config.LOG_LEVEL)
        file_handler.setFormatter(formatter)
        
        # 创建控制台处理器
        console_handler = logging.StreamHandler()
        console_handler.setLevel(current_config.LOG_LEVEL)
        console_handler.setFormatter(formatter)
        
        # 添加处理器到logger
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
        
        # 存储logger实例
        Logger._loggers[name] = logger
        
        return logger

# 创建默认logger
default_logger = Logger.get_logger('keyguard')

# 导出常用的日志方法
info = default_logger.info
debug = default_logger.debug
warning = default_logger.warning
error = default_logger.error
critical = default_logger.critical
exception = default_logger.exception
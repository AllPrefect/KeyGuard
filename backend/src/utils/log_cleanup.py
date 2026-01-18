#!/usr/bin/env python3
"""
日志清理工具模块
用于在应用启动时手动清理旧日志文件
"""
import os
import sys
import re
from datetime import datetime

# 确保src目录在Python路径中
current_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.dirname(current_dir)
if src_dir not in sys.path:
    sys.path.insert(0, src_dir)

from config.config import config


def cleanup_old_logs():
    """
    清理旧日志文件
    根据配置的LOG_BACKUP_COUNT保留指定数量的最新日志文件
    """
    # 获取当前配置
    env = os.getenv('FLASK_ENV', 'default')
    current_config = config[env]
    
    print(f"[日志清理] 开始清理旧日志文件，保留数量: {current_config.LOG_BACKUP_COUNT}")
    
    if current_config.LOG_BACKUP_COUNT <= 0:
        print("[日志清理] LOG_BACKUP_COUNT <= 0，不执行清理")
        return
    
    try:
        # 获取日志目录
        log_dir = current_config.LOG_DIR
        
        # 检查日志目录是否存在
        if not os.path.exists(log_dir):
            print(f"[日志清理] 日志目录不存在: {log_dir}")
            return
        
        # 获取日志文件前缀和后缀
        log_prefix = current_config.LOG_FILE_PREFIX
        log_suffix = current_config.LOG_FILE_SUFFIX
        
        # 正则表达式匹配日志文件名，格式如：keyguard.2023-10-01.log
        log_pattern = re.compile(rf'{log_prefix}\.(\d{{4}}-\d{{2}}-\d{{2}}){log_suffix}$')
        
        # 获取所有日志文件
        log_files = []
        for filename in os.listdir(log_dir):
            match = log_pattern.match(filename)
            if match:
                date_str = match.group(1)
                try:
                    # 解析日期
                    log_date = datetime.strptime(date_str, '%Y-%m-%d')
                    log_files.append((log_date, os.path.join(log_dir, filename)))
                except ValueError:
                    # 忽略日期格式错误的文件
                    continue
        
        # 按日期排序，最新的在前
        log_files.sort(reverse=True)
        
        print(f"[日志清理] 找到 {len(log_files)} 个日志文件")
        
        # 如果文件数量超过backupCount，删除最旧的文件
        if len(log_files) > current_config.LOG_BACKUP_COUNT:
            files_to_delete = log_files[current_config.LOG_BACKUP_COUNT:]
            print(f"[日志清理] 需要删除 {len(files_to_delete)} 个旧日志文件")
            
            for log_date, file_path in files_to_delete:
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                        print(f"[日志清理] 已删除: {os.path.basename(file_path)}")
                    except Exception as e:
                        print(f"[日志清理] 删除文件失败 {os.path.basename(file_path)}: {str(e)}")
        else:
            print(f"[日志清理] 日志文件数量 ({len(log_files)}) 未超过保留限制 ({current_config.LOG_BACKUP_COUNT})，无需清理")
            
    except Exception as e:
        print(f"[日志清理] 清理旧日志文件时发生错误: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        print("[日志清理] 清理完成")


# 如果直接运行此脚本，执行清理
if __name__ == "__main__":
    cleanup_old_logs()

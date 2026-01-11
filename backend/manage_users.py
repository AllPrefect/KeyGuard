#!/usr/bin/env python3
"""
用户管理脚本
用于通过后端直接管理用户，支持创建、查询、更新、删除等操作
"""

import sys
import datetime
import os

# 添加src目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from models.user import User
from utils.db import Database

class UserManager:
    """用户管理器"""
    
    def print_menu(self):
        """打印菜单"""
        print("\n=== 用户管理系统 ===")
        print("1. 列出所有用户")
        print("2. 查询用户详情")
        print("3. 更新用户信息")
        print("4. 删除用户")
        print("5. 创建新用户")
        print("6. 退出")
        print("=" * 30)
    
    def list_users(self):
        """列出所有用户"""
        try:
            print("\n正在查询所有用户...")
            
            # 初始化数据库
            Database.init_db()
            
            users = User.get_all()
            
            if users:
                print("\n数据库中的用户列表:")
                print("ID\t用户名\t	创建时间\t\t\t更新时间")
                print("-" * 90)
                for user in users:
                    print(f"{user.id[:8]}...\t{user.username}\t{user.created_at[:19]}\t{user.updated_at[:19]}")
            else:
                print("\n数据库中没有用户")
                
        except Exception as e:
            print(f"❌ 查询用户列表失败: {str(e)}")
    
    def get_user_detail(self):
        """查询用户详情"""
        try:
            user_id = input("\n输入要查询的用户ID: ").strip()
            if not user_id:
                print("❌ 用户ID不能为空")
                return
            
            # 初始化数据库
            Database.init_db()
            
            user = User.get_by_id(user_id)
            
            if user:
                print("\n用户详情:")
                print("-" * 50)
                print(f"ID: {user.id}")
                print(f"用户名: {user.username}")
                print(f"创建时间: {user.created_at[:19]}")
                print(f"更新时间: {user.updated_at[:19]}")
                print(f"邀请码: {user.invite_code}")
                print("-" * 50)
            else:
                print(f"❌ 未找到ID为 {user_id} 的用户")
                
        except Exception as e:
            print(f"❌ 查询用户详情失败: {str(e)}")
    
    def update_user(self):
        """更新用户信息"""
        try:
            user_id = input("\n输入要更新的用户ID: ").strip()
            if not user_id:
                print("❌ 用户ID不能为空")
                return
            
            # 初始化数据库
            Database.init_db()
            
            # 检查用户是否存在
            user = User.get_by_id(user_id)
            if not user:
                print(f"❌ 未找到ID为 {user_id} 的用户")
                return
            
            print(f"\n当前用户信息:")
            print(f"用户名: {user.username}")
            
            # 获取更新信息
            new_username = input("\n输入新用户名（留空不修改）: ").strip()
            new_password = input("输入新密码（留空不修改）: ").strip()
            
            # 准备更新数据
            update_data = {}
            if new_username:
                update_data['username'] = new_username
            if new_password:
                update_data['password'] = new_password
            
            if not update_data:
                print("❌ 没有需要更新的信息")
                return
            
            # 执行更新
            success = User.update(user_id, update_data)
            
            if success:
                print(f"✅ 用户ID {user_id} 更新成功")
                
                # 显示更新后的信息
                updated_user = User.get_by_id(user_id)
                if updated_user:
                    print("\n更新后的用户信息:")
                    print(f"用户名: {updated_user.username}")
                    print(f"更新时间: {updated_user.updated_at[:19]}")
            else:
                print(f"❌ 用户ID {user_id} 更新失败")
                
        except Exception as e:
            print(f"❌ 更新用户信息失败: {str(e)}")
    
    def delete_user(self):
        """删除用户"""
        try:
            user_id = input("\n输入要删除的用户ID: ").strip()
            if not user_id:
                print("❌ 用户ID不能为空")
                return
            
            # 初始化数据库
            Database.init_db()
            
            # 检查用户是否存在
            user = User.get_by_id(user_id)
            if not user:
                print(f"❌ 未找到ID为 {user_id} 的用户")
                return
            
            # 确认删除
            confirm = input(f"\n确定要删除用户 {user.username} (ID: {user_id}) 吗？此操作不可恢复！(y/N): ").strip().lower()
            if confirm != 'y':
                print("✅ 删除操作已取消")
                return
            
            # 执行删除
            success = User.delete(user_id)
            
            if success:
                print(f"✅ 用户 {user.username} (ID: {user_id}) 删除成功")
            else:
                print(f"❌ 用户 {user.username} (ID: {user_id}) 删除失败")
                
        except Exception as e:
            print(f"❌ 删除用户失败: {str(e)}")
    
    def create_user(self):
        """创建新用户"""
        try:
            print("\n创建新用户")
            
            # 初始化数据库
            Database.init_db()
            
            username = input("输入用户名: ").strip()
            if not username:
                print("❌ 用户名不能为空")
                return
            
            # 检查用户名是否已存在
            existing_user = User.get_by_username(username)
            if existing_user:
                print(f"❌ 用户名 {username} 已存在")
                return
            
            password = input("输入密码: ").strip()
            if not password:
                print("❌ 密码不能为空")
                return
            
            invite_code = input("输入邀请码（留空使用默认值）: ").strip()
            if not invite_code:
                invite_code = "default_invite_code"
            
            # 创建用户
            user_id = User.create(username, password, invite_code)
            
            if user_id:
                print(f"✅ 用户 {username} 创建成功，用户ID: {user_id[:8]}...")
            else:
                print("❌ 用户创建失败")
                
        except Exception as e:
            print(f"❌ 创建用户失败: {str(e)}")
    
    def run(self):
        """运行用户管理器"""
        while True:
            self.print_menu()
            choice = input("\n请输入您的选择 (1-6): ").strip()
            
            if choice == '1':
                self.list_users()
            elif choice == '2':
                self.get_user_detail()
            elif choice == '3':
                self.update_user()
            elif choice == '4':
                self.delete_user()
            elif choice == '5':
                self.create_user()
            elif choice == '6':
                print("\n感谢使用用户管理系统，再见！")
                break
            else:
                print("\n❌ 无效的选择，请重新输入")


if __name__ == "__main__":
    # 初始化数据库
    Database.init_db()
    
    user_manager = UserManager()
    user_manager.run()
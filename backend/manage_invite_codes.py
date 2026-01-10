#!/usr/bin/env python3
"""
邀请码管理脚本
用于通过后端直接管理邀请码，支持创建、查询、更新、删除等操作
"""

import sys
import datetime
import os

# 添加src目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from models.invite_code import InviteCode

class InviteCodeManager:
    """邀请码管理器"""
    
    def print_menu(self):
        """打印菜单"""
        print("\n=== 邀请码管理系统 ===")
        print("1. 创建邀请码")
        print("2. 创建多个邀请码")
        print("3. 查询所有邀请码")
        print("4. 查询可用邀请码")
        print("5. 查询指定状态的邀请码")
        print("6. 标记邀请码为已使用")
        print("7. 撤销邀请码")
        print("8. 删除邀请码")
        print("9. 清理过期邀请码")
        print("10. 退出")
        print("=" * 30)
    
    def create_invite_code(self):
        """创建单个邀请码"""
        code = input("输入邀请码（留空自动生成）: ").strip()
        expires_days = input("输入有效期天数（留空默认30天）: ").strip()
        
        expires_at = None
        if expires_days:
            try:
                expires_days = int(expires_days)
                expires_at = (datetime.datetime.now() + datetime.timedelta(days=expires_days)).isoformat()
            except ValueError:
                print("⚠️  有效期天数必须是数字，将使用默认值30天")
        
        created_code = InviteCode.create(code=code, expires_at=expires_at)
        if created_code:
            print(f"✅ 邀请码创建成功: {created_code}")
        else:
            print("❌ 邀请码创建失败")
    
    def create_multiple_codes(self):
        """创建多个邀请码"""
        count = input("输入要创建的邀请码数量: ").strip()
        try:
            count = int(count)
            if count <= 0:
                print("❌ 数量必须大于0")
                return
        except ValueError:
            print("❌ 数量必须是数字")
            return
        
        expires_days = input("输入有效期天数（留空默认30天）: ").strip()
        expires_at = None
        if expires_days:
            try:
                expires_days = int(expires_days)
                expires_at = (datetime.datetime.now() + datetime.timedelta(days=expires_days)).isoformat()
            except ValueError:
                print("⚠️  有效期天数必须是数字，将使用默认值30天")
        
        print(f"\n正在创建{count}个邀请码...")
        created_codes = []
        for i in range(count):
            created_code = InviteCode.create(expires_at=expires_at)
            if created_code:
                created_codes.append(created_code)
                print(f"✅ 创建邀请码 {i+1}/{count}: {created_code}")
            else:
                print(f"❌ 创建邀请码 {i+1}/{count} 失败")
        
        print(f"\n创建完成！成功创建 {len(created_codes)} 个邀请码")
        if created_codes:
            print("创建的邀请码: " + " ".join(created_codes))
    
    def list_all_codes(self):
        """查询所有邀请码"""
        codes = InviteCode.get_all_invite_codes()
        self._print_codes(codes)
    
    def list_available_codes(self):
        """查询可用邀请码"""
        codes = InviteCode.get_available_codes()
        self._print_codes(codes)
    
    def list_codes_by_status(self):
        """查询指定状态的邀请码"""
        print("可用状态: ")
        print(f"  {InviteCode.STATUS_ACTIVE} - 可用")
        print(f"  {InviteCode.STATUS_USED} - 已使用")
        print(f"  {InviteCode.STATUS_EXPIRED} - 已过期")
        print(f"  {InviteCode.STATUS_REVOKED} - 已撤销")
        
        status = input("输入要查询的状态: ").strip()
        if status not in InviteCode.VALID_STATUSES:
            print(f"❌ 无效的状态，可用状态: {', '.join(InviteCode.VALID_STATUSES)}")
            return
        
        codes = InviteCode.get_by_status(status)
        self._print_codes(codes)
    
    def mark_as_used(self):
        """标记邀请码为已使用"""
        code = input("输入要标记为已使用的邀请码: ").strip()
        if InviteCode.mark_as_used(code):
            print(f"✅ 邀请码 {code} 已标记为已使用")
        else:
            print(f"❌ 邀请码 {code} 标记失败，可能不存在")
    
    def revoke_code(self):
        """撤销邀请码"""
        code = input("输入要撤销的邀请码: ").strip()
        if InviteCode.revoke(code):
            print(f"✅ 邀请码 {code} 已撤销")
        else:
            print(f"❌ 邀请码 {code} 撤销失败，可能不存在")
    
    def delete_code(self):
        """删除邀请码"""
        code = input("输入要删除的邀请码: ").strip()
        if InviteCode.delete(code):
            print(f"✅ 邀请码 {code} 已删除")
        else:
            print(f"❌ 邀请码 {code} 删除失败，可能不存在")
    
    def cleanup_expired(self):
        """清理过期邀请码"""
        result = InviteCode.cleanup_expired()
        if result:
            print("✅ 已清理所有过期邀请码")
        else:
            print("❌ 清理过期邀请码失败")
    
    def _print_codes(self, codes):
        """打印邀请码列表"""
        if not codes:
            print("⚠️  没有找到邀请码")
            return
        
        print(f"\n找到 {len(codes)} 个邀请码:")
        print("=" * 80)
        print(f"{'ID':<10} {'邀请码':<10} {'状态':<12} {'创建时间':<25} {'过期时间':<25}")
        print("=" * 80)
        
        for code in codes:
            # 格式化日期显示
            created_at = datetime.datetime.fromisoformat(code.created_at).strftime('%Y-%m-%d %H:%M:%S')
            expires_at = datetime.datetime.fromisoformat(code.expires_at).strftime('%Y-%m-%d %H:%M:%S')
            
            # 获取状态的中文描述
            status_map = {
                InviteCode.STATUS_ACTIVE: "可用",
                InviteCode.STATUS_USED: "已使用",
                InviteCode.STATUS_EXPIRED: "已过期",
                InviteCode.STATUS_REVOKED: "已撤销"
            }
            status_cn = status_map.get(code.status, code.status)
            
            print(f"{code.id:<10} {code.code:<10} {status_cn:<12} {created_at:<25} {expires_at:<25}")
        
        print("=" * 80)
    
    def run(self):
        """运行管理工具"""
        print("欢迎使用邀请码管理系统！")
        
        while True:
            self.print_menu()
            choice = input("请选择操作 (1-10): ").strip()
            
            if choice == '1':
                self.create_invite_code()
            elif choice == '2':
                self.create_multiple_codes()
            elif choice == '3':
                self.list_all_codes()
            elif choice == '4':
                self.list_available_codes()
            elif choice == '5':
                self.list_codes_by_status()
            elif choice == '6':
                self.mark_as_used()
            elif choice == '7':
                self.revoke_code()
            elif choice == '8':
                self.delete_code()
            elif choice == '9':
                self.cleanup_expired()
            elif choice == '10':
                print("感谢使用邀请码管理系统！再见！")
                break
            else:
                print("❌ 无效的选择，请输入1-10之间的数字")
            
            # 按任意键继续
            input("\n按回车键继续...")

if __name__ == "__main__":
    manager = InviteCodeManager()
    manager.run()

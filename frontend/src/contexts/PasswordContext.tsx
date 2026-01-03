import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Password, Category } from '../types';
import { fetchPasswords, savePassword as apiSavePassword, deletePassword as apiDeletePassword } from '../services/passwordService';

// 定义上下文类型
interface PasswordContextType {
  passwords: Password[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  savePassword: (password: Password) => Promise<void>;
  deletePassword: (id: string) => Promise<void>;
  refreshPasswords: () => Promise<void>;
}

// 创建上下文
const PasswordContext = createContext<PasswordContextType | undefined>(undefined);

// 定义提供器组件的属性类型
interface PasswordProviderProps {
  children: ReactNode;
}

// 密码提供器组件
export const PasswordProvider: React.FC<PasswordProviderProps> = ({ children }) => {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 获取所有密码
  const loadPasswords = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchPasswords();
      setPasswords(data);
      
      // 提取唯一的类别
      const uniqueCategories = Array.from(new Set(data.map(p => p.category))).sort();
      setCategories(uniqueCategories.map(cat => ({ name: cat })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load passwords');
      console.error('Error loading passwords:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载密码
  useEffect(() => {
    loadPasswords();
  }, []);

  // 保存密码
  const savePassword = async (password: Password) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiSavePassword(password);
      await loadPasswords(); // 刷新密码列表
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save password');
      console.error('Error saving password:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 删除密码
  const deletePassword = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiDeletePassword(id);
      await loadPasswords(); // 刷新密码列表
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete password');
      console.error('Error deleting password:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 刷新密码
  const refreshPasswords = async () => {
    await loadPasswords();
  };

  // 上下文值
  const contextValue: PasswordContextType = {
    passwords,
    categories,
    isLoading,
    error,
    savePassword,
    deletePassword,
    refreshPasswords
  };

  return (
    <PasswordContext.Provider value={contextValue}>
      {children}
    </PasswordContext.Provider>
  );
};

// 自定义钩子，用于在组件中使用密码上下文
export const usePasswords = (): PasswordContextType => {
  const context = useContext(PasswordContext);
  if (context === undefined) {
    throw new Error('usePasswords must be used within a PasswordProvider');
  }
  return context;
};

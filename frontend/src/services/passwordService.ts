// 导入类型定义
import { Password } from '../types';

// API基础URL
const API_BASE_URL = '/api';

/**
 * 保存密码到后端API
 * @param passwordData 密码数据
 * @returns 是否保存成功
 */
export const savePassword = async (passwordData: Password): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/passwords`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(passwordData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to save password');
    }
    
    return true;
  } catch (error) {
    console.error('Error saving password:', error);
    throw error;
  }
};

/**
 * 从后端API获取所有密码
 * @returns 密码数组
 */
export const fetchPasswords = async (): Promise<Password[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/passwords`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch passwords');
    }
    
    const passwords = await response.json();
    return passwords;
  } catch (error) {
    console.error('Error fetching passwords:', error);
    throw error;
  }
};

/**
 * 从后端API删除密码
 * @param id 密码ID
 * @returns 是否删除成功
 */
export const deletePassword = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/passwords/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete password');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting password:', error);
    throw error;
  }
};

/**
 * 从后端API获取单个密码
 * @param id 密码ID
 * @returns 密码数据
 */
export const fetchPasswordById = async (id: string): Promise<Password | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/passwords/${id}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch password');
    }
    
    const password = await response.json();
    return password;
  } catch (error) {
    console.error('Error fetching password by id:', error);
    throw error;
  }
};

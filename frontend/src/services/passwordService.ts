// 导入类型定义
import { Password } from '../types';

// API基础URL
const API_BASE_URL = '/api';

// 存储和获取认证令牌的键名
const AUTH_TOKEN_KEY = 'auth_token';

/**
 * 保存认证令牌到localStorage
 * @param token 认证令牌
 */
export const saveAuthToken = (token: string): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

/**
 * 从localStorage获取认证令牌
 * @returns 认证令牌或null
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * 从localStorage删除认证令牌
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

/**
 * 获取盐值
 * @param inviteCode 邀请码
 * @returns 盐值字符串
 */
export const getSalt = async (inviteCode: string): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/salt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inviteCode })
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.salt || null;
  } catch (error) {
    console.error('Error fetching salt:', error);
    return null;
  }
};

/**
 * 验证主密码（统一API - 登录或创建用户）
 * @param derivedHash 从主密码和盐值派生的哈希值
 * @param inviteCode 邀请码
 * @param salt 盐值
 * @returns 是否验证成功和用户信息
 */
export const authenticateMasterPassword = async (derivedHash: string, inviteCode: string, salt: string): Promise<{ success: boolean; token?: string; user?: any }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/master-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ derivedHash, inviteCode, salt })
    });
    
    if (!response.ok) {
      await response.json().catch(() => ({}));
      return { success: false };
    }
    
    const data = await response.json();
    
    if (data.success && data.token) {
      saveAuthToken(data.token);
      return { success: true, token: data.token, user: data.user };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error('Error authenticating master password:', error);
    return { success: false };
  }
};

/**
 * 获取认证请求头
 * @returns 包含认证令牌的请求头对象
 */
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  
  // 使用普通对象字面量，确保Authorization头能正确设置
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    // 确保Authorization头使用正确的格式
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * 处理API响应，如果返回401状态码，则清除认证令牌
 * @param response API响应对象
 * @returns 处理后的响应对象
 */
const handleApiResponse = async (response: Response): Promise<Response> => {
  if (response.status === 401) {
    // 清除认证令牌
    removeAuthToken();
    // 抛出特殊错误，供调用者处理
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.error || 'Authentication failed');
    (error as any).isUnauthorized = true;
    throw error;
  }
  return response;
};

/**
 * 保存密码到后端API
 * @param passwordData 密码数据
 * @returns 是否保存成功
 */
export const savePassword = async (passwordData: Password): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/passwords/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(passwordData)
    });
    
    // 处理API响应，检查401错误
    await handleApiResponse(response);
    
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
    const authHeaders = getAuthHeaders();
    
    // 确保URL路径与后端路由匹配，添加尾随斜杠
    const response = await fetch(`${API_BASE_URL}/passwords/`, {
      headers: authHeaders
    });
    
    // 处理API响应，检查401错误
    await handleApiResponse(response);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch passwords');
    }
    
    return await response.json();
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
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    // 处理API响应，检查401错误
    await handleApiResponse(response);
    
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
    const response = await fetch(`${API_BASE_URL}/passwords/${id}`, {
      headers: getAuthHeaders()
    });
    
    // 处理API响应，检查401错误
    await handleApiResponse(response);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch password');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching password by id:', error);
    throw error;
  }
};

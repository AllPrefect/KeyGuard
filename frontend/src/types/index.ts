// 定义密码数据接口
export interface Password {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  category: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  platform: string;
}

// PasswordData类型别名，确保与Password接口一致
export type PasswordData = Password;

// 分类接口
export interface Category {
  name: string;
}

// 表单数据接口
export interface FormData {
  title: string;
  username: string;
  password: string;
  url?: string;
  category: string;
  notes?: string;
  platform: string;
}

// 认证状态
export interface AuthState {
  isAuthenticated: boolean;
  masterPassword: string;
}

// 密码强度检查结果
export interface PasswordStrengthResult {
  isValid: boolean;
  message: string;
  score: number;
}

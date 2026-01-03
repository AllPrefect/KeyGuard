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
}

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

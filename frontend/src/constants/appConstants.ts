// API相关常量
export const API_BASE_URL = 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  PASSWORD: '/passwords'
};

// 加密相关常量
export const ENCRYPTION = {
  DEFAULT_KEY: 'default-encryption-key', // 注意：实际应用中应该使用更安全的方式管理密钥
  SALT_LENGTH: 16,
  IV_LENGTH: 16
};

// 默认类别
export const DEFAULT_CATEGORIES = [
  'Personal',
  'Work',
  'Social',
  'Email',
  'Finance',
  'Shopping',
  'Entertainment',
  'Other'
] as const;

// 密码强度等级
export const PASSWORD_STRENGTH = {
  WEAK: 0,
  MEDIUM: 1,
  STRONG: 2
};

// 应用主题颜色
export const COLORS = {
  PRIMARY: '#4F46E5', // 主色调 - 靛蓝色
  SECONDARY: '#F59E0B', // 辅助色 - 橙色
  SUCCESS: '#10B981', // 成功色 - 绿色
  DANGER: '#EF4444', // 危险色 - 红色
  WARNING: '#F59E0B', // 警告色 - 橙色
  INFO: '#3B82F6', // 信息色 - 蓝色
  LIGHT: '#F3F4F6', // 浅色 - 灰色
  DARK: '#1F2937', // 深色 - 深灰色
  BACKGROUND: '#FFFFFF', // 背景色 - 白色
  TEXT_PRIMARY: '#111827', // 主文本色 - 黑色
  TEXT_SECONDARY: '#6B7280' // 次要文本色 - 灰色
};

// 应用字体
export const FONTS = {
  DEFAULT: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  MONOSPACE: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
};

// 路由路径（如果未来添加路由）
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SETTINGS: '/settings'
};

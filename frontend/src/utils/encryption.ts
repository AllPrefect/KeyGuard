import CryptoJS from 'crypto-js';

// 加密配置常量
const ENCRYPTION_CONFIG = {
  KEY_SIZE: 512 / 32, // 512位密钥
  ITERATIONS: 10000,  // PBKDF2迭代次数（提高到10000次增强安全性）
  SALT_SIZE: 128 / 8, // 128位盐值
  IV_SIZE: 128 / 8    // 128位初始化向量
};

// 加密函数 - 使用AES-256-CBC算法，带盐值和IV增强安全性
export const encrypt = (text: string, key: string): string => {
  if (!text || !key) {
    throw new Error('Text and key are required for encryption');
  }

  // 生成随机盐值
  const salt = CryptoJS.lib.WordArray.random(ENCRYPTION_CONFIG.SALT_SIZE);
  // 生成随机初始化向量(IV)
  const iv = CryptoJS.lib.WordArray.random(ENCRYPTION_CONFIG.IV_SIZE);
  
  // 使用PBKDF2算法从密码和盐值生成密钥
  const derivedKey = CryptoJS.PBKDF2(key, salt, {
    keySize: ENCRYPTION_CONFIG.KEY_SIZE,
    iterations: ENCRYPTION_CONFIG.ITERATIONS
  });
  
  // 使用生成的密钥和IV加密数据
  const encrypted = CryptoJS.AES.encrypt(text, derivedKey, {
    iv: iv,
    mode: CryptoJS.mode.CBC, // 显式指定CBC模式
    padding: CryptoJS.pad.Pkcs7 // 显式指定PKCS#7填充
  });
  
  // 将盐值、IV和密文一起存储，格式：salt:iv:encrypted
  return `${salt.toString()}:${iv.toString()}:${encrypted.toString()}`;
};

// 解密函数 - 支持盐值和IV的解密
export const decrypt = (ciphertext: string, key: string): string => {
  if (!ciphertext || !key) {
    throw new Error('Ciphertext and key are required for decryption');
  }

  try {
    // 分离盐值、IV和密文
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid ciphertext format');
    }
    
    const salt = CryptoJS.enc.Hex.parse(parts[0]);
    const iv = CryptoJS.enc.Hex.parse(parts[1]);
    const encrypted = parts[2];
    
    // 使用相同的PBKDF2算法生成密钥
    const derivedKey = CryptoJS.PBKDF2(key, salt, {
      keySize: ENCRYPTION_CONFIG.KEY_SIZE,
      iterations: ENCRYPTION_CONFIG.ITERATIONS
    });
    
    // 解密数据
    const decrypted = CryptoJS.AES.decrypt(encrypted, derivedKey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
};

// 生成随机密码 - 包含大小写字母、数字和特殊字符
export const generateRandomPassword = (length: number = 12): string => {
  if (length < 8) {
    throw new Error('Password length must be at least 8 characters');
  }
  
  const charset = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };
  
  // 确保密码包含至少一种每种类型的字符
  let password = '';
  
  // 先添加每种类型的一个字符
  password += charset.lowercase.charAt(Math.floor(Math.random() * charset.lowercase.length));
  password += charset.uppercase.charAt(Math.floor(Math.random() * charset.uppercase.length));
  password += charset.numbers.charAt(Math.floor(Math.random() * charset.numbers.length));
  password += charset.special.charAt(Math.floor(Math.random() * charset.special.length));
  
  // 生成剩余长度的随机字符
  const allChars = Object.values(charset).join('');
  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // 打乱密码字符顺序
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// 验证密码强度
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  message: string;
  score: number;
} => {
  if (!password) {
    return {
      isValid: false,
      message: 'Password is required',
      score: 0
    };
  }
  
  let score = 0;
  
  // 长度检查
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // 字符类型检查
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  // 确定密码强度
  if (score < 3) {
    return {
      isValid: false,
      message: 'Password is too weak. It should be at least 8 characters long and include a mix of uppercase, lowercase, numbers, and special characters.',
      score
    };
  } else if (score < 5) {
    return {
      isValid: true,
      message: 'Password is medium strength',
      score
    };
  } else {
    return {
      isValid: true,
      message: 'Password is strong',
      score
    };
  }
};

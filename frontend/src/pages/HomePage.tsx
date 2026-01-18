import React, { useState, useEffect, useRef } from 'react';
import { savePassword, fetchPasswords, deletePassword, authenticateMasterPassword, removeAuthToken, getSalt } from '../services/passwordService';
import { encrypt, decrypt, generateRandomPassword, deriveEncryptionKey, deriveHash } from '../utils/encryption';
import { Password, FormData } from '../types';
import Header from '../components/Header';
import LoginForm from '../components/LoginForm';
import Toolbar from '../components/Toolbar';
import PasswordsList from '../components/PasswordsList';
import PasswordForm from '../components/PasswordForm';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { TOAST_TYPES, MESSAGES } from '../constants/appConstants';
import { ToastType } from '../components/Toast';

const HomePage: React.FC = () => {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingPassword, setEditingPassword] = useState<Password | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tempMasterPassword, setTempMasterPassword] = useState<string>(''); // 仅用于登录表单
  const [tempInviteCode, setTempInviteCode] = useState<string>(''); // 仅用于登录表单的邀请码
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const masterPasswordRef = useRef<string>(''); // 使用ref临时存储主密码，避免状态持久化
  const confirmCallbackRef = useRef<(() => Promise<void> | void) | null>(null); // 存储确认回调函数

  const [formData, setFormData] = useState<FormData>({
    title: '',
    username: '',
    password: '',
    url: '',
    category: '其他',
    notes: '',
    platform: ''
  });

  // Toast提示状态管理
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<ToastType>(TOAST_TYPES.INFO);
  
  // 确认对话框状态管理
  const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
  const [confirmMessage, setConfirmMessage] = useState<string>('');
  // 确认回调函数现在存储在 ref 中，不再使用 state

  // 检查localStorage中是否有现有token和邀请码
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    console.log('HomePage - Checking for existing token:', token);
    if (token) {
      console.log('HomePage - Token found, checking for cached encryption key in sessionStorage');
      // 从sessionStorage恢复加密密钥
      const cachedKey = sessionStorage.getItem('encryption_key');
      if (cachedKey) {
        console.log('HomePage - Found cached encryption key in sessionStorage');
        // 恢复到ref中
        masterPasswordRef.current = cachedKey;
        setIsAuthenticated(true);
        showToast('会话已恢复', TOAST_TYPES.INFO);
      } else {
        console.log('HomePage - No cached encryption key found, need to re-authenticate');
        // 显示提示并设置为未认证状态
        showToast('会话已过期，请重新输入主密码', TOAST_TYPES.WARNING);
        setIsAuthenticated(false);
      }
    } else {
      console.log('HomePage - No token found in localStorage');
      // 清除可能存在的缓存密钥
      sessionStorage.removeItem('encryption_key');
      // 加载缓存的邀请码
      const cachedInviteCode = localStorage.getItem('cached_invite_code');
      if (cachedInviteCode) {
        console.log('HomePage - Found cached invite code:', cachedInviteCode);
        setTempInviteCode(cachedInviteCode);
      }
    }
  }, []);

  // 显示Toast提示
  const showToast = (message: string, type: ToastType = TOAST_TYPES.INFO) => {
    console.log('showToast called:', message, type);
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    console.log('Toast state updated:', toastVisible, toastMessage, toastType);
  };

  // 显示确认对话框
  const showConfirm = (message: string, callback: () => Promise<void> | void) => {
    setConfirmMessage(message);
    confirmCallbackRef.current = callback; // 将回调函数存储在 ref 中
    setConfirmVisible(true);
  };

  // 处理确认操作
  const handleConfirm = async () => {
    if (confirmCallbackRef.current) {
      await confirmCallbackRef.current();
    }
    setConfirmVisible(false);
    confirmCallbackRef.current = null; // 清空 ref
  };

  // 处理取消操作
  const handleCancel = () => {
    setConfirmVisible(false);
    confirmCallbackRef.current = null; // 清空 ref
  };

  // 加载密码数据
  useEffect(() => {
    const loadPasswords = async () => {
      if (isAuthenticated) {
        try {
          // 短暂延迟确保token已保存
          await new Promise(resolve => setTimeout(resolve, 100));
          const savedPasswords = await fetchPasswords();
          setPasswords(savedPasswords || []);
        } catch (error) {
          console.error('Failed to load passwords:', error);
          setPasswords([]);
          // 检查是否是401错误（令牌过期）
          if ((error as any).isUnauthorized) {
            showToast('登录已过期，请重新登录', TOAST_TYPES.ERROR);
            handleLogout();
          } else {
            showToast('加载密码失败', TOAST_TYPES.ERROR);
          }
        }
      }
    };
    loadPasswords();
  }, [isAuthenticated]);

  // 处理表单输入
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 添加/编辑密码
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 检查密码字段是否为空
    if (!formData.password.trim()) {
      showToast(MESSAGES.REQUIRED_PASSWORD, TOAST_TYPES.WARNING);
      return;
    }
    
    // 检查masterPassword是否存在
    if (!masterPasswordRef.current) {
      console.error('Master password is required for encryption');
      showToast(MESSAGES.RELOGIN_REQUIRED, TOAST_TYPES.ERROR);
      handleLogout();
      return;
    }
    
    try {
      let updatedPassword: Password;
      
      if (editingPassword) {
        // 编辑现有密码
        updatedPassword = {
          ...formData,
          id: editingPassword.id,
          createdAt: editingPassword.createdAt
        };
        
        // 加密密码
        updatedPassword.password = encrypt(updatedPassword.password, masterPasswordRef.current);
        
        // 保存到数据库
        await savePassword(updatedPassword);
        
        // 更新状态，保持加密状态
        const updatedPasswords = passwords.map(pwd =>
          pwd.id === updatedPassword.id
            ? updatedPassword
            : pwd
        );
        setPasswords(updatedPasswords);
        showToast('密码更新成功', TOAST_TYPES.SUCCESS);
      } else {
        // 添加新密码
        updatedPassword = {
          ...formData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        
        // 加密密码
        updatedPassword.password = encrypt(updatedPassword.password, masterPasswordRef.current);
        
        // 保存到数据库
        await savePassword(updatedPassword);
        
        // 更新状态，保持加密状态
        const updatedPasswords = [...passwords, updatedPassword];
        setPasswords(updatedPasswords);
        showToast('密码添加成功', TOAST_TYPES.SUCCESS);
      }
      
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save password:', error);
      // 检查是否是401错误（令牌过期）
      if ((error as any).isUnauthorized) {
        showToast('登录已过期，请重新登录', TOAST_TYPES.ERROR);
        handleLogout();
      } else {
        showToast('保存密码失败', TOAST_TYPES.ERROR);
      }
    }
  };

  // 删除密码
  const handleDelete = async (id: string) => {
    showConfirm(MESSAGES.CONFIRM_DELETE, async () => {
      try {
        // 从数据库删除
        await deletePassword(id);
        
        // 更新状态
        const updatedPasswords = passwords.filter(pwd => pwd.id !== id);
        setPasswords(updatedPasswords);
      } catch (error) {
        console.error('Failed to delete password:', error);
        // 检查是否是401错误（令牌过期）
        if ((error as any).isUnauthorized) {
          showToast('登录已过期，请重新登录', TOAST_TYPES.ERROR);
          handleLogout();
        } else {
          showToast(MESSAGES.DELETE_FAILED, TOAST_TYPES.ERROR);
        }
      }
    });
  };

  // 编辑密码
  const handleEdit = (encryptedPassword: Password) => {
    // 检查masterPassword是否存在
    if (!masterPasswordRef.current) {
      console.error('Master password is required for decryption');
      showToast(MESSAGES.RELOGIN_REQUIRED, TOAST_TYPES.ERROR);
      handleLogout();
      return;
    }
    
    try {
      // 仅在需要时解密密码用于编辑
      const decryptedPassword = decrypt(encryptedPassword.password, masterPasswordRef.current);
      
      // 创建包含解密密码的临时对象用于表单编辑
      const passwordForEdit = {
        ...encryptedPassword,
        password: decryptedPassword
      };
      
      setFormData(passwordForEdit);
      setEditingPassword(encryptedPassword); // 保存原始加密数据用于后续比较
      setShowModal(true);
    } catch (error) {
      console.error('Failed to decrypt password for editing:', error);
      showToast(MESSAGES.EDIT_FAILED, TOAST_TYPES.ERROR);
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: '',
      username: '',
      password: '',
      url: '',
      category: '其他',
      notes: '',
      platform: ''
    });
    setEditingPassword(null);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // 主密码验证或创建
  const handleMasterPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tempMasterPassword.trim() && tempInviteCode.trim()) {
      try {
        // 1. 使用邀请码获取盐值
        const salt = await getSalt(tempInviteCode);
        if (!salt) {
          showToast('获取盐值失败，请重试', TOAST_TYPES.ERROR);
          setTempMasterPassword('');
          setTempInviteCode('');
          return;
        }
        
        // 3. 派生加密密钥
        const encryptionKey = deriveEncryptionKey(tempMasterPassword, salt);
        if (!encryptionKey) {
          showToast('生成加密密钥失败，请重试', TOAST_TYPES.ERROR);
          setTempMasterPassword('');
          setTempInviteCode('');
          return;
        }
        
        // 4. 派生哈希值用于身份验证
        const hash = deriveHash(tempMasterPassword, salt);
        if (!hash) {
          showToast('生成哈希值失败，请重试', TOAST_TYPES.ERROR);
          setTempMasterPassword('');
          setTempInviteCode('');
          return;
        }
        
        // 4. 调用统一认证API - 登录或创建用户
        const result = await authenticateMasterPassword(hash, tempInviteCode, salt);
        
        if (result.success) {
          // 存储加密密钥到ref和sessionStorage中
          masterPasswordRef.current = encryptionKey;
          sessionStorage.setItem('encryption_key', encryptionKey);
          console.log('HomePage - Encryption key stored in ref and sessionStorage');
          // 缓存邀请码到localStorage
          localStorage.setItem('cached_invite_code', tempInviteCode);
          // 清空临时状态
          setTempMasterPassword('');
          setTempInviteCode('');
          setIsAuthenticated(true);
          showToast('认证成功', TOAST_TYPES.SUCCESS);
        } else {
          showToast(MESSAGES.AUTH_FAILED, TOAST_TYPES.ERROR);
          // 清空临时状态
          setTempMasterPassword('');
          setTempInviteCode('');
        }
      } catch (error) {
        console.error('认证过程发生错误:', error);
        showToast('认证失败，请重试', TOAST_TYPES.ERROR);
        setTempMasterPassword('');
        setTempInviteCode('');
      }
    }
  };

  // 登出
  const handleLogout = () => {
    setIsAuthenticated(false);
    // 清除主密码的临时存储
    masterPasswordRef.current = '';
    // 清除sessionStorage中的加密密钥
    sessionStorage.removeItem('encryption_key');
    setPasswords([]);
    removeAuthToken();
  };

  // 复制密码
  const handleCopyPassword = async (encryptedPassword: string) => {
    // 检查masterPassword是否存在
    if (!masterPasswordRef.current) {
      console.error('Master password is required for decryption');
      showToast(MESSAGES.RELOGIN_REQUIRED, TOAST_TYPES.ERROR);
      handleLogout();
      return;
    }
    
    try {
      // 仅在需要时解密，使用后立即丢弃
      const decryptedPassword = decrypt(encryptedPassword, masterPasswordRef.current);
      
      // 优先使用现代的clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(decryptedPassword);
        showToast(MESSAGES.PASSWORD_COPIED, TOAST_TYPES.SUCCESS);
      } else {
        // 使用传统的document.execCommand('copy')作为备用方案
        // 创建一个临时的input元素
        const textArea = document.createElement('textarea');
        textArea.value = decryptedPassword;
        textArea.style.position = 'fixed'; // 移出可视区域
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        
        // 选择并复制文本
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (success) {
          showToast(MESSAGES.PASSWORD_COPIED, TOAST_TYPES.SUCCESS);
        } else {
          throw new Error('execCommand copy failed');
        }
      }
    } catch (error) {
      console.error('Failed to decrypt and copy password:', error);
      showToast(MESSAGES.COPY_FAILED, TOAST_TYPES.ERROR);
    }
  };

  // 生成密码
  const handleGeneratePassword = () => {
    const password = generateRandomPassword(12);
    setFormData(prev => ({ ...prev, password }));
  };

  return (
    <div className="container">
      <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      
      {!isAuthenticated ? (
        <LoginForm
        masterPassword={tempMasterPassword}
        inviteCode={tempInviteCode}
        onMasterPasswordChange={setTempMasterPassword}
        onInviteCodeChange={(code) => {
          setTempInviteCode(code);
          if (code) {
            localStorage.setItem('cached_invite_code', code);
          } else {
            localStorage.removeItem('cached_invite_code');
          }
        }}
        onSubmit={handleMasterPasswordSubmit}
      />
      ) : (
        <>
          <div className="content">
            <Toolbar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onAddPassword={() => setShowModal(true)}
            />

            <PasswordsList
              passwords={passwords}
              searchTerm={searchTerm}
              onCopyPassword={handleCopyPassword}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>

          {showModal && (
            <PasswordForm
              formData={formData}
              editingPassword={editingPassword}
              onInputChange={handleInputChange}
              onGeneratePassword={handleGeneratePassword}
              onSubmit={handleSubmit}
              onClose={handleCloseModal}
            />
          )}
        </>
      )}
      
      {/* Toast提示组件 - 始终渲染 */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
      
      {/* 确认对话框组件 */}
      <ConfirmDialog
        message={confirmMessage}
        isVisible={confirmVisible}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default HomePage;

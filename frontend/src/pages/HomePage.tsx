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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const masterPasswordRef = useRef<string>(''); // 使用ref临时存储主密码，避免状态持久化

  const [formData, setFormData] = useState<FormData>({
    title: '',
    username: '',
    password: '',
    url: '',
    category: '其他',
    notes: ''
  });

  // Toast提示状态管理
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<ToastType>(TOAST_TYPES.INFO);
  
  // 确认对话框状态管理
  const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
  const [confirmMessage, setConfirmMessage] = useState<string>('');
  const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(null);

  // 检查localStorage中是否有现有token
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    console.log('HomePage - Checking for existing token:', token);
    if (token) {
      console.log('HomePage - Token found, setting authenticated to true');
      setIsAuthenticated(true);
    } else {
      console.log('HomePage - No token found in localStorage');
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
  const showConfirm = (message: string, callback: () => void) => {
    setConfirmMessage(message);
    setConfirmCallback(callback);
    setConfirmVisible(true);
  };

  // 处理确认操作
  const handleConfirm = () => {
    if (confirmCallback) {
      confirmCallback();
    }
    setConfirmVisible(false);
    setConfirmCallback(null);
  };

  // 处理取消操作
  const handleCancel = () => {
    setConfirmVisible(false);
    setConfirmCallback(null);
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
          showToast('加载密码失败', TOAST_TYPES.ERROR);
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
      showToast('保存密码失败', TOAST_TYPES.ERROR);
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
        showToast(MESSAGES.DELETE_FAILED, TOAST_TYPES.ERROR);
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
      notes: ''
    });
    setEditingPassword(null);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // 主密码验证
  const handleMasterPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tempMasterPassword.trim()) {
      try {
        // 1. 获取盐值
        const salt = await getSalt();
        if (!salt) {
          showToast('获取盐值失败，请重试', TOAST_TYPES.ERROR);
          setTempMasterPassword('');
          return;
        }
        
        // 2. 派生加密密钥
        const encryptionKey = deriveEncryptionKey(tempMasterPassword, salt);
        
        // 3. 派生哈希值用于身份验证
        const hash = deriveHash(tempMasterPassword, salt);
        
        // 4. 发送哈希值到后端进行验证（不再发送盐值）
        const result = await authenticateMasterPassword(hash);
        
        if (result.success) {
          // 仅在验证成功后存储加密密钥到ref中（不再存储明文密码）
          masterPasswordRef.current = encryptionKey;
          // 清空临时状态
          setTempMasterPassword('');
          setIsAuthenticated(true);
        } else {
          showToast(MESSAGES.AUTH_FAILED, TOAST_TYPES.ERROR);
          // 清空临时状态
          setTempMasterPassword('');
        }
      } catch (error) {
        console.error('登录过程发生错误:', error);
        showToast('登录失败，请重试', TOAST_TYPES.ERROR);
        setTempMasterPassword('');
      }
    }
  };

  // 登出
  const handleLogout = () => {
    setIsAuthenticated(false);
    // 清除主密码的临时存储
    masterPasswordRef.current = '';
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
      await navigator.clipboard.writeText(decryptedPassword);
      showToast(MESSAGES.PASSWORD_COPIED, TOAST_TYPES.SUCCESS);
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
          onMasterPasswordChange={setTempMasterPassword}
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

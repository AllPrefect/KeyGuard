import React, { useState, useEffect, useRef } from 'react';
import { savePassword, fetchPasswords, deletePassword, authenticateMasterPassword, removeAuthToken } from '../services/passwordService';
import { encrypt, decrypt, generateRandomPassword } from '../utils/encryption';
import { Password, FormData } from '../types';
import Header from '../components/Header';
import LoginForm from '../components/LoginForm';
import Toolbar from '../components/Toolbar';
import PasswordsList from '../components/PasswordsList';
import PasswordForm from '../components/PasswordForm';

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
      alert('密码不能为空');
      return;
    }
    
    // 检查masterPassword是否存在
    if (!masterPasswordRef.current) {
      console.error('Master password is required for encryption');
      alert('请重新登录以获取主密码');
      handleLogout();
      return;
    }
    
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
    }
    
    resetForm();
    setShowModal(false);
  };

  // 删除密码
  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个密码吗？')) {
      try {
        // 从数据库删除
        await deletePassword(id);
        
        // 更新状态
        const updatedPasswords = passwords.filter(pwd => pwd.id !== id);
        setPasswords(updatedPasswords);
      } catch (error) {
        console.error('Failed to delete password:', error);
        alert('删除密码失败');
      }
    }
  };

  // 编辑密码
  const handleEdit = (encryptedPassword: Password) => {
    // 检查masterPassword是否存在
    if (!masterPasswordRef.current) {
      console.error('Master password is required for decryption');
      alert('请重新登录以获取主密码');
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
      alert('编辑密码失败');
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
      const result = await authenticateMasterPassword(tempMasterPassword);
      if (result.success) {
        // 仅在验证成功后临时存储主密码到ref中
        masterPasswordRef.current = tempMasterPassword;
        // 清空临时状态
        setTempMasterPassword('');
        setIsAuthenticated(true);
      } else {
        alert('主密码验证失败，请重试');
        // 清空临时状态
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
      alert('请重新登录以获取主密码');
      handleLogout();
      return;
    }
    
    try {
      // 仅在需要时解密，使用后立即丢弃
      const decryptedPassword = decrypt(encryptedPassword, masterPasswordRef.current);
      await navigator.clipboard.writeText(decryptedPassword);
      alert('密码已复制到剪贴板');
    } catch (error) {
      console.error('Failed to decrypt and copy password:', error);
      alert('复制密码失败');
    }
  };

  // 生成密码
  const handleGeneratePassword = () => {
    const password = generateRandomPassword(12);
    setFormData(prev => ({ ...prev, password }));
  };

  if (!isAuthenticated) {
    return (
      <div className="container">
        <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <LoginForm
          masterPassword={tempMasterPassword}
          onMasterPasswordChange={setTempMasterPassword}
          onSubmit={handleMasterPasswordSubmit}
        />
      </div>
    );
  }

  return (
    <div className="container">
      <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />

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
    </div>
  );
};

export default HomePage;

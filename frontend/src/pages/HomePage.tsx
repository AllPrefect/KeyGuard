import React, { useState, useEffect } from 'react';
import { savePassword, fetchPasswords, deletePassword } from '../services/passwordService';
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
  const [masterPassword, setMasterPassword] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    username: '',
    password: '',
    url: '',
    category: '其他',
    notes: ''
  });

  // 加载密码数据
  useEffect(() => {
    const loadPasswords = async () => {
      if (isAuthenticated) {
        try {
          const savedPasswords = await fetchPasswords();
          if (savedPasswords && savedPasswords.length > 0) {
            // 解密每个密码的密码字段
            const decryptedPasswords = savedPasswords.map(pwd => ({
              ...pwd,
              password: decrypt(pwd.password, masterPassword)
            }));
            setPasswords(decryptedPasswords);
          } else {
            setPasswords([]);
          }
        } catch (error) {
          console.error('Failed to load passwords:', error);
          setPasswords([]);
        }
      }
    };
    loadPasswords();
  }, [isAuthenticated, masterPassword]);

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
    
    let updatedPassword: Password;
    
    if (editingPassword) {
      // 编辑现有密码
      updatedPassword = {
        ...formData,
        id: editingPassword.id,
        createdAt: editingPassword.createdAt
      };
      
      // 加密密码
      updatedPassword.password = encrypt(updatedPassword.password, masterPassword);
      
      // 保存到数据库
      await savePassword(updatedPassword);
      
      // 更新状态
      const updatedPasswords = passwords.map(pwd =>
        pwd.id === updatedPassword.id
          ? { ...updatedPassword, password: formData.password } // 保持明文密码用于状态
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
      updatedPassword.password = encrypt(updatedPassword.password, masterPassword);
      
      // 保存到数据库
      await savePassword(updatedPassword);
      
      // 更新状态
      const updatedPasswords = [...passwords, { ...updatedPassword, password: formData.password }];
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
  const handleEdit = (password: Password) => {
    setFormData(password);
    setEditingPassword(password);
    setShowModal(true);
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
  const handleMasterPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterPassword.trim()) {
      setIsAuthenticated(true);
    }
  };

  // 登出
  const handleLogout = () => {
    setIsAuthenticated(false);
    setMasterPassword('');
    setPasswords([]);
  };

  // 复制密码
  const handleCopyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    alert('密码已复制到剪贴板');
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
          masterPassword={masterPassword}
          onMasterPasswordChange={setMasterPassword}
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

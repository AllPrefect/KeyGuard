import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import './App.css';

const App = () => {
  const [passwords, setPasswords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPassword, setEditingPassword] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    category: '其他',
    notes: ''
  });

  const categories = ['社交', '工作', '金融', '娱乐', '购物', '其他'];

  // 加密函数
  const encrypt = (text, key) => {
    return CryptoJS.AES.encrypt(text, key).toString();
  };

  // 解密函数
  const decrypt = (ciphertext, key) => {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      return '';
    }
  };

  // 加载密码数据
  useEffect(() => {
    if (isAuthenticated) {
      const savedPasswords = localStorage.getItem('encryptedPasswords');
      if (savedPasswords) {
        try {
          const decryptedData = decrypt(savedPasswords, masterPassword);
          if (decryptedData) {
            setPasswords(JSON.parse(decryptedData));
          }
        } catch (error) {
          console.error('解密失败:', error);
        }
      }
    }
  }, [isAuthenticated, masterPassword]);

  // 保存密码数据
  const savePasswords = (passwordsToSave) => {
    const encryptedData = encrypt(JSON.stringify(passwordsToSave), masterPassword);
    localStorage.setItem('encryptedPasswords', encryptedData);
  };

  // 处理表单输入
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 添加/编辑密码
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingPassword) {
      // 编辑现有密码
      const updatedPasswords = passwords.map(pwd =>
        pwd.id === editingPassword.id
          ? { ...formData, id: editingPassword.id, createdAt: editingPassword.createdAt }
          : pwd
      );
      setPasswords(updatedPasswords);
      savePasswords(updatedPasswords);
    } else {
      // 添加新密码
      const newPassword = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      const updatedPasswords = [...passwords, newPassword];
      setPasswords(updatedPasswords);
      savePasswords(updatedPasswords);
    }
    
    resetForm();
    setShowModal(false);
  };

  // 删除密码
  const handleDelete = (id) => {
    if (window.confirm('确定要删除这个密码吗？')) {
      const updatedPasswords = passwords.filter(pwd => pwd.id !== id);
      setPasswords(updatedPasswords);
      savePasswords(updatedPasswords);
    }
  };

  // 编辑密码
  const handleEdit = (password) => {
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
  const handleMasterPasswordSubmit = (e) => {
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

  // 过滤密码
  const filteredPasswords = passwords.filter(password =>
    password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    password.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 按分类分组
  const passwordsByCategory = filteredPasswords.reduce((acc, password) => {
    if (!acc[password.category]) {
      acc[password.category] = [];
    }
    acc[password.category].push(password);
    return acc;
  }, {});

  // 生成密码
  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="header">
          <h1>🔐 密码管理器</h1>
          <p>安全存储您的账号密码</p>
        </div>
        
        <div className="auth-container">
          <div className="card">
            <h2>请输入主密码</h2>
            <form onSubmit={handleMasterPasswordSubmit}>
              <div className="form-group">
                <label>主密码:</label>
                <input
                  type="password"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  placeholder="输入您的主密码"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                进入密码管理器
              </button>
            </form>
            <p style={{ marginTop: '15px', fontSize: '0.9rem', color: '#666' }}>
              提示：请记住您的主密码，它是解密所有数据的唯一钥匙。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🔐 密码管理器</h1>
        <p>安全存储您的账号密码</p>
        <button onClick={handleLogout} className="btn btn-danger" style={{ marginTop: '15px' }}>
          退出登录
        </button>
      </div>

      <div className="content">
        <div className="toolbar">
          <div className="search-box">
            <input
              type="text"
              placeholder="搜索密码..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            ➕ 添加新密码
          </button>
        </div>

        <div className="passwords-list">
          {Object.keys(passwordsByCategory).length === 0 ? (
            <div className="card">
              <h3>暂无密码记录</h3>
              <p>点击"添加新密码"按钮开始存储您的密码。</p>
            </div>
          ) : (
            Object.entries(passwordsByCategory).map(([category, categoryPasswords]) => (
              <div key={category} className="category-section">
                <h2 className="category-title">{category} ({categoryPasswords.length})</h2>
                {categoryPasswords.map(password => (
                  <div key={password.id} className="password-item">
                    <div className="password-info">
                      <h3>{password.title}</h3>
                      <p><strong>用户名:</strong> {password.username}</p>
                      <p><strong>密码:</strong> ••••••••</p>
                      {password.url && <p><strong>网址:</strong> {password.url}</p>}
                      {password.notes && <p><strong>备注:</strong> {password.notes}</p>}
                      <small>创建时间: {new Date(password.createdAt).toLocaleDateString('zh-CN')}</small>
                    </div>
                    <div className="password-actions">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(decrypt(password.password, masterPassword));
                          alert('密码已复制到剪贴板');
                        }}
                        className="btn btn-primary"
                      >
                        复制密码
                      </button>
                      <button
                        onClick={() => handleEdit(password)}
                        className="btn btn-primary"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(password.id)}
                        className="btn btn-danger"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingPassword ? '编辑密码' : '添加新密码'}</h2>
              <button onClick={handleCloseModal} className="close-btn">×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>标题:</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="例如：Gmail账户"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>用户名/邮箱:</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="输入用户名或邮箱"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>密码:</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="输入密码"
                    required
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="btn btn-primary"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    生成
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label>网址 (可选):</label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </div>
              
              <div className="form-group">
                <label>分类:</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>备注 (可选):</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="添加备注信息"
                  rows="3"
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={handleCloseModal} className="btn btn-danger">
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPassword ? '更新' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
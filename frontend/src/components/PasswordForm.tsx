import React, { useState, useEffect } from 'react';
import { FormData, PasswordData } from '../types';
import { validatePasswordStrength } from '../utils/encryption';
import { platformTemplates } from '../utils/platformTemplates';
import PlatformSelect from './PlatformSelect';

interface PasswordFormProps {
  formData: FormData;
  editingPassword: PasswordData | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onGeneratePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const PasswordForm: React.FC<PasswordFormProps> = ({ 
  formData, 
  editingPassword, 
  onInputChange, 
  onGeneratePassword, 
  onSubmit, 
  onClose 
}) => {
  const categories = ['社交', '工作', '金融', '娱乐', '购物', '其他'];
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState({ 
    score: 0, 
    message: '', 
    isValid: false 
  });

  // 监听密码变化，更新密码强度
  useEffect(() => {
    if (formData.password) {
      const strength = validatePasswordStrength(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, message: '', isValid: false });
    }
  }, [formData.password]);

  // 获取密码强度对应的CSS类
  const getStrengthClass = (score: number): string => {
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  };

  // 表单验证状态
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // 验证表单字段
  const validateField = (fieldName: string, value: string): string => {
    let error = '';
    
    switch (fieldName) {
      case 'title':
        if (!value.trim()) {
          error = '标题不能为空';
        } else if (value.length > 50) {
          error = '标题不能超过50个字符';
        }
        break;
      case 'username':
        if (!value.trim()) {
          error = '账户不能为空';
        } else if (value.length > 100) {
          error = '账户不能超过100个字符';
        }
        break;
      case 'password':
        if (!value.trim()) {
          error = '密码不能为空';
        } else if (!passwordStrength.isValid && passwordStrength.score > 0) {
          error = '密码强度不够，请增加密码复杂度';
        }
        break;
      case 'url':
        if (value && !/^https?:\/\/.+/.test(value)) {
          error = '请输入有效的网址，以http://或https://开头';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  // 处理输入变化，添加实时验证
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    // 调用父组件的onInputChange处理函数
    onInputChange(e);
    
    // 实时验证当前字段
    const { name, value } = e.target;
    const error = validateField(name, value);
    
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // 验证整个表单
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // 验证必填字段
    ['title', 'username', 'password'].forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData] as string);
      if (error) {
        errors[field] = error;
      }
    });
    
    // 验证可选字段
    if (formData.url) {
      const urlError = validateField('url', formData.url);
      if (urlError) {
        errors.url = urlError;
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(e);
    }
  };

  // 处理平台选择
  const handlePlatformChange = (platformName: string) => {
    setSelectedPlatform(platformName);

    // 创建一个新的表单数据对象，更新平台字段
    const newFormData = {
      ...formData,
      platform: platformName
    };

    // 如果选择了平台，使用其模板数据自动填充表单
    if (platformName) {
      const template = platformTemplates.find(t => t.name === platformName);
      if (template) {
        // 合并模板数据
        newFormData.title = template.title;
        newFormData.url = template.url;
        newFormData.category = template.category;
      }
    }

    // 更新表单输入，使用handleInputChange确保实时验证
    Object.entries(newFormData).forEach(([key, value]) => {
      const event = {
        target: {
          name: key,
          value: value || ''
        }
      } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
      handleInputChange(event);
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title-section">
            <div className="modal-icon">
              {editingPassword ? '✏️' : '➕'}
            </div>
            <h2 className="modal-title">
              {editingPassword ? '编辑密码' : '添加新密码'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="close-button"
            aria-label="关闭模态框"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="password-form">
          {/* 平台选择器 - 单独一行 */}
          <div className="form-group">
            <label className="form-label">选择平台 (可选)</label>
            <PlatformSelect
              value={selectedPlatform}
              onChange={handlePlatformChange}
              placeholder="-- 选择常用平台 --"
            />
          </div>
          
          <div className="form-content">
            <div className="form-column">
              <div className="form-section">
                
                <div className="form-group">
              <label className="form-label">标题</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="例如：Gmail账户"
                  required
                  className={`form-input ${validationErrors.title ? 'input-error' : ''}`}
                />
              </div>
              {validationErrors.title && (
                <div className="error-message">{validationErrors.title}</div>
              )}
            </div>

                
                <div className="form-group">
                  <label className="form-label">分类</label>
                  <div className="input-wrapper">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-column">
              <div className="form-section">
                {/* 账户和密码在同一行 */}
                <div className="form-row">
                  {/* 账户字段 */}
                  <div className="form-group account-field">
                    <label className="form-label">账户</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder={
                          selectedPlatform ? 
                          platformTemplates.find(t => t.name === selectedPlatform)?.usernamePlaceholder || '输入用户名或邮箱' : 
                          '输入用户名或邮箱'
                        }
                        required
                        className={`form-input ${validationErrors.username ? 'input-error' : ''}`}
                      />
                    </div>
                    {validationErrors.username && (
                      <div className="error-message">{validationErrors.username}</div>
                    )}
                  </div>
                  
                  {/* 密码字段 */}
                  <div className="form-group password-input-group password-field">
                <label className="form-label">密码</label>
                <div className="input-wrapper with-button">
                  <input
                    type="text"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="输入密码"
                    required
                    className={`form-input password-field ${validationErrors.password ? 'input-error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={onGeneratePassword}
                    className="btn btn-secondary generate-btn"
                  >
                    🎲 生成
                  </button>
                </div>
                {/* 密码强度指示器 */}
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-meter-container">
                      <div 
                        className={`strength-meter ${getStrengthClass(passwordStrength.score)}`}
                        style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                      />
                    </div>
                    <div className={`strength-message ${getStrengthClass(passwordStrength.score)}`}>
                      {passwordStrength.message}
                    </div>
                  </div>
                )}
                {validationErrors.password && (
                <div className="error-message">{validationErrors.password}</div>
              )}
            </div>
          </div> {/* 关闭form-row */}
          
          <div className="form-group">
                <label className="form-label">网址 (可选)</label>
                <div className="input-wrapper">
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className={`form-input ${validationErrors.url ? 'input-error' : ''}`}
                  />
                </div>
                {validationErrors.url && (
                  <div className="error-message">{validationErrors.url}</div>
                )}
              </div>
              </div>
              
              <div className="form-section">
                <div className="form-group">
                  <label className="form-label">备注 (可选)</label>
                  <div className="input-wrapper textarea-wrapper">
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="添加备注信息"
                      rows={4}
                      className="form-input form-textarea"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary cancel-btn"
            >
              取消
            </button>
            <button 
              type="submit" 
              className="btn btn-primary submit-btn"
            >
              {editingPassword ? '✅ 更新' : '📥 添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordForm;

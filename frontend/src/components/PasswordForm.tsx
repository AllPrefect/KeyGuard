import React, { useState, useEffect } from 'react';
import { FormData, PasswordData } from '../types';
import { generateRandomPassword } from '../utils/encryption';
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

    // 更新表单输入
    Object.entries(newFormData).forEach(([key, value]) => {
      const event = {
        target: {
          name: key,
          value: value || ''
        }
      } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;
      onInputChange(event);
    });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{editingPassword ? '编辑密码' : '添加新密码'}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>选择平台 (可选):</label>
            <PlatformSelect
              value={selectedPlatform}
              onChange={handlePlatformChange}
              placeholder="-- 选择常用平台 --"
            />
          </div>
          
          <div className="form-group">
            <label>标题:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onInputChange}
              placeholder="例如：Gmail账户"
              required
            />
          </div>
          
          <div className="form-group">
            <label>账户:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={onInputChange}
              placeholder={
                selectedPlatform ? 
                platformTemplates.find(t => t.name === selectedPlatform)?.usernamePlaceholder || '输入用户名或邮箱' : 
                '输入用户名或邮箱'
              }
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
                onChange={onInputChange}
                placeholder="输入密码"
                required
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={onGeneratePassword}
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
              onChange={onInputChange}
              placeholder="https://example.com"
            />
          </div>
          
          <div className="form-group">
            <label>分类:</label>
            <select
              name="category"
              value={formData.category}
              onChange={onInputChange}
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
              onChange={onInputChange}
              placeholder="添加备注信息"
              rows={3}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-danger">
              取消
            </button>
            <button type="submit" className="btn btn-primary">
              {editingPassword ? '更新' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordForm;

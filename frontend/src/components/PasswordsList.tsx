import React from 'react';
import { PasswordData } from '../types';
import PasswordItem from './PasswordItem';

interface PasswordsListProps {
  passwords: PasswordData[];
  searchTerm: string;
  onCopyPassword: (password: string) => void;
  onEdit: (password: PasswordData) => void;
  onDelete: (id: string) => void;
}

const PasswordsList: React.FC<PasswordsListProps> = ({ 
  passwords, 
  searchTerm, 
  onCopyPassword, 
  onEdit, 
  onDelete 
}) => {
  // 过滤密码
  const filteredPasswords = passwords.filter(password =>
    password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    password.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 按分类分组
  const passwordsByCategory = filteredPasswords.reduce((acc: Record<string, PasswordData[]>, password: PasswordData) => {
    if (!acc[password.category]) {
      acc[password.category] = [];
    }
    acc[password.category].push(password);
    return acc;
  }, {});

  return (
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
              <PasswordItem
                key={password.id}
                password={password}
                onCopyPassword={onCopyPassword}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default PasswordsList;

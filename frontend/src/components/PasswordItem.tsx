import React from 'react';
import { PasswordData } from '../types';

interface PasswordItemProps {
  password: PasswordData;
  onCopyPassword: (password: string) => void;
  onEdit: (password: PasswordData) => void;
  onDelete: (id: string) => void;
}

const PasswordItem: React.FC<PasswordItemProps> = ({ password, onCopyPassword, onEdit, onDelete }) => {
  return (
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
          onClick={() => onCopyPassword(password.password)}
          className="btn btn-primary"
        >
          复制密码
        </button>
        <button
          onClick={() => onEdit(password)}
          className="btn btn-primary"
        >
          编辑
        </button>
        <button
          onClick={() => onDelete(password.id)}
          className="btn btn-danger"
        >
          删除
        </button>
      </div>
    </div>
  );
};

export default PasswordItem;

import React from 'react';

interface LoginFormProps {
  masterPassword: string;
  onMasterPasswordChange: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ masterPassword, onMasterPasswordChange, onSubmit }) => {
  return (
    <div className="auth-container">
      <div className="card">
        <h2>请输入主密码</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>主密码:</label>
            <input
              type="password"
              value={masterPassword}
              onChange={(e) => onMasterPasswordChange(e.target.value)}
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
  );
};

export default LoginForm;

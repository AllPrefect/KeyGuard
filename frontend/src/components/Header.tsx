import React from 'react';

interface HeaderProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, onLogout }) => {
  return (
    <div className="header">
      <h1>🔐 密码管理器</h1>
      <p>安全存储您的账号密码</p>
      {isAuthenticated && (
        <button onClick={onLogout} className="btn btn-danger" style={{ marginTop: '15px' }}>
          退出登录
        </button>
      )}
    </div>
  );
};

export default Header;

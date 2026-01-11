import React from 'react';

interface ToolbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddPassword: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ searchTerm, onSearchChange, onAddPassword }) => {
  return (
    <div className="toolbar">
      <div className="search-box">
        <div className="search-icon">🔍</div>
        <input
          type="text"
          placeholder="搜索密码..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button
            className="clear-search-btn"
            onClick={() => onSearchChange('')}
            aria-label="清除搜索"
          >
            ✕
          </button>
        )}
      </div>
      <button
        onClick={onAddPassword}
        className="btn btn-primary add-password-btn"
      >
        ➕ 添加新密码
      </button>
    </div>
  );
};

export default Toolbar;

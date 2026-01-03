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
        <input
          type="text"
          placeholder="搜索密码..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <button
        onClick={onAddPassword}
        className="btn btn-primary"
      >
        ➕ 添加新密码
      </button>
    </div>
  );
};

export default Toolbar;

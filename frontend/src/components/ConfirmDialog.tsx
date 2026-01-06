import React from 'react';

interface ConfirmDialogProps {
  message: string;
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
  message, 
  isVisible, 
  onConfirm, 
  onCancel, 
  title = '确认操作' 
}) => {
  if (!isVisible) return null;
  
  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog">
        <div className="confirm-header">
          <h3>{title}</h3>
          <button className="confirm-close-btn" onClick={onCancel}>
            ×
          </button>
        </div>
        <div className="confirm-body">
          <p>{message}</p>
        </div>
        <div className="confirm-footer">
          <button className="confirm-btn cancel" onClick={onCancel}>
            取消
          </button>
          <button className="confirm-btn confirm" onClick={onConfirm}>
            确认
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
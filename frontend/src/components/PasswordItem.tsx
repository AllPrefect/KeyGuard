import React from 'react';
import { PasswordData } from '../types';
import { platformTemplates } from '../utils/platformTemplates';
import { 
  FaGoogle, 
  FaGithub, 
  FaWeixin, 
  FaAlipay, 
  FaMusic, 
  FaShoppingCart, 
  FaCreditCard, 
  FaQq, 
  FaComment, 
  FaSearch, 
  FaYoutube, 
  FaFilm,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaMicrosoft,
  FaSlack,
  FaTrello,
  FaDatabase,
  FaPaypal,
  FaSpotify,
  FaVideo,
  FaSteam,
  FaAmazon,
  FaApple,
  FaGooglePlay,
  FaBook
} from 'react-icons/fa';

interface PasswordItemProps {
  password: PasswordData;
  onCopyPassword: (password: string) => void;
  onEdit: (password: PasswordData) => void;
  onDelete: (id: string) => void;
}

// 映射图标名称到 React 图标组件
const getIconComponent = (iconName: string, color: string) => {
  const iconProps = { style: { color, fontSize: '18px' } };
  switch (iconName) {
    case 'FaGoogle': return <FaGoogle {...iconProps} />;
    case 'FaGithub': return <FaGithub {...iconProps} />;
    case 'FaWeixin': return <FaWeixin {...iconProps} />;
    case 'FaAlipay': return <FaAlipay {...iconProps} />;
    case 'FaMusic': return <FaMusic {...iconProps} />;
    case 'FaShoppingCart': return <FaShoppingCart {...iconProps} />;
    case 'FaCreditCard': return <FaCreditCard {...iconProps} />;
    case 'FaQq': return <FaQq {...iconProps} />;
    case 'FaComment': return <FaComment {...iconProps} />;
    case 'FaSearch': return <FaSearch {...iconProps} />;
    case 'FaYoutube': return <FaYoutube {...iconProps} />;
    case 'FaFilm': return <FaFilm {...iconProps} />;
    case 'FaFacebook': return <FaFacebook {...iconProps} />;
    case 'FaInstagram': return <FaInstagram {...iconProps} />;
    case 'FaTwitter': return <FaTwitter {...iconProps} />;
    case 'FaLinkedin': return <FaLinkedin {...iconProps} />;
    case 'FaMicrosoft': return <FaMicrosoft {...iconProps} />;
    case 'FaSlack': return <FaSlack {...iconProps} />;
    case 'FaTrello': return <FaTrello {...iconProps} />;
    case 'FaDatabase': return <FaDatabase {...iconProps} />;
    case 'FaPaypal': return <FaPaypal {...iconProps} />;
    case 'FaSpotify': return <FaSpotify {...iconProps} />;
    case 'FaVideo': return <FaVideo {...iconProps} />;
    case 'FaSteam': return <FaSteam {...iconProps} />;
    case 'FaAmazon': return <FaAmazon {...iconProps} />;
    case 'FaApple': return <FaApple {...iconProps} />;
    case 'FaGooglePlay': return <FaGooglePlay {...iconProps} />;
    case 'FaBook': return <FaBook {...iconProps} />;
    default: return null;
  }
};

const PasswordItem: React.FC<PasswordItemProps> = ({ password, onCopyPassword, onEdit, onDelete }) => {
  // 获取密码关联的平台模板
  const platformName = password.platform;
  const passwordPlatform = platformName ? platformTemplates.find(template => template.name === platformName) : null;

  return (
    <div key={password.id} className="password-item">
      <div className="password-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3>{password.title}</h3>
          {passwordPlatform && (
            <span>
              {getIconComponent(passwordPlatform.icon, '#1890ff')}
            </span>
          )}
        </div>
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
          onClick={(e) => {
            e.stopPropagation();
            onDelete(password.id);
          }}
          className="btn btn-danger"
        >
          删除
        </button>
      </div>
    </div>
  );
};

export default PasswordItem;

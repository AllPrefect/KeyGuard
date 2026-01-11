import React, { useState, useRef, useEffect } from 'react';
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
  FaBook,
  FaCheckCircle
} from 'react-icons/fa';

interface PlatformSelectProps {
  value: string;
  onChange: (platformName: string) => void;
  placeholder?: string;
}

const PlatformSelect: React.FC<PlatformSelectProps> = ({ 
  value, 
  onChange, 
  placeholder = '-- 选择常用平台 --'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get selected platform
  const selectedPlatform = platformTemplates.find(p => p.name === value);
  
  // Search state
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // Remove selected platform
  const removePlatform = () => {
    onChange('');
  };

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
      case 'FaCheckCircle': return <FaCheckCircle {...iconProps} />;
      default: return null;
    }
  };
  
  // Filter platforms based on search keyword
  const filteredPlatforms = platformTemplates.filter(platform => {
    const keyword = searchKeyword.toLowerCase();
    return (
      platform.name.toLowerCase().includes(keyword) ||
      platform.url.toLowerCase().includes(keyword) ||
      platform.title.toLowerCase().includes(keyword)
    );
  });
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle platform selection (single)
  const handlePlatformSelect = (platformName: string) => {
    onChange(platformName);
  };
  
  return (
    <div 
      ref={dropdownRef}
      className="custom-select"
      style={{
        position: 'relative',
        marginBottom: '10px',
        width: '100%'
      }}
    >
      {/* Selected value */}
      <div 
        className="custom-select__selected"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '12px 16px',
          border: '2px solid var(--border-color)',
          borderRadius: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          backgroundColor: 'var(--bg-primary)',
          color: value ? 'var(--text-primary)' : 'var(--text-tertiary)',
          fontSize: '14px',
          transition: 'all 0.3s ease'
        }}
      >
        {value ? (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flex: 1
            }}
          >
            <div 
              className="platform-icon"
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                backgroundColor: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px'
              }}
            >
              {getIconComponent(selectedPlatform!.icon, selectedPlatform!.iconColor)}
            </div>
            <span>{selectedPlatform!.name}</span>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removePlatform();
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-tertiary)',
                fontSize: '14px',
                padding: '0',
                marginLeft: 'auto'
              }}
            >
              ×
            </button>
          </div>
        ) : (
          <span>{placeholder}</span>
        )}
      </div>
      
      {/* Dropdown options */}
      {isOpen && (
        <div 
          className="custom-select__options"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            backgroundColor: 'var(--bg-primary)',
            border: '2px solid var(--border-color)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-xl)',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-color)' }}>
            <input
              type="text"
              placeholder="搜索平台..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
              autoFocus
            />
          </div>
          {filteredPlatforms.length > 0 ? filteredPlatforms.map(platform => (
            <div 
              key={platform.name}
              className={`custom-select__option ${platform.name === value ? 'selected' : ''}`}
              onClick={() => handlePlatformSelect(platform.name)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease',
                backgroundColor: platform.name === value ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                color: 'var(--text-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              }}
              onMouseLeave={(e) => {
                if (platform.name !== value) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                }
              }}
            >
              <div 
                className="platform-icon"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0
                }}
              >
              {getIconComponent(platform.icon, platform.iconColor)}
            </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500' }}>{platform.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{platform.url}</div>
              </div>
              {platform.name === value && (
                <div style={{ color: 'var(--primary-color)', fontSize: '16px' }}>
                  <FaCheckCircle />
                </div>
              )}
            </div>
          )) : (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '14px' }}>
              没有找到匹配的平台
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlatformSelect;
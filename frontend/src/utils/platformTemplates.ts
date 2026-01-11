// 常用平台模板配置

// 平台模板接口
export interface PlatformTemplate {
  name: string;
  title: string;
  url: string;
  category: string;
  usernamePlaceholder: string;
  icon: string; // 使用图标名称
  iconColor: string; // 图标颜色
}

export const platformTemplates: PlatformTemplate[] = [
  // 社交平台
  {
    name: 'Gmail',
    title: 'Gmail账户',
    url: 'https://mail.google.com',
    category: '社交',
    usernamePlaceholder: 'your.email@gmail.com',
    icon: 'FaGoogle',
    iconColor: '#4285F4'
  },
  {
    name: '微信',
    title: '微信账户',
    url: 'https://weixin.qq.com',
    category: '社交',
    usernamePlaceholder: '你的微信号或手机号',
    icon: 'FaWeixin',
    iconColor: '#07C160'
  },
  {
    name: 'QQ',
    title: 'QQ账户',
    url: 'https://im.qq.com',
    category: '社交',
    usernamePlaceholder: '你的QQ号或邮箱',
    icon: 'FaQq',
    iconColor: '#12B7F5'
  },
  {
    name: '微博',
    title: '微博账户',
    url: 'https://weibo.com',
    category: '社交',
    usernamePlaceholder: '你的微博账号',
    icon: 'FaComment',
    iconColor: '#E6162D'
  },
  {
    name: 'Facebook',
    title: 'Facebook账户',
    url: 'https://www.facebook.com',
    category: '社交',
    usernamePlaceholder: '你的邮箱或手机号',
    icon: 'FaFacebook',
    iconColor: '#4267B2'
  },
  {
    name: 'Instagram',
    title: 'Instagram账户',
    url: 'https://www.instagram.com',
    category: '社交',
    usernamePlaceholder: '你的用户名',
    icon: 'FaInstagram',
    iconColor: '#E4405F'
  },
  {
    name: 'Twitter',
    title: 'Twitter/X账户',
    url: 'https://twitter.com',
    category: '社交',
    usernamePlaceholder: '你的用户名或邮箱',
    icon: 'FaTwitter',
    iconColor: '#1DA1F2'
  },
  {
    name: 'LinkedIn',
    title: 'LinkedIn账户',
    url: 'https://www.linkedin.com',
    category: '社交',
    usernamePlaceholder: '你的邮箱或手机号',
    icon: 'FaLinkedin',
    iconColor: '#0077B5'
  },

  // 工作平台
  {
    name: 'GitHub',
    title: 'GitHub账户',
    url: 'https://github.com',
    category: '工作',
    usernamePlaceholder: 'your-github-username',
    icon: 'FaGithub',
    iconColor: '#181717'
  },
  {
    name: '百度',
    title: '百度账户',
    url: 'https://www.baidu.com',
    category: '工作',
    usernamePlaceholder: '你的手机号或百度账号',
    icon: 'FaSearch',
    iconColor: '#3083F8'
  },
  {
    name: 'Microsoft',
    title: 'Microsoft账户',
    url: 'https://account.microsoft.com',
    category: '工作',
    usernamePlaceholder: '你的邮箱或手机号',
    icon: 'FaMicrosoft',
    iconColor: '#00A4EF'
  },
  {
    name: 'Slack',
    title: 'Slack工作空间',
    url: 'https://slack.com',
    category: '工作',
    usernamePlaceholder: '你的工作邮箱',
    icon: 'FaSlack',
    iconColor: '#4A154B'
  },
  {
    name: 'Trello',
    title: 'Trello账户',
    url: 'https://trello.com',
    category: '工作',
    usernamePlaceholder: '你的邮箱',
    icon: 'FaTrello',
    iconColor: '#0052CC'
  },
  {
    name: 'Notion',
    title: 'Notion账户',
    url: 'https://www.notion.so',
    category: '工作',
    usernamePlaceholder: '你的邮箱',
    icon: 'FaDatabase',
    iconColor: '#000000'
  },

  // 金融平台
  {
    name: '支付宝',
    title: '支付宝账户',
    url: 'https://www.alipay.com',
    category: '金融',
    usernamePlaceholder: '你的手机号或邮箱',
    icon: 'FaAlipay',
    iconColor: '#1677FF'
  },
  {
    name: 'PayPal',
    title: 'PayPal账户',
    url: 'https://www.paypal.com',
    category: '金融',
    usernamePlaceholder: '你的邮箱',
    icon: 'FaPaypal',
    iconColor: '#003087'
  },
  {
    name: '微信支付',
    title: '微信支付账户',
    url: 'https://pay.weixin.qq.com',
    category: '金融',
    usernamePlaceholder: '你的微信号',
    icon: 'FaWeixin',
    iconColor: '#07C160'
  },
  {
    name: '中国工商银行',
    title: '工商银行账户',
    url: 'https://www.icbc.com.cn',
    category: '金融',
    usernamePlaceholder: '你的银行卡号或手机号',
    icon: 'FaCreditCard',
    iconColor: '#D32F2F'
  },
  {
    name: '中国建设银行',
    title: '建设银行账户',
    url: 'https://www.ccb.com',
    category: '金融',
    usernamePlaceholder: '你的银行卡号或手机号',
    icon: 'FaCreditCard',
    iconColor: '#0277BD'
  },

  // 娱乐平台
  {
    name: '抖音',
    title: '抖音账户',
    url: 'https://www.douyin.com',
    category: '娱乐',
    usernamePlaceholder: '你的手机号或抖音号',
    icon: 'FaMusic',
    iconColor: '#FF0050'
  },
  {
    name: '腾讯视频',
    title: '腾讯视频会员',
    url: 'https://v.qq.com',
    category: '娱乐',
    usernamePlaceholder: '你的手机号或腾讯视频账号',
    icon: 'FaYoutube',
    iconColor: '#00A4DE'
  },
  {
    name: '爱奇艺',
    title: '爱奇艺会员',
    url: 'https://www.iqiyi.com',
    category: '娱乐',
    usernamePlaceholder: '你的手机号或爱奇艺账号',
    icon: 'FaFilm',
    iconColor: '#19CA72'
  },
  {
    name: 'Netflix',
    title: 'Netflix账户',
    url: 'https://www.netflix.com',
    category: '娱乐',
    usernamePlaceholder: '你的邮箱',
    icon: 'FaNetflix',
    iconColor: '#E50914'
  },
  {
    name: 'Spotify',
    title: 'Spotify账户',
    url: 'https://www.spotify.com',
    category: '娱乐',
    usernamePlaceholder: '你的邮箱或手机号',
    icon: 'FaSpotify',
    iconColor: '#1DB954'
  },
  {
    name: 'Bilibili',
    title: 'B站账户',
    url: 'https://www.bilibili.com',
    category: '娱乐',
    usernamePlaceholder: '你的手机号或B站账号',
    icon: 'FaVideo',
    iconColor: '#00A1D6'
  },
  {
    name: 'Steam',
    title: 'Steam游戏平台',
    url: 'https://store.steampowered.com',
    category: '娱乐',
    usernamePlaceholder: '你的Steam账号',
    icon: 'FaSteam',
    iconColor: '#171A21'
  },

  // 购物平台
  {
    name: '淘宝',
    title: '淘宝账户',
    url: 'https://www.taobao.com',
    category: '购物',
    usernamePlaceholder: '你的手机号或淘宝账号',
    icon: 'FaShoppingCart',
    iconColor: '#FF4400'
  },
  {
    name: '京东',
    title: '京东账户',
    url: 'https://www.jd.com',
    category: '购物',
    usernamePlaceholder: '你的手机号或京东账号',
    icon: 'FaCreditCard',
    iconColor: '#E1251B'
  },
  {
    name: '拼多多',
    title: '拼多多账户',
    url: 'https://www.pinduoduo.com',
    category: '购物',
    usernamePlaceholder: '你的手机号',
    icon: 'FaShoppingCart',
    iconColor: '#E74C3C'
  },
  {
    name: 'Amazon',
    title: 'Amazon账户',
    url: 'https://www.amazon.com',
    category: '购物',
    usernamePlaceholder: '你的邮箱',
    icon: 'FaAmazon',
    iconColor: '#FF9900'
  },
  {
    name: '天猫',
    title: '天猫账户',
    url: 'https://www.tmall.com',
    category: '购物',
    usernamePlaceholder: '你的手机号或淘宝账号',
    icon: 'FaShoppingCart',
    iconColor: '#FF4040'
  },

  // 其他平台
  {
    name: 'AppleID',
    title: 'Apple ID',
    url: 'https://appleid.apple.com',
    category: '其他',
    usernamePlaceholder: '你的Apple ID邮箱',
    icon: 'FaApple',
    iconColor: '#000000'
  },
  {
    name: 'GooglePlay',
    title: 'Google Play账户',
    url: 'https://play.google.com',
    category: '其他',
    usernamePlaceholder: '你的Google邮箱',
    icon: 'FaGooglePlay',
    iconColor: '#34A853'
  },
  {
    name: '抖音极速版',
    title: '抖音极速版账户',
    url: 'https://www.douyin.com',
    category: '其他',
    usernamePlaceholder: '你的手机号',
    icon: 'FaMusic',
    iconColor: '#FF0050'
  },
  {
    name: '小红书',
    title: '小红书账户',
    url: 'https://www.xiaohongshu.com',
    category: '其他',
    usernamePlaceholder: '你的手机号或邮箱',
    icon: 'FaBook',
    iconColor: '#FF2442'
  }
];

export const getPlatformTemplate = (name: string): PlatformTemplate | undefined => {
  return platformTemplates.find(template => template.name === name);
};

export const getPlatformNames = (): string[] => {
  return platformTemplates.map(template => template.name);
};

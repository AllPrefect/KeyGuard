import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App'
import './index.css'

console.log('main.tsx加载成功');
console.log('document.getElementById("root"):', document.getElementById('root'));

const root = document.getElementById('root')
if (root) {
  console.log('开始渲染React应用');
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log('React应用渲染完成');
} else {
  console.error('无法找到root元素');
}
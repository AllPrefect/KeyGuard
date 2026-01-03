import React from 'react';
import '../App.css';
import HomePage from '../pages/HomePage';
import { PasswordProvider } from '../contexts/PasswordContext';

const App: React.FC = () => {
  return (
    <PasswordProvider>
      <div className="app">
        <HomePage />
      </div>
    </PasswordProvider>
  );
};

export default App;
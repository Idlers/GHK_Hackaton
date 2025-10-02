import React, { useState, useEffect } from 'react';
import AuthModal from './components/AuthModal.jsx';
import './App.css';

const checkBackendConnection = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // Уменьшил таймаут
    
    const response = await fetch('http://localhost:8000/', {
      method: 'GET',
      mode: 'no-cors', // Используем no-cors для обхода CORS
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log('✅ Бэкенд доступен');
    return true;
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Проверка связи прервана по таймауту');
    } else {
      console.log('Бэкенд недоступен:', error.message);
    }
    return false;
  }
};

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [connectionError, setConnectionError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const isConnected = await checkBackendConnection();
        setBackendStatus(isConnected ? 'online' : 'offline');
        if (!isConnected) {
          setConnectionError('Сервер временно недоступен. Некоторые функции могут быть ограничены.');
        }
      } catch (error) {
        setBackendStatus('offline');
        setConnectionError('Сервер временно недоступен. Некоторые функции могут быть ограничены.');
      }
    };

    // Запускаем проверку, но не блокируем интерфейс
    init();
  }, []);

  const handleLoginClick = () => {
    if (backendStatus === 'offline') {
      alert('Сервер временно недоступен. Попробуйте позже или проверьте подключение к бэкенду.');
      return;
    }
    setIsLogin(true);
    setShowAuthModal(true);
  };

  const handleRegisterClick = () => {
    if (backendStatus === 'offline') {
      alert('Сервер временно недоступен. Попробуйте позже или проверьте подключение к бэкенду.');
      return;
    }
    setIsLogin(false);
    setShowAuthModal(true);
  };

  const handleCloseModal = () => {
    setShowAuthModal(false);
  };

  const handleRetryConnection = async () => {
    setBackendStatus('checking');
    setConnectionError('');
    
    try {
      const isConnected = await checkBackendConnection();
      setBackendStatus(isConnected ? 'online' : 'offline');
      if (!isConnected) {
        setConnectionError('Сервер временно недоступен. Некоторые функции могут быть ограничены.');
      }
    } catch (error) {
      setBackendStatus('offline');
      setConnectionError('Сервер временно недоступен. Некоторые функции могут быть ограничены.');
    }
  };

  return (
    <div className="app">
      <div className="main-container">
        {/* Статус подключения - всегда видимый, но не блокирующий */}
        <div className={`connection-status ${backendStatus}`}>
          <span className="status-indicator"></span>
          Статус сервера: 
          {backendStatus === 'checking' && ' 🔄 Проверка...'}
          {backendStatus === 'online' && ' ✅ Онлайн'}
          {backendStatus === 'offline' && ' ⚠️ Офлайн'}
          
          {backendStatus === 'offline' && (
            <button onClick={handleRetryConnection} className="retry-btn">
              Повторить
            </button>
          )}
        </div>

        {connectionError && (
          <div className="connection-warning">
            ⚠️ {connectionError}
          </div>
        )}

        <h1 className="main-title">СПРОГНОЗИРОВАТЬ РИСКИ</h1>
        
        <div className="button-container">
          {/* Кнопки всегда активны, но показывают разное поведение */}
          <button 
            className={`login-btn ${backendStatus === 'checking' ? 'checking' : ''}`}
            onClick={handleLoginClick}
          >
            {backendStatus === 'checking' ? 'Проверка связи...' : 'ВОЙТИ'}
          </button>
          <button 
            className={`register-btn ${backendStatus === 'checking' ? 'checking' : ''}`}
            onClick={handleRegisterClick}
          >
            РЕГИСТРАЦИЯ
          </button>
        </div>

        {/* Дополнительная информация для разработчика */}
        {backendStatus === 'offline' && (
          <div className="dev-hint">
            <p><strong>Для разработчиков:</strong></p>
            <p>Убедитесь, что Django бэкенд запущен:</p>
            <code>python manage.py runserver 8000</code>
            <p className="hint-note">
              Примечание: Интерфейс работает в автономном режиме. 
              Аутентификация будет доступна после подключения бэкенда.
            </p>
          </div>
        )}

        {/* Демо-контент или инструкции когда бэкенд недоступен */}
        {backendStatus === 'offline' && (
          <div className="demo-info">
            <h3>Демо-режим</h3>
            <p>В настоящее время приложение работает в демо-режиме.</p>
            <p>Для полного функционала необходимо подключение к серверу.</p>
          </div>
        )}
      </div>

      {/* Модальное окно показывается только если бэкенд онлайн */}
      {showAuthModal && backendStatus === 'online' && (
        <AuthModal 
          isLogin={isLogin} 
          onClose={handleCloseModal}
          onSwitchMode={() => setIsLogin(!isLogin)}
        />
      )}
    </div>
  );
}

export default App;
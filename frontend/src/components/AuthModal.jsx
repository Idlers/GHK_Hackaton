import React, { useState } from 'react';
import { setAccessToken, authAPI } from '../api/api.js';
import './AuthModal.css';

const AuthModal = ({ isLogin, onClose, onSwitchMode }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const data = await authAPI.login(formData.username, formData.password);
        setAccessToken(data.access);
        onClose();
        window.location.reload();
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError("Пароли не совпадают");
          setLoading(false);
          return;
        }

        await authAPI.register({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });

        const loginData = await authAPI.login(formData.username, formData.password);
        setAccessToken(loginData.access);
        onClose();
        window.location.reload();
      }
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        setError('Ошибка соединения с сервером. Проверьте, запущен ли бэкенд.');
      } else if (error.message.includes('HTTP error') || error.message.includes('Таймаут')) {
        setError(error.message);
      } else {
        setError(error.message || 'Произошла неизвестная ошибка');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2>{isLogin ? 'ВОЙТИ' : 'РЕГИСТРАЦИЯ'}</h2>
        
        {error && (
          <div className="error-message">
            {error}
            {error.includes('соединения') && (
              <div style={{ marginTop: '10px', fontSize: '0.9em' }}>
                Убедитесь, что бэкенд запущен на localhost:8000
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Имя пользователя"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          )}
          
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Подтвердите пароль"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          )}
          
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>
        
        <div className="switch-mode">
          <span>
            {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
            <button 
              type="button" 
              onClick={onSwitchMode} 
              className="switch-btn"
              disabled={loading}
            >
              {isLogin ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;







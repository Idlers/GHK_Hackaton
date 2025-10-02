let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
  // Безопасное сохранение в localStorage
  try {
    localStorage.setItem('accessToken', token);
  } catch (error) {
    console.warn('localStorage недоступен');
  }
}

export function getAccessToken() {
  if (!accessToken) {
    try {
      accessToken = localStorage.getItem('accessToken');
    } catch (error) {
      console.warn('localStorage недоступен');
    }
  }
  return accessToken;
}

export function logout() {
  accessToken = null;
  try {
    localStorage.removeItem('accessToken');
  } catch (error) {
    console.warn('localStorage недоступен');
  }
}

// Простые API функции с обработкой ошибок
export const authAPI = {
  async login(username, password) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch('http://localhost:8000/api/auth/token/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Ошибка: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Таймаут запроса. Сервер не отвечает.');
      }
      throw error;
    }
  },

  async register(userData) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Ошибка регистрации: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Таймаут запроса. Сервер не отвечает.');
      }
      throw error;
    }
  }
};
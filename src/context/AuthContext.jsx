import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_API}/verify`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (data.success) {
        setUser({
          email: data.username,
          name: data.username.split('@')[0],
          avatar: data.avatar || null,
        });
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_API}/login`,
        { email, password },
        { withCredentials: true }
      );

      if (data.success) {
        const newToken = data.token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser({
          email: data.user?.email || email,
          name: data.user?.name || email.split('@')[0],
          avatar: data.user?.avatar || null,
        });
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Something went wrong' };
    }
  };

  const signup = async (email, password) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_API}/signup`,
        { email, password },
        { withCredentials: true }
      );

      if (data.success) {
        const newToken = data.token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser({
          email: data.user?.email || email,
          name: data.user?.name || email.split('@')[0],
          avatar: data.user?.avatar || null,
        });
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Something went wrong' };
    }
  };

  const googleLogin = async (credential) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_API}/auth/google`,
        { credential },
        { withCredentials: true }
      );

      if (data.success) {
        const newToken = data.token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser({
          email: data.user.email,
          name: data.user.name,
          avatar: data.user.avatar,
        });
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Google login failed' };
      }
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, message: 'Something went wrong' };
    }
  };

  const phoneLogin = async (phoneNumber, otp) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_API}/auth/phone`,
        { phoneNumber, otp },
        { withCredentials: true }
      );

      if (data.success) {
        const newToken = data.token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser({
          email: data.user.email,
          name: data.user.name || phoneNumber,
          avatar: data.user.avatar,
          phone: phoneNumber,
        });
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Phone login failed' };
      }
    } catch (error) {
      console.error('Phone login error:', error);
      return { success: false, message: 'Something went wrong' };
    }
  };

  const sendOTP = async (phoneNumber) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_API}/auth/send-otp`,
        { phoneNumber }
      );
      return { success: data.success, message: data.message };
    } catch (error) {
      console.error('Send OTP error:', error);
      return { success: false, message: 'Failed to send OTP' };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_SERVER_API}/profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setUser(prev => ({ ...prev, ...data.user }));
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: 'Failed to update profile' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    googleLogin,
    phoneLogin,
    sendOTP,
    updateProfile,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
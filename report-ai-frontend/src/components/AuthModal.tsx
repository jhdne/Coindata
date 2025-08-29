import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus, Eye, EyeOff, Mail, User, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    identifier: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const { t } = useLanguage();

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      identifier: '',
      password: ''
    });
    setErrors({});
    setIsSubmitting(false);
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleModeSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
    resetForm();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (mode === 'register') {
      if (!formData.username.trim()) {
        newErrors.username = t('language') === '中文' ? '用户名不能为空' : 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = t('language') === '中文' ? '用户名至少需要3个字符' : 'Username must be at least 3 characters';
      }

      if (!formData.email.trim()) {
        newErrors.email = t('language') === '中文' ? '邮箱不能为空' : 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = t('language') === '中文' ? '请输入有效的邮箱地址' : 'Please enter a valid email address';
      }
    } else {
      if (!formData.identifier.trim()) {
        newErrors.identifier = t('language') === '中文' ? '用户名或邮箱不能为空' : 'Username or email is required';
      }
    }

    if (!formData.password) {
      newErrors.password = t('language') === '中文' ? '密码不能为空' : 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = t('language') === '中文' ? '密码至少需要6个字符' : 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      
      if (mode === 'login') {
        result = await login({
          identifier: formData.identifier,
          password: formData.password
        });
      } else {
        result = await register({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
      }

      if (result.success) {
        handleClose();
      } else {
        setErrors({ submit: result.error || (mode === 'login' ? t('loginFailed') : t('registerFailed')) });
      }
    } catch (error) {
      setErrors({ submit: mode === 'login' ? t('loginFailed') : t('registerFailed') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* 背景遮罩 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* 弹窗内容 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* 头部 */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  {mode === 'login' ? (
                    <LogIn className="w-5 h-5 text-white" />
                  ) : (
                    <UserPlus className="w-5 h-5 text-white" />
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {mode === 'login' ? t('login') : t('register')}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 表单内容 */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  {/* 用户名输入 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('username')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                          errors.username 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-200 focus:border-purple-500'
                        }`}
                        placeholder={t('language') === '中文' ? '请输入用户名' : 'Enter username'}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                    )}
                  </div>

                  {/* 邮箱输入 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('email')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                          errors.email 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-200 focus:border-purple-500'
                        }`}
                        placeholder={t('language') === '中文' ? '请输入邮箱地址' : 'Enter email address'}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </>
              )}

              {mode === 'login' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('language') === '中文' ? '用户名或邮箱' : 'Username or Email'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.identifier}
                      onChange={(e) => handleInputChange('identifier', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                        errors.identifier 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-purple-500'
                      }`}
                      placeholder={t('language') === '中文' ? '请输入用户名或邮箱' : 'Enter username or email'}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.identifier && (
                    <p className="mt-1 text-sm text-red-600">{errors.identifier}</p>
                  )}
                </div>
              )}

              {/* 密码输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                      errors.password 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-purple-500'
                    }`}
                    placeholder={t('language') === '中文' ? '请输入密码' : 'Enter password'}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* 提交错误 */}
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              {/* 提交按钮 */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {mode === 'login' ? (t('language') === '中文' ? '登录中...' : 'Logging in...') : (t('language') === '中文' ? '注册中...' : 'Registering...')}
                  </div>
                ) : (
                  mode === 'login' ? t('login') : t('register')
                )}
              </motion.button>
            </form>

            {/* 模式切换 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {mode === 'login' ? t('noAccount') : t('alreadyHaveAccount')}
                <button
                  onClick={() => handleModeSwitch(mode === 'login' ? 'register' : 'login')}
                  className="ml-1 text-purple-600 hover:text-purple-700 font-medium"
                  disabled={isSubmitting}
                >
                  {mode === 'login' ? t('clickToRegister') : t('clickToLogin')}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, LogOut, Heart, UserCheck, Globe, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import AuthModal from './AuthModal';
import FavoritesList from './FavoritesList';

const Header: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };
  return (
    <>
    <header className="w-full px-6 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo区域 */}
        <div className="flex items-center ml-6">
          <img
            src="/logo160.png"
            alt="Coin AI"
            className="h-10 w-auto"
          />
        </div>

        {/* 用户区域 */}
        {isAuthenticated && user ? (
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 hover:border-purple-300 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800">{user.username}</p>
                <p className="text-xs text-gray-500">{user.favoritesCount} {t('favorites')}</p>
              </div>
            </motion.button>

            {/* 用户菜单 */}
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200/50 py-2 z-50"
              >
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setIsFavoritesOpen(true);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  {t('myFavorites')}
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    // TODO: 打开个人设置
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  {t('settings')}
                </button>
                <hr className="my-2 border-gray-200" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {t('logout')}
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {/* 语言切换 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 hover:border-indigo-300 px-3 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Globe className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">
                {language === 'zh' ? '中文' : 'EN'}
              </span>
            </motion.button>

            {/* 登录按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-white font-medium flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              {t('login')}
            </motion.button>
          </div>
        )}
      </div>
    </header>

    {/* 认证弹窗 */}
    <AuthModal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
    />

    {/* 收藏列表弹窗 */}
    <FavoritesList
      isOpen={isFavoritesOpen}
      onClose={() => setIsFavoritesOpen(false)}
    />
  </>
  );
};

export default Header;

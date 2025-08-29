import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getFavorites } from '../services/auth';
import { Favorite } from '../types';

interface FavoritesListProps {
  isOpen: boolean;
  onClose: () => void;
}

const FavoritesList: React.FC<FavoritesListProps> = ({ isOpen, onClose }) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { user, isAuthenticated } = useAuth();

  const loadFavorites = async (pageNum = 1, reset = false) => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getFavorites(pageNum, 20);
      
      if (response.success && response.data) {
        const newFavorites = response.data.favorites;
        
        if (reset) {
          setFavorites(newFavorites);
        } else {
          setFavorites(prev => [...prev, ...newFavorites]);
        }
        
        setHasMore(response.data.pagination.page < response.data.pagination.pages);
        setPage(pageNum);
      } else {
        setError(response.error || '获取收藏列表失败');
      }
    } catch (error) {
      console.error('获取收藏列表错误:', error);
      setError('获取收藏列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    loadFavorites(1, true);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadFavorites(page + 1, false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadFavorites(1, true);
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* 背景遮罩 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* 弹窗内容 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-2xl max-h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* 头部 */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">我的收藏</h2>
                  <p className="text-sm text-gray-600">
                    {user?.favoritesCount || 0} 个收藏的代币
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto p-6">
            {!isAuthenticated ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">请先登录查看收藏列表</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <Trash2 className="w-16 h-16 mx-auto mb-2" />
                  <p>{error}</p>
                </div>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  重试
                </button>
              </div>
            ) : favorites.length === 0 && !isLoading ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-2">还没有收藏任何代币</p>
                <p className="text-sm text-gray-400">在搜索结果中点击星标图标来收藏代币</p>
              </div>
            ) : (
              <div className="space-y-4">
                {favorites.map((favorite, index) => (
                  <motion.div
                    key={favorite.tokenId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {favorite.tokenId.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">代币 #{favorite.tokenId}</p>
                          <p className="text-sm text-gray-500">
                            收藏于 {new Date(favorite.addedAt).toLocaleDateString('zh-CN')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            // TODO: 查看代币详情
                          }}
                          className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                        >
                          查看
                        </button>
                        <button
                          onClick={() => {
                            // TODO: 移除收藏
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* 加载更多按钮 */}
                {hasMore && (
                  <div className="text-center pt-4">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? '加载中...' : '加载更多'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 加载指示器 */}
            {isLoading && favorites.length === 0 && (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">加载收藏列表中...</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FavoritesList;

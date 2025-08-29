const express = require('express');
const User = require('../models/User');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');

const router = express.Router();

// 获取用户收藏列表
router.get('/', authenticate, async (req, res) => {
  try {
    const user = req.user;
    const { page = 1, limit = 20 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // 获取收藏的代币ID列表
    const favorites = user.favorites
      .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt)) // 按添加时间倒序
      .slice(skip, skip + limitNum);
    
    const total = user.favorites.length;
    
    res.json({
      success: true,
      data: {
        favorites: favorites.map(fav => ({
          tokenId: fav.tokenId,
          addedAt: fav.addedAt
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('获取收藏列表错误:', error);
    res.status(500).json({
      success: false,
      error: '获取收藏列表失败'
    });
  }
});

// 添加收藏
router.post('/:tokenId', authenticate, async (req, res) => {
  try {
    const { tokenId } = req.params;
    const user = req.user;
    
    if (!tokenId) {
      return res.status(400).json({
        success: false,
        error: '代币ID是必需的'
      });
    }
    
    const added = user.addFavorite(tokenId);
    
    if (!added) {
      return res.status(400).json({
        success: false,
        error: '该代币已在收藏列表中'
      });
    }
    
    await user.save();
    
    res.json({
      success: true,
      data: {
        isFavorited: true,
        favoritesCount: user.favorites.length
      },
      message: '添加收藏成功'
    });
  } catch (error) {
    console.error('添加收藏错误:', error);
    res.status(500).json({
      success: false,
      error: '添加收藏失败'
    });
  }
});

// 移除收藏
router.delete('/:tokenId', authenticate, async (req, res) => {
  try {
    const { tokenId } = req.params;
    const user = req.user;
    
    if (!tokenId) {
      return res.status(400).json({
        success: false,
        error: '代币ID是必需的'
      });
    }
    
    const removed = user.removeFavorite(tokenId);
    
    if (!removed) {
      return res.status(400).json({
        success: false,
        error: '该代币不在收藏列表中'
      });
    }
    
    await user.save();
    
    res.json({
      success: true,
      data: {
        isFavorited: false,
        favoritesCount: user.favorites.length
      },
      message: '移除收藏成功'
    });
  } catch (error) {
    console.error('移除收藏错误:', error);
    res.status(500).json({
      success: false,
      error: '移除收藏失败'
    });
  }
});

// 切换收藏状态
router.post('/toggle/:tokenId', authenticate, async (req, res) => {
  try {
    const { tokenId } = req.params;
    const user = req.user;
    
    if (!tokenId) {
      return res.status(400).json({
        success: false,
        error: '代币ID是必需的'
      });
    }
    
    const isFavorited = user.isFavorited(tokenId);
    let message;
    
    if (isFavorited) {
      user.removeFavorite(tokenId);
      message = '移除收藏成功';
    } else {
      user.addFavorite(tokenId);
      message = '添加收藏成功';
    }
    
    await user.save();
    
    res.json({
      success: true,
      data: {
        isFavorited: !isFavorited,
        favoritesCount: user.favorites.length
      },
      message
    });
  } catch (error) {
    console.error('切换收藏状态错误:', error);
    res.status(500).json({
      success: false,
      error: '切换收藏状态失败'
    });
  }
});

// 检查代币是否被收藏
router.get('/check/:tokenId', optionalAuthenticate, async (req, res) => {
  try {
    const { tokenId } = req.params;
    
    if (!tokenId) {
      return res.status(400).json({
        success: false,
        error: '代币ID是必需的'
      });
    }
    
    const isFavorited = req.user ? req.user.isFavorited(tokenId) : false;
    
    res.json({
      success: true,
      data: {
        isFavorited,
        isAuthenticated: !!req.user
      }
    });
  } catch (error) {
    console.error('检查收藏状态错误:', error);
    res.status(500).json({
      success: false,
      error: '检查收藏状态失败'
    });
  }
});

// 批量检查代币收藏状态
router.post('/check-batch', optionalAuthenticate, async (req, res) => {
  try {
    const { tokenIds } = req.body;
    
    if (!Array.isArray(tokenIds)) {
      return res.status(400).json({
        success: false,
        error: '代币ID列表必须是数组'
      });
    }
    
    const favoriteStatus = {};
    
    if (req.user) {
      tokenIds.forEach(tokenId => {
        favoriteStatus[tokenId] = req.user.isFavorited(tokenId);
      });
    } else {
      tokenIds.forEach(tokenId => {
        favoriteStatus[tokenId] = false;
      });
    }
    
    res.json({
      success: true,
      data: {
        favoriteStatus,
        isAuthenticated: !!req.user
      }
    });
  } catch (error) {
    console.error('批量检查收藏状态错误:', error);
    res.status(500).json({
      success: false,
      error: '批量检查收藏状态失败'
    });
  }
});

// 清空收藏列表
router.delete('/', authenticate, async (req, res) => {
  try {
    const user = req.user;
    const originalCount = user.favorites.length;
    
    user.favorites = [];
    await user.save();
    
    res.json({
      success: true,
      data: {
        removedCount: originalCount,
        favoritesCount: 0
      },
      message: '收藏列表已清空'
    });
  } catch (error) {
    console.error('清空收藏列表错误:', error);
    res.status(500).json({
      success: false,
      error: '清空收藏列表失败'
    });
  }
});

module.exports = router;

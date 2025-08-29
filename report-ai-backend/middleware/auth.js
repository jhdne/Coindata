const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 生成JWT令牌
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// 验证JWT令牌
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// 认证中间件
const authenticate = async (req, res, next) => {
  try {
    // 从请求头获取令牌
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: '未提供认证令牌'
      });
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀

    // 验证令牌
    const decoded = verifyToken(token);
    
    // 查找用户
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: '用户不存在或已被禁用'
      });
    }

    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: '无效的认证令牌'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: '认证令牌已过期'
      });
    } else {
      console.error('认证中间件错误:', error);
      return res.status(500).json({
        success: false,
        error: '认证过程中发生错误'
      });
    }
  }
};

// 可选认证中间件（用户可以是匿名的）
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // 没有令牌，继续处理但不设置用户
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    const user = await User.findById(decoded.userId);
    if (user && user.isActive) {
      user.lastLogin = new Date();
      await user.save();
      req.user = user;
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    // 认证失败时不返回错误，只是不设置用户
    req.user = null;
    next();
  }
};

// 管理员权限检查中间件
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: '需要管理员权限'
    });
  }
  next();
};

// 验证用户所有权中间件
const requireOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[resourceField] || req.body[resourceField];
    
    if (!req.user || req.user._id.toString() !== resourceUserId) {
      return res.status(403).json({
        success: false,
        error: '无权访问此资源'
      });
    }
    
    next();
  };
};

module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  optionalAuthenticate,
  requireAdmin,
  requireOwnership
};

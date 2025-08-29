const express = require('express');
const User = require('../models/User');
const { generateToken, authenticate } = require('../middleware/auth');

const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 验证必需字段
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: '用户名、邮箱和密码都是必需的'
      });
    }

    // 检查用户是否已存在
    const existingUser = await User.findByEmailOrUsername(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: '用户名或邮箱已被使用'
      });
    }

    // 创建新用户
    const user = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    await user.save();

    // 生成JWT令牌
    const token = generateToken(user._id);

    // 返回用户信息和令牌
    res.status(201).json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        token
      },
      message: '注册成功'
    });
  } catch (error) {
    console.error('注册错误:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: '用户名或邮箱已被使用'
      });
    }

    res.status(500).json({
      success: false,
      error: '注册过程中发生错误'
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // 验证必需字段
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: '请提供用户名/邮箱和密码'
      });
    }

    // 查找用户
    const user = await User.findByEmailOrUsername(identifier);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '用户名/邮箱或密码错误'
      });
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: '用户名/邮箱或密码错误'
      });
    }

    // 检查用户是否被禁用
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: '账户已被禁用，请联系管理员'
      });
    }

    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();

    // 生成JWT令牌
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        token
      },
      message: '登录成功'
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      error: '登录过程中发生错误'
    });
  }
});

// 获取当前用户信息
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      error: '获取用户信息失败'
    });
  }
});

// 更新用户信息
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { username, email, avatar, preferences } = req.body;
    const user = req.user;

    // 更新允许的字段
    if (username && username.trim() !== user.username) {
      // 检查用户名是否已被使用
      const existingUser = await User.findOne({ 
        username: username.trim(),
        _id: { $ne: user._id }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: '用户名已被使用'
        });
      }
      
      user.username = username.trim();
    }

    if (email && email.toLowerCase().trim() !== user.email) {
      // 检查邮箱是否已被使用
      const existingUser = await User.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: user._id }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: '邮箱已被使用'
        });
      }
      
      user.email = email.toLowerCase().trim();
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile()
      },
      message: '个人信息更新成功'
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: '更新用户信息失败'
    });
  }
});

// 修改密码
router.put('/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: '请提供当前密码和新密码'
      });
    }

    // 获取包含密码的用户信息
    const user = await User.findById(req.user._id).select('+password');
    
    // 验证当前密码
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: '当前密码错误'
      });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('修改密码错误:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: '修改密码失败'
    });
  }
});

// 注销（客户端处理，服务端只返回成功消息）
router.post('/logout', authenticate, (req, res) => {
  res.json({
    success: true,
    message: '注销成功'
  });
});

module.exports = router;

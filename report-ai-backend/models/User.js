const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用户名是必需的'],
    unique: true,
    trim: true,
    minlength: [3, '用户名至少需要3个字符'],
    maxlength: [30, '用户名不能超过30个字符']
  },
  email: {
    type: String,
    required: [true, '邮箱是必需的'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, '请输入有效的邮箱地址']
  },
  password: {
    type: String,
    required: [true, '密码是必需的'],
    minlength: [6, '密码至少需要6个字符'],
    select: false // 默认不返回密码字段
  },
  avatar: {
    type: String,
    default: null
  },
  favorites: [{
    tokenId: {
      type: String,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      enum: ['zh', 'en'],
      default: 'zh'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      browser: {
        type: Boolean,
        default: true
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时间戳
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
  // 只有密码被修改时才加密
  if (!this.isModified('password')) return next();
  
  try {
    // 生成盐值并加密密码
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 实例方法：验证密码
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('密码验证失败');
  }
};

// 实例方法：添加收藏
userSchema.methods.addFavorite = function(tokenId) {
  // 检查是否已经收藏
  const existingFavorite = this.favorites.find(fav => fav.tokenId === tokenId);
  if (existingFavorite) {
    return false; // 已经收藏
  }
  
  this.favorites.push({ tokenId });
  return true; // 添加成功
};

// 实例方法：移除收藏
userSchema.methods.removeFavorite = function(tokenId) {
  const initialLength = this.favorites.length;
  this.favorites = this.favorites.filter(fav => fav.tokenId !== tokenId);
  return this.favorites.length < initialLength; // 返回是否成功移除
};

// 实例方法：检查是否收藏
userSchema.methods.isFavorited = function(tokenId) {
  return this.favorites.some(fav => fav.tokenId === tokenId);
};

// 实例方法：获取用户公开信息
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    avatar: this.avatar,
    preferences: this.preferences,
    favoritesCount: this.favorites.length,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin
  };
};

// 静态方法：根据邮箱或用户名查找用户
userSchema.statics.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  }).select('+password');
};

// 索引
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'favorites.tokenId': 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;

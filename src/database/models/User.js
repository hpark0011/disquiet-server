import { generateToken } from '../../lib/auth/token';
import db from './index';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    display_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    account_provider: DataTypes.STRING, // ENUM doesn't work...
    profile_image_url: DataTypes.STRING,
    role: DataTypes.STRING,
    employer: DataTypes.STRING,
    is_receiving_newsletter: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_policy_agreed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
  }, {
    underscored: true,
  });

  User.associate = (db) => {
    User.hasMany(db.AuthToken, { 
      foreignKey: { allowNull: false }, 
      onDelete: 'CASCADE'
    });
    User.hasMany(db.ProductUpvote, {
      foreignKey: { allowNull: false }, 
      onDelete: 'CASCADE'
    });
    User.hasMany(db.Comment, {
      foreignKey: { allowNull: false }, 
      onDelete: 'CASCADE'
    });
    User.hasMany(db.CommentLike, {
      foreignKey: { allowNull: false }, 
      onDelete: 'CASCADE'
    });
  }

  User.prototype.generateUserToken = async function () {
    await db.AuthToken.create({ 
      userId: this.dataValues.id
    });
    const refreshToken = await generateToken({
      user_id: this.dataValues.id,
      token_id: authToken.id
    }, {
      subject: 'refreshToken',
      expiresIn: '30d'
    });
    const accessToken = await generateToken({
      user_id: this.dataValues.id
    }, {
      subject: 'accessToken',
      expiresIn: '1h'
    });
    return { refreshToken, accessToken };
  }

  User.prototype.refreshUserToken = async function (tokenId, refreshTokenExp, oldRefreshToken) {
    const remainingTime = refreshTokenExp * 1000 - new Date().getTime();
    let refreshToken = oldRefreshToken;
    // Renew token if remaining time is less than 5 days
    if (remainingTime < 1000 * 60 * 60 * 24 * 5) {
      refreshToken = await generateToken({
        user_id: this.dataValues.id,
        token_id: tokenId
      }, {
        subject: 'refreshToken',
        expiresIn: '30d'
      });
    }
    const accessToken = await generateToken({
      user_id: this.dataValues.id
    }, {
      subject: 'accessToken',
      expiresIn: '1h'
    });
    return { refreshToken, accessToken };
  }

  return User;
}
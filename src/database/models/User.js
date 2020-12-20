import AuthToken from './AuthToken';

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
      unique: true
    },
    role: DataTypes.STRING,
    employer: DataTypes.STRING,
    profile_image_url: DataTypes.STRING,
    account_provider: {
      type: DataTypes.ENUM,
      values: ['google']
    },
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
    // paranoid: true // soft-deletion (in production?)
  });

  User.associate = (db) => {
    User.hasMany(db.AuthToken, { 
      foreignKey: { allowNull: false }, 
      onDelete: 'CASCADE'
    });
  }

  User.prototype.generateUserToken = async () => {
    const authToken = new AuthToken();
    authToken.user_id = this.id;
    await AuthToken.save(authToken);
    const refreshToken = await generateToken(
      {
        user_id: this.id,
        token_id: authToken.id
      },
      {
        subject: 'refreshToken',
        expiresIn: '30d'
      }
    );
  
    const accessToken = await generateToken(
      {
        user_id: this.id
      },
      {
        subject: 'accessToken',
        expiresIn: '1h'
      }
    );
  
    return { refreshToken, accessToken };
  }

  return User;
}
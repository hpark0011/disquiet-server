export default (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    name: {
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
    profile_image: {
      type: DataTypes.STRING
    },
    provider: {
      type: DataTypes.ENUM,
      values: ['GOOGLE']
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
    // paranoid: true // soft-deletion (in production)
  });

  // User.associate = (models) => {
  //   User.hasMany(models.Post);
  // }

  return User;
}

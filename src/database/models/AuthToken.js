export default (sequelize, DataTypes) => {
  const AuthToken = sequelize.define('auth_token', {
    user_id: DataTypes.INTEGER
  }, {
    underscored: true,
  });

  AuthToken.associate = (db) => {
    AuthToken.belongsTo(db.User, {
      foreignKey: { allowNull: false },
      onDelete: 'CASCADE',
    });
  }

  return AuthToken;
}
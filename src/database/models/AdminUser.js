export default (sequelize, DataTypes) => {
  const AdminUser = sequelize.define('admin_user', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    encrypted_password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    underscored: true,
  });

  return AdminUser;
}
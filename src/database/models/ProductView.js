export default (sequelize, DataTypes) => {
  const ProductView = sequelize.define('product_view', {
    product_id: DataTypes.INTEGER,
    ip_address: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    underscored: true,
  });

  ProductView.associate = (db) => {
    ProductView.belongsTo(db.Product, {
      foreignKey: { allowNull: false },
      onDelete: 'CASCADE',
    });
  }

  return ProductView;
}
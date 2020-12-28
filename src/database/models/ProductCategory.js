export default (sequelize, DataTypes) => {
  const ProductCategory = sequelize.define('product_category', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
  }, {
    underscored: true,
  });

  ProductCategory.associate = (db) => {
    ProductCategory.belongsToMany(db.Product, { through: 'products_product_categories' });
  }

  return ProductCategory;
}
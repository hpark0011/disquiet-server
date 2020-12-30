export default (sequelize, DataTypes) => {
  const ProductsProductCategories = sequelize.define('products_product_categories', {
  }, {
    underscored: true,
    freezeTableName: true,
  });

  return ProductsProductCategories;
}
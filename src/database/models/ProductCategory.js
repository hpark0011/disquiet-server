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
    timestamps: false
  });

  ProductCategory.associate = (db) => {
    ProductCategory.belongsToMany(db.Product, { through: db.ProductsProductCategories });
  }

  return ProductCategory;
}
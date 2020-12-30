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

  ProductCategory.getIdFromName = async (categoryName) => {
    const category = await db.ProductCategory.findOne({
      where: {
        name: categoryName
      }
    });
    return category.id;
  }

  return ProductCategory;
}
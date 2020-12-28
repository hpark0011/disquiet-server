export default (sequelize, DataTypes) => {
  const ProductUpvote = sequelize.define('product_upvote', {
    product_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
  }, {
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['product_id', 'user_id']
      }
    ]
  });

  ProductUpvote.associate = (db) => {
    ProductUpvote.belongsTo(db.Product, {
      foreignKey: { allowNull: false },
      onDelete: 'CASCADE',
    });
    ProductUpvote.belongsTo(db.User, {
      foreignKey: { allowNull: false },
      onDelete: 'CASCADE',
    });
  }

  return ProductUpvote;
}
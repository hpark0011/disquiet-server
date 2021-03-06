export default (sequelize, DataTypes) => {
  const Product = sequelize.define('product', {
    uploader_id: DataTypes.INTEGER,
    maker_id: DataTypes.INTEGER,
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    short_description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    link_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    thumbnail_url: DataTypes.STRING,
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    upvote_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    approved_at: DataTypes.DATE
  }, {
    underscored: true,
  });

  Product.associate = (db) => {
    Product.belongsTo(db.User, {
      as: 'uploader',
      foreignKey: { allowNull: false },
      onDelete: 'CASCADE',
    });
    Product.belongsTo(db.User, {
      as: 'maker'
    });
    Product.hasMany(db.ProductView, {
      foreignKey: { allowNull: false }, 
      onDelete: 'CASCADE'
    });
    Product.hasMany(db.ProductUpvote, {
      foreignKey: { allowNull: false }, 
      onDelete: 'CASCADE'
    });
    Product.hasMany(db.Comment, {
      foreignKey: { allowNull: false }, 
      onDelete: 'CASCADE'
    });
    Product.associate = (db) => {
      Product.belongsToMany(db.ProductCategory, { through: db.ProductsProductCategories });
    };
  }

  return Product;
}
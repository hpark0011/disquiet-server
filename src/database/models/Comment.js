export default (sequelize, DataTypes) => {
  const Comment = sequelize.define('comment', {
    product_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    like_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    underscored: true,
  });

  Comment.associate = (db) => {
    Comment.belongsTo(db.Product, {
      foreignKey: { allowNull: false },
      onDelete: 'CASCADE',
    });
    Comment.belongsTo(db.User, {
      foreignKey: { allowNull: false },
      onDelete: 'CASCADE',
    });
  }

  return Comment;
}
export default (sequelize, DataTypes) => {
  const CommentLike = sequelize.define('comment_like', {
    comment_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
  }, {
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['comment_id', 'user_id']
      }
    ]
  });

  CommentLike.associate = (db) => {
    CommentLike.belongsTo(db.Comment, {
      foreignKey: { allowNull: false },
      onDelete: 'CASCADE',
    });
    CommentLike.belongsTo(db.User, {
      foreignKey: { allowNull: false },
      onDelete: 'CASCADE',
    });
  }

  return CommentLike;
}
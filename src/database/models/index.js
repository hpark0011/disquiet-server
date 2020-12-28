import Sequelize, { DataTypes } from 'sequelize';
import { config } from '../config/config';
import AuthToken from './AuthToken';
import Comment from './Comment';
import Product from './Product';
import ProductCategory from './ProductCategory';
import ProductUpvote from './ProductUpvote';
import ProductView from './ProductView';
import User from './User';

const db = {};
const { NODE_ENV } = process.env;

export const sequelize = new Sequelize({
  database: config[NODE_ENV].database,
  username: config[NODE_ENV].username,
  password: config[NODE_ENV].password,
  host: config[NODE_ENV].host,
  port: config[NODE_ENV].port,
  dialect: config[NODE_ENV].dialect,
});

db.AuthToken = AuthToken(sequelize, DataTypes);
db.Comment = Comment(sequelize, DataTypes);
db.Product = Product(sequelize, DataTypes);
db.ProductCategory = ProductCategory(sequelize, DataTypes);
db.ProductUpvote = ProductUpvote(sequelize, DataTypes);
db.ProductView = ProductView(sequelize, DataTypes);
db.User = User(sequelize, DataTypes);

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;
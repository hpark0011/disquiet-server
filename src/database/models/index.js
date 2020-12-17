import Sequelize from 'sequelize';
import { config } from '../config/config';
import User from './User';

const models = {};
const { NODE_ENV } = process.env;

const sequelize = new Sequelize({
  database: config[NODE_ENV].database,
  username: config[NODE_ENV].username,
  password: config[NODE_ENV].password,
  host: config[NODE_ENV].host,
  port: config[NODE_ENV].port,
  dialect: config[NODE_ENV].dialect,
  logging: console.log,
});

models.User = User(sequelize, Sequelize.DataTypes);

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

export default sequelize;
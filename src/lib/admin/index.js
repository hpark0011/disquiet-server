import AdminBro from 'admin-bro';
import AdminBroSequelize from '@admin-bro/sequelize';
import passwordFeature from '@admin-bro/passwords';
import { buildAuthenticatedRouter } from '@admin-bro/koa';
import argon2 from 'argon2';
import db from '../../database/models';

AdminBro.registerAdapter(AdminBroSequelize);
const adminBro = new AdminBro({
  resources: [db.User, db.Product, db.ProductCategory, db.ProductView, db.Comment, {
    resource: db.AdminUser,
    options: {
      properties: { encrypted_password: { isVisible: false } },
    },
    features: [passwordFeature({
      properties: { encryptedPassword: 'encrypted_password' },
      hash: argon2.hash,
    })]
  }],
  rootPath: '/admin',
  branding: {
    companyName: 'Disquiet Admin',
    softwareBrothers: false,
  }
});

export const getAdminRouter = (app) => {
  return buildAuthenticatedRouter(adminBro, app, {
    authenticate: async (email, password) => {
      const user = await db.AdminUser.findOne({ where: { email } });
      if (user && email && password && await argon2.verify(user.encrypted_password, password)) {
        return user.toJSON();
      }
      return null;
    },
  });
}
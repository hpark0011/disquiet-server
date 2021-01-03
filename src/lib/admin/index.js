import AdminBro from 'admin-bro';
import AdminBroSequelize from '@admin-bro/sequelize';
import passwordFeature from '@admin-bro/passwords';
import argon2 from 'argon2';
import db from '../../database/models';

AdminBro.registerAdapter(AdminBroSequelize);
export const adminBro = new AdminBro({
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
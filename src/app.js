import Koa from 'koa';
import { buildAuthenticatedRouter } from '@admin-bro/koa';
import argon2 from 'argon2';
import bodyParser from 'koa-bodyparser';
import { ApolloServer } from 'apollo-server-koa';
import db from './database/models';
import apiRouter from './router';
import schema from './graphql/schema';
import { authUser } from './lib/auth/token';
import { adminBro } from './lib/admin';

const app = new Koa();
app.keys = [process.env.KOA_SECRET_KEY_1, process.env.KOA_SECRET_KEY_2];

// Add admin panel
const adminRouter = buildAuthenticatedRouter(adminBro, app, {
  authenticate: async (email, password) => {
    const user = await db.AdminUser.findOne({ where: { email } });
    if (user && email && password && await argon2.verify(user.encrypted_password, password)) {
      return user.toJSON();
    }
    return null;
  },
});

app.use(adminRouter.routes()).use(adminRouter.allowedMethods());
app.use(apiRouter.routes()).use(apiRouter.allowedMethods());
app.use(bodyParser());
app.use(authUser);

const server = new ApolloServer({ 
  schema,
  context: async ({ ctx }) => {
    try {
      return {
        userId: ctx.state.userId,
        clientIp: ctx.request.ip,
        removeCookies: () => {
          ctx.cookies.set('accessToken');
          ctx.cookies.set('refreshToken');
        }
      };
    } catch (err) {
      return {};
    }
  },
  tracing: process.env.NODE_ENV === 'development'
});
server.applyMiddleware({ app });
// alternatively you can get a composed middleware from the apollo server
// app.use(server.getMiddleware());

export default app;
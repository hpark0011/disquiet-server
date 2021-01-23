import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { ApolloServer } from 'apollo-server-koa';
import apiRouter from './router';
import schema from './graphql/schema';
import { authUser } from './lib/auth/token';
import { getAdminRouter } from './lib/admin';

const app = new Koa();
app.keys = [process.env.KOA_SECRET_KEY_1, process.env.KOA_SECRET_KEY_2];

// Add admin panel
const adminRouter = getAdminRouter(app);
app.use(adminRouter.routes()).use(adminRouter.allowedMethods());

if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
}
app.use(bodyParser());
app.use(authUser);
app.use(apiRouter.routes()).use(apiRouter.allowedMethods());

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
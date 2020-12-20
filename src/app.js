import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { ApolloServer } from 'apollo-server-koa';
import router from './router';
import schema from './graphql/schema';

const app = new Koa();
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

const server = new ApolloServer({ 
  schema,
  tracing: process.env.NODE_ENV === 'development'
});
server.applyMiddleware({ app });
// alternatively you can get a composed middleware from the apollo server
// app.use(server.getMiddleware());

export default app;
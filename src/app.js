import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { ApolloServer } from 'apollo-server-koa';
import routes from './routes';
import schema from './graphql/schema';

const app = new Koa();
app.use(bodyParser());
app.use(routes.routes());

const server = new ApolloServer({ 
  schema,
  tracing: process.env.NODE_ENV === 'development'
});
server.applyMiddleware({ app });
// alternatively you can get a composed middleware from the apollo server
// app.use(server.getMiddleware());

export default app;
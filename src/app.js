import Koa from 'koa';
import { ApolloServer } from 'apollo-server-koa';
import routes from './routes';
import schema from './graphql/schema';

const app = new Koa();
app.use(routes.routes());

const server = new ApolloServer({ 
  schema
 });
server.applyMiddleware({ app });
// alternatively you can get a composed middleware from the apollo server
// app.use(server.getMiddleware());

export default app;
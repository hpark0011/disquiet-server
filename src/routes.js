import Router from '@koa/router';
// import ApolloServer from 'apollo-server-koa';

const routes = new Router();

// routes.use('/api', api.routes());

// routes.get('/graphiql',
//   ApolloServer.graphiqlKoa({
//     endpointURL: '/graphql', // a POST endpoint that GraphiQL will make the actual requests to
//   }),
// );

routes.get('/', ctx => {
  ctx.body = 'hello world!';
});

export default routes;
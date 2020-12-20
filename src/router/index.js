import Router from '@koa/router';
// import ApolloServer from 'apollo-server-koa';
import api from './api/index';

const router = new Router();

router.use('/api', api.routes());

// routes.get('/graphiql',
//   ApolloServer.graphiqlKoa({
//     endpointURL: '/graphql', // a POST endpoint that GraphiQL will make the actual requests to
//   }),
// );

router.get('/', ctx => {
  ctx.body = 'hello world!';
});

export default router;
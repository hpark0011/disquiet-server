import merge from 'lodash/merge';
import { gql, makeExecutableSchema } from 'apollo-server-koa';
import * as user from './user';
import * as product from './product';
import * as comment from './comment';

// Construct a schema, using GraphQL schema language
const typeDef = gql`
  scalar Date
  type Query {
    _version: String
  }
  type Mutation {
    _empty: String
  }
`;

const schema = makeExecutableSchema({
  typeDefs: [
    typeDef,
    user.typeDef,
    product.typeDef,
    comment.typeDef
  ],
  resolvers: merge(
    user.resolvers,
    product.resolvers,
    comment.resolvers
  )
});

export default schema;
import merge from 'lodash/merge';
import { gql, makeExecutableSchema } from 'apollo-server-koa';
import * as user from './user';

// Construct a schema, using GraphQL schema language
const typeDef = gql`
  scalar Date
  type Query {
    _: String
  }
  type Mutation {
    _: String
  }
`;
 
// Provide resolver functions for your schema fields
const resolvers = {
  Query: {},
  Mutation: {}
};

const schema = makeExecutableSchema({
  typeDefs: [typeDef, user.typeDef],
  resolvers: merge(
    resolvers,
    user.resolvers
  )
});

export default schema;
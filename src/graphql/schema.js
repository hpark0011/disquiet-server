import merge from 'lodash/merge';
import { gql, makeExecutableSchema } from 'apollo-server-koa';

// Construct a schema, using GraphQL schema language
const typeDef = gql`
  type Query {
    hello: String
  }
`;
 
// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
};

const schema = makeExecutableSchema({
  typeDefs: [typeDef],
  resolvers: merge(
    resolvers
  )
});

export default schema;
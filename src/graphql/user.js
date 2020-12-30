import { gql, AuthenticationError, ApolloError } from 'apollo-server-koa';
import db from '../database/models';

export const typeDef = gql`
  enum AccountProvider {
    google
  }

  input UserInput {
    display_name: String
    username: String
    role: String
    employer: String
    profile_image_url: String
  }

  type User {
    id: Int!
    display_name: String
    email: String
    username: String
    role: String
    employer: String
    profile_image_url: String
    account_provider: AccountProvider
    is_receiving_newsletter: Boolean
    is_policy_agreed: Boolean
    created_at: Date
    updated_at: Date
  }

  type Query {
    user(id: Int!): User
  }

  type Mutation {
    updateUser(id: Int!, input: UserInput): User
    deleteUser(id: Int!): Boolean
  }
`;

export const resolvers = {
  Query: {
    user: async (_, { id }) => {
      return await db.User.findByPk(id);
    },
  },
  Mutation: {
    updateUser: async (_, { id, input }, ctx) => {
      if (!ctx.userId) throw new AuthenticationError('User is not logged in!');
      
      const user = await db.User.findByPk(id);
      if (!user) throw new ApolloError('Cannot find user');

      Object.assign(user, input);
      return await user.save(); // TODO: check what it returns
    },
    deleteUser: async (_, { id }, ctx) => {
      if (!ctx.userId) throw new AuthenticationError('User is not logged in!');
      
      const user = await db.User.findByPk(id);
      if (!user) throw new ApolloError('Cannot find user');

      ctx.removeCookies();
      await user.destroy(); // TODO: check what it returns
      // await db.User.destroy({ where : { id } });
      return true;
    }
  }
}
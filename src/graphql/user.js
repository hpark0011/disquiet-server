import { gql } from 'apollo-server-koa';
import User from '../database/models/User';

export const typeDef = gql`
  enum AccountProvider {
    GOOGLE
  }

  input UserInput {
    name: String
    email: String
    username: String
    profile_image: String
    account_provider: AccountProvider
    is_receiving_newsletter: Boolean
    is_policy_agreed: Boolean
  }

  type User {
    id: Int!
    name: String
    email: String
    username: String
    profile_image: String
    account_provider: AccountProvider
    is_receiving_newsletter: Boolean
    is_policy_agreed: Boolean
    created_at: Date
    updated_at: Date
  }

  # extend type Query {
  #   user(id: Int!): User
  # }

  # extend type Mutation {
  #   updateUser(): User
  #   deleteUser(id: Int!): Boolean
  # }
`;

export const resolvers = {
  // Query: {
  //   user: (_, { id }) => getUser(id),
  // },
  // Mutation: {
  //   updateUser: (_, args) => updateUser(),
  //   deleteUser: (_, { id }) => deleteUser(id),
  // }
}
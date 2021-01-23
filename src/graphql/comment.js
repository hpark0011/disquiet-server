import { gql, ApolloError, AuthenticationError } from 'apollo-server-koa';
import db from '../database/models';
import Comment from '../database/models/Comment';
import CommentLike from '../database/models/CommentLike';

export const typeDef = gql`
  type Comment {
    id: Int!
    product_id: Int
    user_id: Int
    content: String
    like_count: Int
    created_at: Date
    updated_at: Date
  }

  extend type Query {
    comment(id: Int!): Comment
  }

  extend type Mutation {
    writeComment(postId: Int!, content: String): Comment
    editComment(id: Int!, content: String): Comment
    toggleLikeComment(id: Int!): Comment
    deleteComment(id: Int!): Boolean
  }
`;

export const resolvers = {
  Query: {
    comment: async (_, { id }) => {
      return await db.Comment.findByPk(id);
    },
  },
  Mutation: {
    writeComment: async (_, { postId, content }, ctx) => {
      if (!ctx.userId) throw new AuthenticationError('User is not logged in!');

      const post = await db.Post.findByPk(postId);
      if (!post) throw new ApolloError('Cannot find post');

      const comment = new Comment();
      comment.product_id = postId;
      comment.user_id = ctx.userId;
      comment.content = content;
      return await db.Comment.create(comment); // TODO: check what it returns
    },
    editComment: async (_, { id, content }, ctx) => {
      if (!ctx.userId) throw new AuthenticationError('User is not logged in!');

      const comment = await db.Comment.findByPk(id);
      if (!comment) throw new ApolloError('Cannot find comment');
      if (comment.user_id !== ctx.userId) throw new ApolloError('Not the owner of the comment');

      comment.context = content;
      return await comment.save(); // TODO: check what it returns
    },
    toggleLikeComment: async (_, { id }, ctx) => {
      if (!ctx.userId) throw new AuthenticationError('User is not logged in!');

      const comment = await db.Comment.findByPk(id);
      if (!comment) throw new ApolloError('Cannot find comment');

      const existingCommentLike = await db.CommentLike.findOne({
        where: {
          comment_id: id,
          user_id: ctx.userId
        }
      });
      try {
        if (existingCommentLike) {
          // Cancel like
          await existingCommentLike.destroy();
        }
        else {
          // Like
          const commentLike = new CommentLike();
          commentLike.comment_id = id;
          commentLike.user_id = ctx.userId;
          await db.CommentLike.create(commentLike);
        }
      } catch (err) {
        console.log(err);
        return comment;
      }

      const totalLikes = await db.CommentLike.count({
        where: {
          comment_id: id
        }
      });
      comment.like_count = totalLikes;
      await comment.save();

      return comment;
    },
    deleteComment: async (_, { id }, ctx) => {
      if (!ctx.userId) throw new AuthenticationError('User is not logged in!');
      
      const comment = await db.Comment.findByPk(id);
      if (!comment) throw new ApolloError('Cannot find comment');
      if (comment.user_id !== ctx.userId) throw new ApolloError('Not the owner of the comment');

      await comment.destroy(); // TODO: check what it returns
      // return await db.Comment.destroy({ where : { id } });
      return true;
    },
  }
};
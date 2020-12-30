import { Op } from 'sequelize';
import { gql, ApolloError, AuthenticationError } from 'apollo-server-koa';
import db, { sequelize } from '../database/models';
import ProductCategory from '../database/models/ProductCategory';
import ProductView from '../database/models/ProductView';
import ProductUpvote from '../database/models/ProductUpvote';
import Product from '../database/models/Product';
import ProductsProductCategories from '../database/models/ProductsProductCategories';

export const typeDef = gql`
  input ProductInput {
    name: String
    short_description: String
    link_url: String
    description: String
    thumbnail_url: String
    view_count: Int
    upvote_count: Int
    categories: [Int]
    is_maker: Boolean
  }

  type Product {
    id: Int!
    name: String
    short_description: String
    link_url: String
    description: String
    thumbnail_url: String
    view_count: Int
    upvote_count: Int
    is_approved: Boolean
    approved_at: Date
    created_at: Date
    updated_at: Date
  }

  type Query {
    product(id: Int!): Product
    products(categoryId: Int): [Product]
  }

  type Mutation {
    createProuct(input: ProductInput): Product
    updateProduct(id: Int!, input: ProductInput): Product
    deleteProduct(id: Int!): Boolean
    viewProduct(id: Int!): Boolean
    toggleUpvoteProduct(id: Int!): Product
  }
`;

export const resolvers = {
  Query: {
    product: async (_, { id }) => {
      return await db.Product.findByPk(id);
    },
    products: async (_, { categoryId }) => {
      if (categoryId) {
        return await db.Product.findAll({
          where: {
            is_approved: true
          },
          include: {
            model: ProductCategory,
            through: {
              where: {
                product_category_id: categoryId
              }
            }
          }
        });
      }
      return await db.Product.findAll({
        where: {
          is_approved: true
        }
      });
    },
  },
  Mutation: {
    createProduct: async (_, { input }, ctx) => {
      if (!ctx.userId) throw new AuthenticationError('User is not logged in!');
      
      try {
        await sequelize.transaction(async t => {
          // Create product
          const product = new Product();
          product.name = input.name;
          product.short_description = input.short_description;
          product.link_url = input.link_url;
          product.description = input.description;
          product.thumbnail_url = input.thumbnail_url;
          if (input.is_maker) product.maker_id = ctx.userId;
          const newProduct = await db.Product.create(product, { transaction: t }); //TODO: CHECK WHAT IT RETURNS!

          // Map product to productCategories
          if (input.categories && input.categories.length > 0) {
            const ppcs = input.categories.map(categoryId => {
              const ppc = new ProductsProductCategories();
              ppc.product_id = newProduct.id;
              ppc.product_category_id = categoryId;
              return ppc;
            });
            await db.ProductsProductCategories.bulkCreate(ppcs, { transaction: t });
          }

          return newProduct;
        });
      } catch(err) {
        console.log(err);
      }
    },
    updateProduct: async (_, { id, input }, ctx) => {
      if (!ctx.userId) throw new AuthenticationError('User is not logged in!');
      
      const product = await db.Product.findByPk(id);
      if (!product) throw new ApolloError('Cannot find product');
      if (product.uploader_id !== ctx.userId) throw new ApolloError('Not the owner of the product');

      Object.assign(product, input);
      return await product.save(); // TODO: check what it returns
    },
    deleteProduct: async (_, { id }, ctx) => {
      if (!ctx.userId) throw new AuthenticationError('User is not logged in!');
      
      const product = await db.Product.findByPk(id);
      if (!product) throw new ApolloError('Cannot find product');
      if (product.uploader_id !== ctx.userId) throw new ApolloError('Not the owner of the product');

      // TODO: delete product thumbnail from S3

      await product.destroy(); // TODO: check what it returns
      // return await db.Product.destroy({ where : { id } });
      return true;
    },
    viewProduct: async (_, { id }, ctx) => {
      const product = await db.Product.findByPk(id);
      if (!product) throw new ApolloError('Cannot find product');

      const existingView = await db.ProductView.findOne({
        where: {
          product_id: id,
          ip_address: ctx.clientIp,
          created_at: {
            [Op.gt]: new Date(Date.now() - (1000 * 60 * 60 * 24)) // viewed in the last 24 hours
          }
        }
      });
      if (existingView) return false;
      
      const productView = new ProductView();
      productView.product_id = id;
      productView.ip_address = ctx.clientIp;
      await db.ProductView.create(productView);
      
      product.view_count += 1;
      const updatedProduct = await product.save();
      if (!updatedProduct) return false;

      return true;
    },
    toggleUpvoteProduct: async (_, { id }, ctx) => {
      if (!ctx.userId) throw new AuthenticationError('User is not logged in!');

      const product = await db.Product.findByPk(id);
      if (!product) throw new ApolloError('Cannot find product');

      const existingProductUpvote = await db.ProductUpvote.findOne({
        where: {
          product_id: id,
          user_id: ctx.userId
        }
      });
      try {
        if (existingProductUpvote) {
          // Cancel upvote
          await productUpvote.destroy();
        }
        else {
          // Upvote
          const productUpvote = new ProductUpvote();
          productUpvote.product_id = id;
          productUpvote.user_id = ctx.userId;
          await db.ProductUpvote.create(productUpvote);
        }
      } catch(err) {
        console.log(err);
        return product;
      }

      const totalUpvotes = await db.ProductUpvote.count({
        where: {
          product_id: id
        }
      });
      product.upvote_count = totalUpvotes;
      await product.save();

      return product;
    },
  }
}
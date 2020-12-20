import jwt from 'jsonwebtoken';
import db from '../../database/models';

const { SECRET_KEY } = process.env;

export const generateToken = async (payload, options) => {
  const jwtOptions = {
    issuer: 'disquiet.tech',
    expiresIn: '7d',
    ...options
  };
  // if (!jwtOptions.expiresIn) {
  //   // removes expiresIn when expiresIn is given as undefined
  //   delete jwtOptions.expiresIn;
  // }
  return new Promise((resolve, reject) => {
    jwt.sign(payload, SECRET_KEY, jwtOptions, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};

export const setTokenCookie = (ctx, tokens) => {
  ctx.cookies.set('accessToken', tokens.accessToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60,
    // domain: '.disquiet.tech'
  });

  ctx.cookies.set('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 30,
    // domain: '.disquiet.tech'
  });
}

export const decodeToken = async (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    });
  });
}

export const renewToken = async (ctx, refreshToken) => {
  try {
    const decoded = await decodeToken(refreshToken);
    const user = await db.User.findOne({ where : { id: decoded.user_id } });
    if (!user) {
      throw new Error('Invalid User!');
    }
    const tokens = await user.refreshUserToken(decoded.token_id, decoded.exp, refreshToken);
    setTokenCookie(ctx, tokens);
    return decoded.user_id;
  } catch (err) {
    throw err;
  }
};

export const verifyUser = async (ctx, next) => {
  // Ignore when logging out
  if (ctx.path.includes('/auth/logout')) return next();

  let accessToken = ctx.cookies.get('accessToken');
  const refreshToken = ctx.cookies.get('refreshToken');

  const { authorization } = ctx.request.headers;

  if (!accessToken && authorization) {
    accessToken = authorization.split(' ')[1];
  }

  try {
    if (!accessToken) {
      throw new Error('No Access Token!');
    }
    const decoded = await decodeToken(accessToken);
    ctx.state.user_id = decoded.user_id;
    // Renew token when access token remaining time is less than 30 min
    const remainingTime = decoded.exp * 1000 - new Date().getTime();
    if (refreshToken && remainingTime < 1000 * 60 * 30) {
      await renewToken(ctx, refreshToken);
    }
  } catch (err) {
    // Invalid access token
    if (!refreshToken) return next();
    try {
      const userId = await renewToken(ctx, refreshToken);
      ctx.state.user_id = userId;
    } catch (err) {}
  }

  return next();
};
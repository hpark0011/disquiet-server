import jwt from 'jsonwebtoken';

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
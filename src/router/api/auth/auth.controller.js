import { Op } from 'sequelize';
import db from '../../../database/models';
import { generateAuthUrl, baseRedirectUrl } from '../../../lib/auth';
import { getGoogleAccessToken, getGoogleProfile } from '../../../lib/auth/google';
import { generateToken, setTokenCookie, decodeToken } from '../../../lib/auth/token';

const { GOOGLE_ID, GOOGLE_SECRET } = process.env;

/**
 * Redirect to Google login page
 *
 * GET /api/auth/redirect/google
 */
export const googleRedirect = async ctx => {
  const { next } = ctx.query;
  const loginUrl = generateAuthUrl('google', next);
  ctx.redirect(loginUrl);
}

/**
 * GET /api/auth/callback/google
 */
export const googleCallback = async (ctx, next) => {
  const { code } = ctx.query;
  if (!code) {
    ctx.status = 400;
    return;
  }
  try {
    const accessToken = await getGoogleAccessToken({
      clientId: GOOGLE_ID,
      clientSecret: GOOGLE_SECRET,
      redirectUri: `${baseRedirectUrl}/google`,
      code
    });

    /**
     * profile = { displayName, email, profileImageUrl }
     */
    const profile = await getGoogleProfile(accessToken);

    ctx.state.profile = profile;
    ctx.state.accessToken = accessToken;
    ctx.state.provider = 'google';
    return next();
  } catch (err) {
    ctx.throw(500, err);
  }
};

/**
 * Redirect to register page
 */
export const authCallback = async ctx => {
  try {
    const { profile, accessToken, provider } = ctx.state;
    if (!profile || !accessToken) return;

    // Check if the user already exists
    if (profile.email) {
      const user = await db.User.findOne({ 
        where: { 
          email: profile.email
        }
      });
      // If exists, log in
      if (user) {
        const tokens = await user.generateUserToken();
        setTokenCookie(ctx, tokens);
        const redirectUrl = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3000' 
          : 'https://REAL-CLIENT-URL';
        
        const state = ctx.query.state ? JSON.parse(ctx.query.state) : null;
        const nextUri = ctx.query.nextUri || state ? state.nextUri : '/';

        ctx.redirect(encodeURI(redirectUrl.concat(nextUri)));
        return;
      }
    }

    const registerToken = await generateToken({
      profile,
      accessToken,
      provider
    }, {
      expiresIn: '1h'
    });

    // Set register token to cookie with google account info
    ctx.cookies.set('registerToken', registerToken, {
      maxAge: 1000 * 60 * 60
    });

    const redirectUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000/register?oauth=1'
        : 'https://REAL-CLIENT-URL/register?oauth=1';
    ctx.redirect(encodeURI(redirectUrl));
  } catch (err) {
    ctx.throw(500, err);
  }
};

/**
 * Get user's profile from register token
 *
 * GET /api/auth/profile
 */
export const getProfile = async ctx => {
  const registerToken = ctx.cookies.get('registerToken');
  if (!registerToken) {
    ctx.status = 401;
    return;
  }
  try {
    const decoded = await decodeToken(registerToken);
    ctx.body = decoded.profile;
  } catch (err) {
    ctx.status = 400;
    return;
  }
};

/**
 * Register user
 *
 * POST /api/auth/register
 */
export const registerUser = async ctx => {
  // Check if register token exists
  const registerToken = ctx.cookies.get('registerToken');
  if (!registerToken) {
    ctx.status = 401;
    return;
  }

  const { 
    display_name,
    username,
    role,
    employer,
    is_receiving_newsletter,
    is_policy_agreed
  } = ctx.request.body;

  let decoded = null;
  try {
    decoded = await decodeToken(registerToken);
  } catch (err) {
    // Failed to decode token
    ctx.status = 401;
    return;
  }
  const email = decoded.profile.email;

  try {
    const existingUser = await db.User.findOne({ 
      where : {
        [Op.or]: [
          { username: username },
          { email: email }
        ]
      } 
    });

    if (existingUser) {
      ctx.status = 409;
      ctx.body = {
        name: 'ALREADY_EXISTS',
        payload: email === existingUser.email ? 'email' : 'username'
      };
      return;
    }

    // Create new user
    const user = {
      display_name,
      email,
      username,
      role,
      employer,
      profile_image_url: decoded.profile.profileImageUrl,
      account_provider: decoded.provider,
      is_receiving_newsletter,
      is_policy_agreed
    };
    const newUser = await db.User.create(user);

    // Log in
    const tokens = await newUser.generateUserToken();
    setTokenCookie(ctx, tokens);
    ctx.body = {
      ...user,
      tokens: {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken
      }
    };
  } catch (err) {
    console.log(err);
  }
}

/**
 * Log out user
 *
 * POST /api/auth/logout
 */
export const logOutUser = async ctx => {
  // clear cookies
  ctx.cookies.set('accessToken', '', {
    domain: process.env.NODE_ENV === 'development' ? undefined : '.disquiet.tech'
  });
  ctx.cookies.set('refreshToken', '', {
    domain: process.env.NODE_ENV === 'development' ? undefined : '.disquiet.tech'
  });
  ctx.status = 204;
}
import { Op } from 'sequelize';
import db from '../../../database/models';
import User from '../../../database/models/User';
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
    // const socialAccount = await getSocialAccount({
    //   uid: profile.uid,
    //   provider: 'google'
    // });

    ctx.state.profile = profile;
    // ctx.state.socialAccount = socialAccount;
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
      const user = await db.User.findOne({ where : { email: profile.email } });
      // If exists, log in
      if (user) {
        const tokens = await user.generateUserToken();
        setTokenCookie(ctx, tokens);
        const redirectUrl = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3000/' 
          : 'https://REAL-CLIENT-URL/';
        
        const state = ctx.query.state ? JSON.parse(ctx.query.state) : null;
        const next = ctx.query.next || (state ? state.next : '/');

        ctx.redirect(encodeURI(redirectUrl.concat(next)));
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
        ? 'http://localhost:3000/register'
        : 'https://REAL-CLIENT-URL/register';
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

  const { display_name, username, role, employer, is_receiving_newsletter, is_policy_agreed } = ctx.request.body;

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
    const user = new User();
    user.display_name = display_name;
    user.email = email;
    user.username = username;
    user.role = role;
    user.employer = employer;
    user.profile_image_url = decoded.profile.profileImageUrl; // TODO: image S3 upload
    user.account_provider = decoded.provider;
    user.is_receiving_newsletter = is_receiving_newsletter;
    user.is_policy_agreed = is_policy_agreed;
    await db.User.create(user);

    // Log in
    const tokens = await user.generateUserToken();
    setTokenCookie(ctx, tokens);
    ctx.body = {
      ...user,
      profile,
      tokens: {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken
      }
    };
  } catch (err) {}
}

/**
 * Log out user
 *
 * POST /api/auth/logout
 */
export const logOutUser = async ctx => {
  // clear cookies
  ctx.cookies.set('accessToken', '', {
    // domain: process.env.NODE_ENV === 'development' ? undefined : '.disquiet.tech'
  });
  ctx.cookies.set('refreshToken', '', {
    // domain: process.env.NODE_ENV === 'development' ? undefined : '.disquiet.tech'
  });
  ctx.status = 204;
}
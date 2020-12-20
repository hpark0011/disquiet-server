import Router from '@koa/router';
import { authCallback, googleCallback, googleRedirect, getProfile, registerUser, logOutUser } from './auth.controller';

const auth = new Router();

auth.get('/redirect/google', googleRedirect);
auth.get('/callback/google', googleCallback, authCallback);
auth.get('/profile', getProfile);
auth.post('/register', registerUser);
auth.post('/logout', logOutUser);

export default auth;
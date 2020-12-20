import Router from '@koa/router';
import { authCallback, googleCallback, googleRedirect, registerUser } from './auth.controller';

const auth = new Router();

auth.get('/redirect/google', googleRedirect);
auth.get('/callback/google', googleCallback, authCallback);
auth.post('/register', registerUser);

export default auth;
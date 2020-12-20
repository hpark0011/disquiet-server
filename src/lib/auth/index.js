import { google } from 'googleapis';

const { GOOGLE_ID, GOOGLE_SECRET } = process.env;
export const baseRedirectUrl = 
  process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8000/api/auth/callback'
    : 'https://REAL-API-HOST/api/auth/callback'

export const generateAuthUrl = (provider, next = '/') => {
  const nextUri = encodeURI(next);
  switch (provider) {
    case 'google':
      const redirectUrl = `${baseRedirectUrl}/google`;
      const oauth2Client = new google.auth.OAuth2(GOOGLE_ID, GOOGLE_SECRET, redirectUrl);
      const url = oauth2Client.generateAuthUrl({
        scope: [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile'
        ],
        state: JSON.stringify({ nextUri })
      });
      return url;
    default:
      return;
  }
}
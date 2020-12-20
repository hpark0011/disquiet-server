import { google } from 'googleapis';

export const getGoogleAccessToken = async ({ clientId, clientSecret, redirectUri, code }) => {
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const { tokens } = await oauth2Client.getToken(code);
  // oauth2Client.setCredentials(tokens);
  if (!tokens.access_token) throw new Error('Failed to retrieve google access token');
  return tokens.access_token;
}

export const getGoogleProfile = async (accessToken) => {
  const peopleApi = google.people('v1');
  const userInfo = await peopleApi.people.get({
    access_token: accessToken,
    resourceName: 'people/me',
    personFields: 'names,emailAddresses,photos'
  });
  const { data } = userInfo;
  const userProfile = {
    displayName: data.names[0].displayName || 'noname',
    email: data.emailAddresses[0].value || null,
    profileImageUrl: data.photos[0].url || null
  };
  return userProfile;
}
ALL user actions should be called through a server-action first, which will call the getAndVerifyAccessToken method first.
This both verifies the access token is authentic and updates necessary data about the user (last access token use timestamp).



https://www.youtube.com/watch?v=mCmwqhvsyUg

Server actions under the hood are just API endpoints.
Server components only rendered on server.

server action order (the order is important and thought of!):
- ensure "import server-only" for DAL and "use server" for server actions
- check relevant permissions
- check user is not deleted/disabled, and then:
- check passed query arguments are associated with the user, or that they're not the users but they have permission to affect them. 
    As a rule of thumb, no need to check GET_USER_ID_FROM_ACCESS_TOKEN or non-id variables (like expense name or description or timestamp), but stuff like
    expense id or weight id or document id should be checked when updating expense/weight/document respectively.
    (eg. a user could use their own token to request to update another user's expense, as long as they know the expense ID.
    The user's own token is valid, therefore we don't return an error.) 
    Without this check, the only layer of defense is that the the user doesn't know other user's expense ids. But we should NEVER rely on that.
    Also make sure THAT user isn't deleted/disabled.
    (for example I want to update another user's expense with the expense id, but that user is disabled/deleted!)
- Check that entries are still valid and not expired/deleted/revoked when updating/getting them.
- check whether arguments are valid
- call AUTHENTICATED query/ies with the user's token
- if returns non-void type, convert to minimized-data type

Internal queries:
- Add the AuthorizedDALScope for authenticated queries, and the AuthroizedDALTokenlessQueryScope to tokenless queries. 
    In the case of the latter, put them in tokenless-queries.ts. Be Careful with tokenless queries, they don't require an authenticated token to execute. 
    (use only in homepage and middleware)
- Convention #1: Don't pass servertypes as parameters. Pass parameters individually. ServerTypes are only to be used when returned from queries, 
    aka, only when we know the object 100% exists. This is to prevent human mistakes, so we always know a ServerType is valid and was returned by server.
- Convention #2: If the query returns a singular object, return null if it doesn't exist. If it's an array, return an empty array.
- Throw error if result.rowCount == 0 in update queries.
- Document the function






DROP TABLE ACCESS_TOKENS;
DROP TABLE ACCOUNT_CREATION_CODES;
DROP TABLE GYM_WEIGHT;
DROP TABLE USERS;
DROP TABLE EXPENSES;
DROP TABLE USER_PERMISSIONS CASCADE;

DELETE FROM USERS WHERE 'email' = 'user1@example.com';
DELETE FROM ACCOUNT_CREATION_CODES WHERE code = '000000';
INSERT INTO ACCOUNT_CREATION_CODES (code, email, account_default_token_expiry_seconds, expiration_timestamp, used_timestamp, deletion_timestamp) VALUES
('000000', 'user1@example.com', 604800,'2027-05-15 23:59:59', NULL, NULL);
INSERT INTO ACCOUNT_CREATION_CODES (code, email, account_default_token_expiry_seconds, expiration_timestamp, used_timestamp, deletion_timestamp) VALUES
('000001', 'user5@example.com', 604800,'2027-05-15 23:59:59', NULL, NULL);


SELECT * FROM ACCOUNT_CREATION_CODES;



INSERT INTO GYM
SELECT * FROM USERS;
SELECT * FROM ACCESS_TOKENS;
SELECT * FROM ACCOUNT_CREATION_CODES;
SELECT * FROM EXPENSES;
SELECT * FROM USER_PERMISSIONS;
SELECT * FROM GYM_WEIGHT;


INSERT INTO user_permissions (user_id, permission_name) VALUES
  ('fb9914ec-5441-48b6-969e-75dcd427ff09', 'use_app_book_kee');
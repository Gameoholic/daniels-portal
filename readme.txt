
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


todo:
- [ ] advanced settings tab: fix max access tokens warning even if current token amount changed (we're not refreshing the page, so the tokenAmount variable doesn't update hence the un-updated warning)
- [x] Check permissions before running server queries and/or actions? - YES. ALWAYS check BOTH token validity AND permission in db_actions. db_queries is ok not to check there we're not calling it directly. Maybe lock it somehow?
- [ ] https://www.youtube.com/watch?v=mCmwqhvsyUg put everytnihnig into components
- [ ] All action and query arguments can be undefined for some reason..? This can cause bugs
- [ ] Admin panel: last account usage doesnt work if no access tokens exist.
- [x] Why do we have try{} inside internal db queries just to throw the error later..?
- [ ] User management - fix up access tokens section, and actions(?) section
- [ ] Rewrite account creation code component - super messy

Semi-urgent fixes:
- [ ] Eventually when we add account deletion, validateToken should check that the account isn't deleted, and also any query that passes a user id as a parameter (even updating other users like from the admin page) should ensure that the user isn't deleted ugh this is a pain maybe think of a better solution like globally across all internal queries only update user if it isn't deleted or smthn
- [ ] Before executing any server action, make sure the user isn't deleted/disabled (server action order step 2 and 3. just haven't done it yet)
- [ ] Add the user deleted/disabled check to verifyAccessToken and in general make sure user deletion/disabled state is accounted for in every query even login and account creation and even permissions.

Non-urgent fixes:
- [ ] Advanced user settings should round the default token expiry time (for example, setting to 99 minutes and refreshing will set it to 1.27 hours. In this case it should just show 99 minutes and not 1.27 hours). It should never be float when displayed to user, because if it's float server action will return error.
- [ ] Fix the icons being visible to even people who don't have permissions by putting them all into their own separate components? Only send the components the user has access to via a big server component.
- [ ] Stop using interfaces, move on to actual types, and make sure the internal server ones are not importable in client (right now they are because interface stupid.)
- [ ] Should you be able to ban/unban/give perms/remove perms/etc for yourself? What about undisabling an account through the admin panel?
- [ ] Why do we throw and catch error in all internal db functions? we can just throw it.
- [ ] Script to create .env.local
- [ ] Make a check that runs at the start of every script, as well as our general app, that checks if .env.local has all required parameters provided in the default file

Non-urgent features:
- [ ] Home page: Messages
- [ ] executeDatabaseQuery: built-in permission check with permission as argument?
- [ ] User settings security: The last successful log in made on your account using your password. (This does not include devices accessing your account via already existing access tokens.)
- [ ] User Settings security: Unsuccessful login attempts since last successful log in using your password.
- [ ] User Settings security: Last failed log in date
- [ ] Default max access tokens at a time and token expiration values configurable in env variables
- [ ] throw error if result.rowcount == 0 in internal insert queries? Similar to update queries
- [ ] make the tokenlessqueryscope only importable in tokenless-queries.ts, just for extra developer experience and safety.
- [ ] Better error tracking. Build some kind of error sentry, and have server-errors and client-errors along with timestamp and userid be logged in memory or something (database too expensive). Never send client the error code cause they can use it to try and figure out what caused an error (for example, sometimes in the code we mask the true error and return a fake error), but have an optional error string that IS sent to the client. Otherwise just send internal server error, contact administrator or try again.
- [ ] "root" default user with all permissions when we first start the server? (password must be changed / account will be deleted after first log in) make sure it's marked as a sudo one-time account creation code. then make the password randomly generated or something and delete it? also make it so bootstrap token duration cannot be changed. (maybe actually just make it create the account instead of an account creation code? more secure this way. with a randomly generated password that will be sent in terminal)
- [ ] Revoker user id for access tokens, same for query deletion and all other actions
- [ ] Preferences in user settings: Default browser settings values on new access token creation (when new access tokens created, use light theme, or use this date format, etc.)
- [ ] When 100% completely deleting users make sure we delete ALL data including permissions, so a newly created user with accidentally the same id won't be able to access that data. use db transactions to ensure this.
- [ ] all-permissions permission for specific scripts (like for root user)
- [ ] When account created by system, show system

Non-urgent polish an d UX:
- [ ] User settings advanced settings: "Unsaved" field when max access token value changed without clicking save (also don't forget to re-display if there was an error and it didn't go through)
- [ ] User settings advanced settings: Revert default token expiry value if there was an error and it didn't go through (or just refresh the page?)
- [ ] middleware redirects to an error page for errors instead of returning json
- [ ] Make the permissions tab in user management "add permission button" be aligned with the section below "use app", be on the same line as the section below the first category of permissions (so the categories arent mb-ed below it)
- [ ] https://www.youtube.com/watch?v=BhNSauna0eo
- [ ] https://www.youtube.com/watch?v=Ubbb1RK7iFs
- [ ] optimistic UI: https://www.youtube.com/watch?v=OWuMckXJ-9k
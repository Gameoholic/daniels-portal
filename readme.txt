
https://www.youtube.com/watch?v=mCmwqhvsyUg

Server actions under the hood are just API endpoints.
Server components only rendered on server.

Before running ANY queries ALWAYS check relevent permission, in addition to checking validity of token.
When running queries with parameters belonging to another user, always check the user ID matches the one of the operation.
(for example: UPDATE * from expesnes where userid=verifieduseridfromtoken and expenseid=providedexpenseid)


Still use server actions, but do all the checks in the db_queries right before running the query.


server action order:
- ensure "import server-only" for DAL and "use server" for server actions
- check permissions
- check whether arguments are valid
- call query/ies (make sure the query checks for authenticity between user and matched data)
- if returns non-void type, convert to minimized-data type


TODO:
eslint and taint for the servertypes or whatevert it's called
Check if there's a way to make sure we can't call the server queires directly, but only through executeServerQuery() through server actions.
CHECK.
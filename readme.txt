
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



In internal queries, don't pass servertypes as parameters. Pass parameters individually. ServerTypes are only to be used when returned from queries, aka, only when we know the object 100% exists. This is to prevent human mistakes, so we always know a ServerType is valid and was returned by server.

rename securedbscope to securedalscope // add comment this ensures only called in internal or dal
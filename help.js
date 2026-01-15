console.log(`
Portal Daniel - Available Commands

1. npm run help
   Shows this help message.

2. npm run bootstrap
   Creates a bootstrap admin account creation code, for when there are no users yet.
   Only use if there are no users or account creation codes yet.

3. npm run drop-tables
   Prompts for confirmation and then drops the following tables:
     ACCESS_TOKENS
     ACCOUNT_CREATION_CODES
     GYM_WEIGHTS
     USERS
     EXPENSES
     USER_PERMISSIONS
     Dangerous: irreversible.

4. npm run dev
   Starts the Next.js development server with Turbopack.

5. npm run build
   Builds the Next.js project for production (optimized build).

6. npm run start
   Starts the optimized production server for the built project.
`);

process.exit(0);

/**
 * CLI help script for DanielsPortal
 * Displays all available commands and usage information.
 */

function main(): void {
  console.log(`
Portal Daniel - Available Commands

1. npm run help
   Shows this help message.

2. npm run create-root-user
   Creates a bootstrap admin account creation code, for when there are no users or account creation codes yet.
   Only use this if there are no users in the database.

3. npm run drop-tables
   Prompts for confirmation and then drops the following tables:
     ACCESS_TOKENS
     ACCOUNT_CREATION_CODES
     GYM_WEIGHTS
     USERS
     EXPENSES
     USER_PERMISSIONS
   ⚠️ Dangerous: irreversible. Make sure you understand what you're doing.

4. npm run dev
   Starts the Next.js development server with Turbopack.

5. npm run build
   Builds the Next.js project for production (optimized build).

6. npm run start
   Starts the optimized production server for the built project.
`);

  process.exit(0);
}

// Run the script
void main();

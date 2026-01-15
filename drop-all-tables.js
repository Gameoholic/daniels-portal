const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" }); // Explicitly load .env.local

const { Client } = require("pg");
const readline = require("readline");

function askConfirmation(message) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(message, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASS;
  const database = process.env.DB_NAME;
  const port = process.env.DB_PORT
    ? parseInt(process.env.DB_PORT, 10)
    : undefined;

  if (!host || !user || !database || !port || !password) {
    console.error("Missing DB environment variables. Check .env.local");
    process.exit(1);
  }

  const client = new Client({ host, user, password, database, port });

  try {
    await client.connect();
    console.log("Connected to the database.");

    const answer = await askConfirmation(
      "This will DROP multiple tables! Type I_UNDERSTAND to continue: "
    );

    if (answer !== "I_UNDERSTAND") {
      console.log("Aborted. No tables were dropped.");
      process.exit(0);
    }

    const tables = [
      "ACCESS_TOKENS",
      "ACCOUNT_CREATION_CODES",
      "GYM_WEIGHTS",
      "USERS",
      "EXPENSES",
      "USER_PERMISSIONS",
    ];

    for (const table of tables) {
      console.log(`Dropping table ${table}...`);
      await client.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
    }

    console.log(
      "\nAll (specified in this file) tables were dropped successfully."
    );
  } catch (err) {
    console.error("Error dropping tables:", err.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

main();

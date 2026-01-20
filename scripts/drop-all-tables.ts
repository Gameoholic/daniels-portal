/**
 * This script drops multiple database tables after confirmation.
 * Only run if you really understand what you are doing.
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Client, ClientConfig } from "pg";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

// Function to ask for confirmation
async function askConfirmation(message: string): Promise<string> {
  const rl = readline.createInterface({ input, output });
  try {
    const answer = await rl.question(message);
    return answer;
  } finally {
    rl.close();
  }
}

async function main(): Promise<void> {
  // Load and validate DB environment variables
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASS;
  const database = process.env.DB_NAME;
  const port = Number(process.env.DB_PORT);

  if (!host || !user || !password || !database || !port || isNaN(port)) {
    console.error(
      "Missing or invalid DB environment variables. Check .env.local",
    );
    process.exit(1);
  }

  const clientConfig: ClientConfig = { host, user, password, database, port };
  const client = new Client(clientConfig);

  try {
    await client.connect();

    const answer = await askConfirmation(
      "⚠️ This will DROP multiple tables! Type I_UNDERSTAND to continue: ",
    );

    if (answer !== "I_UNDERSTAND") {
      console.log("Aborted. No tables were dropped.");
      process.exit(0);
    }

    const tables: string[] = [
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

    console.log("\n✅ All defined tables were dropped successfully.");
  } catch (err) {
    if (err instanceof Error) {
      console.error("Error dropping tables:", err.message);
    } else {
      console.error("Unknown error:", err);
    }
  } finally {
    await client.end();
    process.exit(0);
  }
}

void main();

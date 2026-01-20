/**
 * This script issues a system-generated account creation code with all permissions.
 * Only runs if the database has no users or account creation codes.
 * The code will expire in 5 minutes.
 */

import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Client, ClientConfig } from "pg";
import { v4 as uuidv4 } from "uuid";

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const EXPIRATION_MINUTES = 5;
const DEFAULT_TOKEN_EXPIRY_SECONDS = 3600;

function requireEnv(name: string): string {
  // todo remove this replace w something better
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function main(): Promise<void> {
  const rl = readline.createInterface({ input, output });

  try {
    // Load and validate env variables
    const dbConfig: ClientConfig = {
      host: requireEnv("DB_HOST"),
      user: requireEnv("DB_USER"),
      password: requireEnv("DB_PASS"),
      database: requireEnv("DB_NAME"),
      port: Number(requireEnv("DB_PORT")),
    };

    const codeLength = Number(requireEnv("ACCOUNT_CREATION_CODE_LENGTH"));
    if (Number.isNaN(codeLength) || codeLength <= 0) {
      throw new Error("ACCOUNT_CREATION_CODE_LENGTH must be a positive number");
    }

    const client = new Client(dbConfig);
    await client.connect();
    console.log("Connected to the database.");

    // Check if users or account creation codes exist
    const usersRes = await client.query<{ count: string }>(
      "SELECT COUNT(*) FROM users",
    );
    const codesRes = await client.query<{ count: string }>(
      "SELECT COUNT(*) FROM account_creation_codes",
    );

    const existingUsers = Number(usersRes.rows[0].count);
    const existingCodes = Number(codesRes.rows[0].count);

    if (existingUsers > 0 || existingCodes > 0) {
      throw new Error(
        "Users and/or account creation codes already exist. System root code issuance is forbidden.",
      );
    }

    console.log(
      "\n⚠️  You are about to issue a ROOT account creation code with the SUDO permission.",
    );
    console.log(
      "This will allow the creation of a fully privileged 'root' admin user.\n" +
        "The account is system-issued and will bypass all permission checks, thanks to the SUDO permission.\n",
    );

    const email: string = await rl.question(
      "Enter the email to be used for the account: ",
    );

    const id: string = uuidv4();

    // Generate random account creation code
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";

    for (let i = 0; i < codeLength; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    const now = new Date();
    const expiration = new Date(now.getTime() + EXPIRATION_MINUTES * 60 * 1000);

    await client.query(
      `
      INSERT INTO account_creation_codes (
        id,
        code,
        title,
        email,
        creation_timestamp,
        creator_type,
        creator_user_id,
        account_default_token_expiry_seconds,
        permission_ids,
        expiration_timestamp,
        revoked_timestamp,
        revoker_user_id,
        used_timestamp,
        on_used_email_creator
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `,
      [
        id,
        code,
        "", // title
        email,
        now,
        "system", // creator_type
        null,
        DEFAULT_TOKEN_EXPIRY_SECONDS,
        ["sudo"], // permission_ids
        expiration,
        null,
        null,
        null,
        false,
      ],
    );

    console.log("\n✅ System admin account creation code issued successfully.");
    console.log("\n✅ Code: " + code);

    console.log(
      `⚠️  You have ${EXPIRATION_MINUTES} minutes to use the code before it expires.`,
    );

    await client.end();
  } catch (err) {
    if (err instanceof Error) {
      console.error("Error:", err.message);
    } else {
      console.error("Unknown error:", err);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

void main();

// bootstrap-admin.js
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });
const pkg = require("pg");
const { v4: uuidv4 } = require("uuid");

const { Client } = pkg;

async function main() {
  // Load env variables
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASS;
  const database = process.env.DB_NAME;
  const port = process.env.DB_PORT
    ? parseInt(process.env.DB_PORT, 10)
    : undefined;
  const domain = process.env.DOMAIN;

  if (!host || !user || !database || !port || !password || !domain) {
    console.error("Missing DB environment variables. Check .env.local");
    process.exit(1);
  }

  const client = new Client({ host, user, password, database, port });

  try {
    await client.connect();
    console.log("Connected to the database.");

    // Check if users or account creation codes exist
    const usersRes = await client.query("SELECT COUNT(*) FROM users");
    const codesRes = await client.query(
      "SELECT COUNT(*) FROM account_creation_codes"
    );

    const existingUsers = parseInt(usersRes.rows[0].count, 10);
    const existingCodes = parseInt(codesRes.rows[0].count, 10);

    if (existingUsers > 0 || existingCodes > 0) {
      console.log(
        "Users and/or account creation codes already exist. Bootstrap admin user should not be created."
      );
      await client.end();
      process.exit(0);
    }

    // Create bootstrap admin account creation code
    const id = uuidv4();
    const email = "bootstrap_admin@" + domain;

    // Generate random 6-character code
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    await client.query(
      `
      INSERT INTO account_creation_codes (
        id,
        code,
        title,
        email,
        creation_timestamp,
        creator_user_id,
        account_default_token_expiry_seconds,
        permission_ids,
        expiration_timestamp,
        revoked_timestamp,
        revoker_user_id,
        used_timestamp,
        on_used_email_creator
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13);
      `,
      [
        id,
        code,
        "Bootstrap Admin",
        email,
        new Date(), // creation_timestamp
        "", // creator_user_id
        600, // 10 minutes
        ["use_app_admin", "app_admin:manage_account_creation_codes"], // permission_ids
        new Date(Date.now() + 5 * 60 * 1000), // expiration_timestamp (5 minutes from now)
        null, // revoked_timestamp
        null, // revoker_user_id
        null, // used_timestamp
        false, // on_used_email_creator
      ]
    );

    console.log(
      `\nBootstrap admin account creation code issued. Code: ${code}\nIt will expire 5 minutes from now.`
    );
    console.log("Please delete the user as soon as possible.");
  } catch (err) {
    console.error("Error issuing bootstrap admin creation code:", err.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

main();

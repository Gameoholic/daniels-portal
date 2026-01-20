import "server-only";
import { Pool, QueryResult, QueryResultRow, DatabaseError } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: Number(process.env.DB_PORT),
  max: 20,
  idleTimeoutMillis: 10000, // close idle clients after 10 seconds
  connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection couldn't be established
});

interface Database {
  query<T extends QueryResultRow = any>(
    text: string,
    params?: any[],
  ): Promise<QueryResult<T>>;
  getPool(): Pool;
  verifyConnection(): Promise<boolean>;
}

// Create the database object with all methods
const db: Database = {
  query: async <T extends QueryResultRow = any>(
    text: string,
    params?: any[],
  ): Promise<QueryResult<T>> => {
    return pool.query<T>(text, params);
  },
  getPool: (): Pool => {
    return pool;
  },
  verifyConnection: async (): Promise<boolean> => {
    try {
      const client = await pool.connect();
      client.release();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
};

async function verifyConnection(): Promise<void> {
  const result = await db.verifyConnection();
  console.log(
    result
      ? "Connected to the PostgreSQL database"
      : "Error connecting to the database.",
  );
}

const initDbTables = async (): Promise<void> => {
  console.log("Initializing database.");
  const createExpensesTableQuery = `
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL,
        title VARCHAR NOT NULL,
        description VARCHAR NOT NULL,
        category VARCHAR NOT NULL,
        amount INTEGER NOT NULL,
        payment_method VARCHAR NOT NULL,
        subscription_id UUID,
        reimbursement_expected_amount INTEGER NOT NULL,
        reimbursement_notes VARCHAR NOT NULL,
        reimbursement_income_ids UUID[] NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        deletion_timestamp TIMESTAMP,
        last_edited_timestamp TIMESTAMP,
        last_accessed_timestamp TIMESTAMP NOT NULL,
        creation_timestamp TIMESTAMP NOT NULL
      );
    `;

  const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        username VARCHAR NOT NULL UNIQUE,
        hashed_password VARCHAR NOT NULL,
        email VARCHAR NOT NULL UNIQUE,
        creation_timestamp TIMESTAMP NOT NULL,
        last_login_timestamp TIMESTAMP,
        default_token_expiry_seconds INTEGER NOT NULL,
        max_tokens_at_a_time INTEGER,
        deletion_timestamp TIMESTAMP
      );
    `;

  const createAccessTokensTableQuery = `
      CREATE TABLE IF NOT EXISTS access_tokens (
        token VARCHAR PRIMARY KEY,
        alias VARCHAR NOT NULL UNIQUE,
        user_id UUID NOT NULL,
        expiration_timestamp TIMESTAMP NOT NULL,
        creation_timestamp TIMESTAMP NOT NULL,
        last_use_timestamp TIMESTAMP NOT NULL,
        manually_revoked_timestamp TIMESTAMP,
        automatically_revoked_timestamp TIMESTAMP
      );
    `;

  const createAccountCreationCodesCreatorEnumQuery = `
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'creator_type_enum') THEN
        CREATE TYPE creator_type_enum AS ENUM ('user', 'system');
      END IF;
    END$$;
    `;

  const createAccountCreationCodesTableQuery = `
    CREATE TABLE IF NOT EXISTS account_creation_codes (
      id UUID PRIMARY KEY,
      code VARCHAR UNIQUE NOT NULL,
      title VARCHAR NOT NULL,
      email VARCHAR NOT NULL,
      creation_timestamp TIMESTAMP NOT NULL,
      creator_type creator_type_enum NOT NULL,
      creator_user_id UUID REFERENCES users(id) ON DELETE RESTRICT, 
      account_default_token_expiry_seconds INTEGER NOT NULL,
      permission_ids VARCHAR[] NOT NULL,
      expiration_timestamp TIMESTAMP NOT NULL,
      revoked_timestamp TIMESTAMP,
      revoker_user_id UUID,
      used_timestamp TIMESTAMP,
      used_on_user_id UUID,
      on_used_email_creator BOOLEAN NOT NULL,

      CONSTRAINT creator_consistency_check CHECK (
        (creator_type = 'user' AND creator_user_id IS NOT NULL)
        OR
        (creator_type = 'system' AND creator_user_id IS NULL)
      ),

      CONSTRAINT email_creator_only_for_user CHECK (
        on_used_email_creator = false OR creator_type = 'user'
      )
    );
    `;

  const createUserPermissionsTableQuery = `
      CREATE TABLE IF NOT EXISTS user_permissions (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        permission_name VARCHAR NOT NULL,
        PRIMARY KEY (user_id, permission_name)
      );
    `;

  const createTimeManagementActivitiesTableQuery = `
      CREATE TABLE IF NOT EXISTS time_management_activities (
          id UUID PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR NOT NULL,
          percentage INTEGER NOT NULL
      );
    `;

  const createTimeManagementActivitySessionsTableQuery = `
      CREATE TABLE IF NOT EXISTS time_management_activity_sessions (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        activity_id UUID NOT NULL REFERENCES time_management_activities(id) ON DELETE CASCADE,
        start_timestamp TIMESTAMP NOT NULL,
        end_timestamp TIMESTAMP
      );
    `;

  // weight can be XXX.XX
  const createGymWeightsTableQuery = `
      CREATE TABLE IF NOT EXISTS gym_weights (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL,
        timestamp TIMESTAMP,
        weight NUMERIC(5, 2) NOT NULL,
        deletion_timestamp TIMESTAMP,
        last_edited_timestamp TIMESTAMP,
        last_accessed_timestamp TIMESTAMP NOT NULL,
        creation_timestamp TIMESTAMP NOT NULL
      );
    `;

  try {
    await initDbTable(createExpensesTableQuery, "expenses");
    await initDbTable(createUsersTableQuery, "users");
    await initDbTable(createAccessTokensTableQuery, "access_tokens");
    await initDbTable(
      createAccountCreationCodesCreatorEnumQuery,
      "acccount_creation_codes_creator_enum",
    );
    await initDbTable(
      createAccountCreationCodesTableQuery,
      "account_creation_codes",
    );
    await initDbTable(createUserPermissionsTableQuery, "user_permissions");
    await initDbTable(createGymWeightsTableQuery, "gym_weights");
    await initDbTable(
      createTimeManagementActivitiesTableQuery,
      "time_management_activities",
    );
    await initDbTable(
      createTimeManagementActivitySessionsTableQuery,
      "time_management_activity_sessions",
    );
    console.log("Successfully initialized database.");
  } catch (err) {
    console.error("Error initializing database:", err);
    throw err;
  }
};

const initDbTable = async (
  createTableQuery: string,
  databaseName: string,
): Promise<void> => {
  try {
    await db.query(createTableQuery);
    console.log(`Database table initialized: ${databaseName} table is ready.`);
  } catch (err) {
    console.error(`Error initializing database table ${databaseName}: `, err);
    throw err;
  }
};

await verifyConnection();
await initDbTables();

export default db;

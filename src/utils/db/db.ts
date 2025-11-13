import "server-only";
import { Pool, QueryResult, QueryResultRow, DatabaseError } from "pg";
import { ServerDatabaseQueryResult } from "../server_types";

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
    params?: any[]
  ): Promise<QueryResult<T>>;
  getPool(): Pool;
  verifyConnection(): Promise<boolean>;
}

// Create the database object with all methods
const db: Database = {
  query: async <T extends QueryResultRow = any>(
    text: string,
    params?: any[]
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
      : "Error connecting to the database."
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
        deletion_timestamp TIMESTAMP
      );
    `;

  const createAccessTokensTableQuery = `
      CREATE TABLE IF NOT EXISTS access_tokens (
        token VARCHAR PRIMARY KEY,
        user_id UUID NOT NULL,
        expiration_timestamp TIMESTAMP NOT NULL,
        last_use_timestamp TIMESTAMP
      );
    `;

  const createAccountCreationCodesTableQuery = `
      CREATE TABLE IF NOT EXISTS account_creation_codes (
        code VARCHAR PRIMARY KEY,
        email VARCHAR NOT NULL UNIQUE,
        expiration_timestamp TIMESTAMP NOT NULL,
        used_timestamp DATE,
        deletion_timestamp TIMESTAMP
      );
    `;

  const createUserPermissionsTableQuery = `
      CREATE TABLE IF NOT EXISTS user_permissions (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        permission_name VARCHAR,
        PRIMARY KEY (user_id, permission_name)
      );
    `;

  // weight can be XXX.XX
  const createGymWeightTableQuery = `
      CREATE TABLE IF NOT EXISTS gym_weight (
        timestamp TIMESTAMP,
        user_id UUID NOT NULL,
        amount NUMERIC(5, 2) NOT NULL
      );
    `;

  try {
    await initDbTable(createExpensesTableQuery, "expenses");
    await initDbTable(createUsersTableQuery, "users");
    await initDbTable(createAccessTokensTableQuery, "access_tokens");
    await initDbTable(
      createAccountCreationCodesTableQuery,
      "account_creation_codes"
    );
    await initDbTable(createUserPermissionsTableQuery, "user_permissions");
    await initDbTable(createGymWeightTableQuery, "gym_weight");
    console.log("Successfully initialized database.");
  } catch (err) {
    console.error("Error initializing database:", err);
    throw err;
  }
};

const initDbTable = async (
  createTableQuery: string,
  databaseName: string
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

export async function executeDatabaseQuery<T>(
  queryMethod: () => Promise<T>,
  mappedErrorCodeMessages: Record<string, string> = {},
  unmappedErrorCodeMessage: string = "An unknown error has occurred.",
  unknownErrorMessage1: string = "An unknown error has occurred.",
  unknownErrorMessage2: string = "An unknown error has occurred."
): Promise<ServerDatabaseQueryResult<T>> {
  try {
    let result: T = await queryMethod();
    return { success: true, result: result };
  } catch (error: any) {
    // Identify error type
    let errorMessage: string;
    if (error instanceof DatabaseError && error.code) {
      const mappedMessage: string | null = mappedErrorCodeMessages[error.code];
      errorMessage = mappedMessage ?? unmappedErrorCodeMessage;
      if (!mappedMessage) {
        // This generally shouldn't happen so we log it
        console.error(
          "DB Query unhandled DatabaseError error:",
          error.code,
          error
        );
      }
    } else if (error instanceof Error) {
      // This should never happen
      console.error("DB Query unknown error:", error.message, error);
      errorMessage = unknownErrorMessage1;
    } else {
      // This should even more, never happen
      console.error("DB Query unknown error:", error);
      errorMessage = unknownErrorMessage2;
    }
    return { success: false, errorString: errorMessage };
  }
}

export default db;

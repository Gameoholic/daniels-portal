import "server-only";

import { QueryResult } from "pg";
import { DALScope } from "@/src/db/dal";
import db from "@/src/db/db";

export interface ServerUser {
  id: string;
  username: string;
  hashed_password: string;
  email: string;
  creation_timestamp: Date;
  last_login_timestamp: Date | null;
  default_token_expiry_seconds: number;
  max_tokens_at_a_time: number | null;
  deletion_timestamp: Date | null;
}

/**
 * An authenticated query that updates the default_token_expiry_seconds field of a user.
 *
 * @throws Error If the database query fails.
 * @throws Error if the user doesn't exist.
 */
export async function updateDefaultTokenExpiry(
  _scope: DALScope,
  userId: string,
  expirySeconds: number
): Promise<void> {
  try {
    const result = await db.query(
      "UPDATE users SET default_token_expiry_seconds = $1 WHERE id = $2",
      [expirySeconds, userId]
    );
    if (result.rowCount == 0) {
      throw Error("User doesn't exist.");
    }
  } catch (error) {
    throw error;
  }
}

/**
 * An authenticated query that updates the max_tokesn_at_a_time field of a user.
 *
 * @throws Error If the database query fails.
 * @throws Error if the user doesn't exist.
 */
export async function updateMaxTokensAtATime(
  _scope: DALScope,
  userId: string,
  max: number | null
): Promise<void> {
  try {
    const result = await db.query(
      "UPDATE users SET max_tokens_at_a_time = $1 WHERE id = $2",
      [max, userId]
    );
    if (result.rowCount == 0) {
      throw Error("User doesn't exist.");
    }
  } catch (error) {
    throw error;
  }
}

/**
 * An authenticated query that gets the user.
 *
 * @throws Error If the database query fails.
 * @returns null if the user doesn't exist.
 */
export async function getUser(
  _scope: DALScope,
  userId: string
): Promise<ServerUser | null> {
  try {
    const result: QueryResult<ServerUser> = await db.query<ServerUser>(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );
    if (result.rows.length == 0) {
      return null;
    }
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

/**
 * An authenticated query that gets all users.
 *
 * @throws Error If the database query fails.
 */
export async function getAllUsers(_scope: DALScope): Promise<ServerUser[]> {
  try {
    const result: QueryResult<ServerUser> = await db.query<ServerUser>(
      "SELECT * FROM users"
    );
    return result.rows;
  } catch (error) {
    throw error;
  }
}

/**
 * An authenticated query that updates a user's last_login_timestamp field to now.
 *
 * @throws Error If the database query fails.
 * @throws Error if the user doesn't exist.
 */
export async function updateUserLastLoginTimestamp(
  _scope: DALScope,
  userId: string
): Promise<void> {
  try {
    const result = await db.query(
      "UPDATE users SET last_login_timestamp = $1 WHERE id = $2",
      [new Date(), userId]
    );
    if (result.rowCount == 0) {
      throw Error("User doesn't exist.");
    }
  } catch (error) {
    throw error;
  }
}

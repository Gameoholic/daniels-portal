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
 * Updates the default_token_expiry_seconds field of a user.
 *
 * Besides permissions, no further checks are required.
 */
export async function updateDefaultTokenExpiry(
  _scope: DALScope,
  requesterUserId: string,
  expirySeconds: number
): Promise<void> {
  try {
    const result = await db.query(
      "UPDATE users SET default_token_expiry_seconds = $1 WHERE id = $2",
      [expirySeconds, requesterUserId]
    );
    if (result.rowCount == 0) {
      throw Error("User doesn't exist.");
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Updates the max_tokens_at_a_time field of a user.
 *
 * Besides permissions, no further checks are required.
 */
export async function updateMaxTokensAtATime(
  _scope: DALScope,
  requesterUserId: string,
  max: number | null
): Promise<void> {
  try {
    const result = await db.query(
      "UPDATE users SET max_tokens_at_a_time = $1 WHERE id = $2",
      [max, requesterUserId]
    );
    if (result.rowCount == 0) {
      throw Error("User doesn't exist.");
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Returns the user if it exists.
 * @param userId Optional: If null, will use the requester user ID.
 */
export async function getUser(
  _scope: DALScope,
  requesterUserId: string,
  userId?: string
): Promise<ServerUser> {
  try {
    const result: QueryResult<ServerUser> = await db.query<ServerUser>(
      "SELECT * FROM users WHERE id = $1",
      [userId ?? requesterUserId]
    );
    if (result.rows.length == 0) {
      throw Error("User doesn't exist.");
    }
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

export async function updateUserLastLoginTimestamp(
  _scope: DALScope,
  requesterUserId: string
): Promise<void> {
  try {
    const result = await db.query(
      "UPDATE users SET last_login_timestamp = $1 WHERE id = $2",
      [new Date(), requesterUserId]
    );
    if (result.rowCount == 0) {
      throw Error("User doesn't exist.");
    }
  } catch (error) {
    throw error;
  }
}

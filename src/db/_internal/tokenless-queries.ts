import { QueryResult } from "pg";
import { SecureDBScope } from "../dal";
import {
  ServerAccessToken,
  ServerAccountCreationCode,
  ServerPermission,
  ServerUser,
} from "./server_types";
import db from "../db";

/**
 * Returns all access tokens for user, regardless of whether the token is revoked or expired
 * Throws error if no tokens exist for this user.
 */
export async function tokenless_getUserAccessTokens(
  _scope: SecureDBScope,
  userId: string
): Promise<ServerAccessToken[]> {
  try {
    const result: QueryResult<ServerAccessToken> =
      await db.query<ServerAccessToken>(
        "SELECT * FROM ACCESS_TOKENS WHERE user_id = $1",
        [userId]
      );
    if (result.rows.length == 0) {
      throw Error("No tokens exist for this user.");
    }
    return result.rows;
  } catch (error) {
    throw error;
  }
}

/**
 * Updates the automatically_revoked_timestamp field of an access token.
 */
export async function tokenless_updateAccessTokenAutomaticallyRevokedTimestamp(
  _scope: SecureDBScope,
  userId: string,
  token: string
) {
  try {
    const result = await db.query(
      `UPDATE access_tokens SET automatically_revoked_timestamp = $1 WHERE token = $2 AND user_id = $3;`,
      [new Date(), token, userId]
    );
    if (result.rowCount == 0) {
      throw Error("Token not found.");
    }
  } catch (error) {
    throw error;
  }
}

/**
 * UserID-less function. CAN BE USED WITHOUT ACCESS TOKEN.
 * Returns the user if it exists.
 * @param username The username of the user.
 */
export async function tokenless_getUserByUsername(
  _scope: SecureDBScope,
  username: string
): Promise<ServerUser> {
  try {
    const result: QueryResult<ServerUser> = await db.query<ServerUser>(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (result.rows.length == 0) {
      throw Error("User doesn't exist.");
    }
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

// UserID-less function. CAN BE USED WITHOUT ACCESS TOKEN.
export async function tokenless_getUserPermissions(
  _scope: SecureDBScope,
  userId: string
): Promise<ServerPermission[]> {
  try {
    const result: QueryResult<ServerPermission> =
      await db.query<ServerPermission>(
        `
        SELECT * FROM user_permissions WHERE user_id = $1
      `,
        [userId]
      );
    return result.rows;
  } catch (error) {
    throw error;
  }
}

export async function tokenless_getAccountCreationCode(
  _scope: SecureDBScope,
  code: string
): Promise<ServerAccountCreationCode> {
  try {
    const result: QueryResult<ServerAccountCreationCode> =
      await db.query<ServerAccountCreationCode>(
        "SELECT * FROM account_creation_codes WHERE code = $1",
        [code]
      );

    if (result.rowCount == 0) {
      throw Error("Account creation code does not exist.");
    }
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

export async function tokenless_setAccountCreationCodeUsed(
  _scope: SecureDBScope,
  code: string
): Promise<void> {
  try {
    const result = await db.query(
      "UPDATE account_creation_codes SET used_timestamp = $1 WHERE code = $2",
      [new Date(), code]
    );
    if (result.rowCount == 0) {
      throw Error("Account creation code doesn't exist.");
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Will automatically set creation timestamp to now. Will set last login timestamp to null.
 */
export async function addUser(
  _scope: SecureDBScope,
  userId: string,
  username: string,
  email: string,
  hashedPassword: string,
  defaultTokenExpirySeconds: number,
  maxTokensAtATime: number | null
) {
  try {
    const now = new Date();
    await db.query(
      `INSERT INTO users (
        id,
        username,
        email,
        hashed_password,
        creation_timestamp,
        last_login_timestamp,
        default_token_expiry_seconds,
        max_tokens_at_a_time,
        deletion_timestamp
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      );`,
      [
        userId,
        username,
        email,
        hashedPassword,
        now,
        null,
        defaultTokenExpirySeconds,
        maxTokensAtATime,
        null,
      ]
    );
  } catch (error) {
    throw error;
  }
}

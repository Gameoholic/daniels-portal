import "server-only";

import type {
  ServerAccessToken,
  ServerAccountCreationCode,
  ServerUser,
  ServerPermission,
} from "@/src/utils/server_types";
import { QueryResult } from "pg";
import db from "@/src/utils/db/db";

export async function getUserByUsername(username: string): Promise<ServerUser> {
  try {
    const result: QueryResult<ServerUser> = await db.query<ServerUser>(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (result.rows.length == 0) {
      throw Error("Username does not exist.");
    }
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

export async function getAllUsers(): Promise<ServerUser[]> {
  try {
    const result: QueryResult<ServerUser> = await db.query<ServerUser>(
      "SELECT * FROM users"
    );
    return result.rows;
  } catch (error) {
    throw error;
  }
}

export async function getUserById(id: string): Promise<ServerUser> {
  try {
    const result: QueryResult<ServerUser> = await db.query<ServerUser>(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );

    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

export async function createAccessToken(
  token: string,
  userId: string,
  expirationTimestamp: Date,
  lastUseTimestamp: Date | null,
  creationTimestamp: Date
) {
  try {
    await db.query(
      `INSERT INTO access_tokens (
        token,
        user_id,
        expiration_timestamp,
        last_use_timestamp,
        creation_timestamp
      )
      VALUES (
        $1, $2, $3, $4, $5
      );`,
      [token, userId, expirationTimestamp, lastUseTimestamp, creationTimestamp]
    );
  } catch (error) {
    throw error;
  }
}

export async function getAccessToken(
  token: string
): Promise<ServerAccessToken> {
  try {
    const result: QueryResult<ServerAccessToken> =
      await db.query<ServerAccessToken>(
        "SELECT * FROM ACCESS_TOKENS WHERE token = $1",
        [token]
      );
    if (result.rows.length == 0) {
      throw Error("Token does not exist.");
    }
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

export async function getUserAccessTokens(
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

export async function updateAccessTokenManuallyRevokedTimestamp(token: string) {
  try {
    await db.query(
      `UPDATE access_tokens SET manually_revoked_timestamp = $1 WHERE token = $2;`,
      [new Date(), token]
    );
  } catch (error) {
    throw error;
  }
}

export async function updateAccessTokenAutomaticallyRevokedTimestamp(
  token: string
) {
  try {
    await db.query(
      `UPDATE access_tokens SET automatically_revoked_timestamp = $1 WHERE token = $2;`,
      [new Date(), token]
    );
  } catch (error) {
    throw error;
  }
}

export async function createUser(user: ServerUser) {
  try {
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
        user.id,
        user.username,
        user.email,
        user.hashed_password,
        user.creation_timestamp,
        user.last_login_timestamp,
        user.default_token_expiry_seconds,
        user.max_tokens_at_a_time,
        user.deletion_timestamp,
      ]
    );
  } catch (error) {
    throw error;
  }
}

export async function getAccountCreationCode(
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

export async function updateUserLastLoginTimestamp(
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

export async function updateDefaultTokenExpiry(
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

export async function updateMaxTokensAtATime(
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

export async function updateAccessTokenLastUseTimestamp(
  token: string
): Promise<void> {
  try {
    const result = await db.query(
      "UPDATE access_tokens SET last_use_timestamp = $1 WHERE token = $2",
      [new Date(), token]
    );
    if (result.rowCount == 0) {
      throw Error("Token doesn't exist.");
    }
  } catch (error) {
    throw error;
  }
}

export async function setAccountCreationCodeUsed(code: string): Promise<void> {
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

export async function getUserPermissions(
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

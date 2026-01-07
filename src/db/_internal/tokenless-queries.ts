import { QueryResult } from "pg";
import { DALScope, DALTokenlessQueryScope } from "../dal";
import db from "../db";
import { ServerAccessToken } from "@/src/db/_internal/per-table/access-tokens";
import { ServerUser } from "@/src/db/_internal/per-table/users";
import {
  assertIsPermission,
  DBPermissionRow,
  ServerPermission,
} from "@/src/db/_internal/per-table/permissions";
import { ServerAccountCreationCode } from "@/src/db/_internal/per-table/account-creation-codes";

/**
 * A tokenless query that returns all access tokens of a user, regardless of whether the token is revoked or expired.
 *
 * @throws Error If the database query fails.
 */
export async function tokenless_getUserAccessTokens(
  _scope: DALTokenlessQueryScope,
  userId: string
): Promise<ServerAccessToken[]> {
  try {
    const result: QueryResult<ServerAccessToken> =
      await db.query<ServerAccessToken>(
        "SELECT * FROM ACCESS_TOKENS WHERE user_id = $1",
        [userId]
      );
    return result.rows;
  } catch (error) {
    throw error;
  }
}

/**
 * A tokenless query that updates the automatically_revoked_timestamp field of a token.
 *
 * @throws Error If the database query fails.
 */
export async function tokenless_updateAccessTokenAutomaticallyRevokedTimestamp(
  _scope: DALTokenlessQueryScope,
  token: string
) {
  try {
    const result = await db.query(
      `UPDATE access_tokens SET automatically_revoked_timestamp = $1 WHERE token = $2;`,
      [new Date(), token]
    );
    if (result.rowCount == 0) {
      throw Error("Token not found.");
    }
  } catch (error) {
    throw error;
  }
}

/**
 * A tokenless query that gets a user via its username.
 *
 * @throws Error If the database query fails.
 * @returns null if the user doesn't exist.
 */
export async function tokenless_getUserByUsername(
  _scope: DALTokenlessQueryScope,
  username: string
): Promise<ServerUser | null> {
  try {
    const result: QueryResult<ServerUser> = await db.query<ServerUser>(
      "SELECT * FROM users WHERE username = $1",
      [username]
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
 * A tokenless query that gets a user's permissions.
 *
 * @throws Error If the database query fails.
 */
export async function tokenless_getUserPermissions(
  _scope: DALTokenlessQueryScope,
  userId: string
): Promise<ServerPermission[]> {
  try {
    const result: QueryResult<DBPermissionRow> =
      await db.query<DBPermissionRow>(
        `SELECT * FROM user_permissions WHERE user_id = $1`,
        [userId]
      );
    return result.rows
      .map((row) => {
        const permission = assertIsPermission(row.permission_name);
        if (!permission) return null;
        return {
          user_id: row.user_id,
          permission,
        };
      })
      .filter((x): x is ServerPermission => x !== null);
  } catch (error) {
    throw error;
  }
}

/**
 * A tokenless query that gets an account creation code, even if it's deleted, expired or used.
 *
 * @throws Error If the database query fails.
 * @throws Error If account creation code doesn't exist.
 */
export async function tokenless_getAccountCreationCode(
  _scope: DALTokenlessQueryScope,
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

/**
 * A tokenless query that sets the used_timestamp of an account creation code to now.
 *
 * @throws Error If the database query fails.
 * @throws Error If account creation code doesn't exist.
 */
export async function tokenless_setAccountCreationCodeUsed(
  _scope: DALTokenlessQueryScope,
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
 * A tokenless query that adds a user. The creation timestamp is set to now, and last login timestamp set to null.
 *
 * @throws Error If the database query fails.
 */
export async function addUser(
  _scope: DALTokenlessQueryScope,
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

/**
 * A tokenless query that gets an access token. Returns even if revoked or expired.
 *
 * @throws Error If the database query fails.
 * @throws Error If the token doesn't exist.
 */

export async function getAccessToken(
  _scope: DALTokenlessQueryScope,
  token: string
): Promise<ServerAccessToken> {
  try {
    const result: QueryResult<ServerAccessToken> =
      await db.query<ServerAccessToken>(
        "SELECT * FROM ACCESS_TOKENS WHERE token = $1",
        [token]
      );
    if (result.rows.length == 0) {
      throw Error("No token exist.");
    }
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

export type AccessTokenValidationResult =
  | { valid: true }
  | { valid: false; reason: AccessTokenInvalidReason };

export enum AccessTokenInvalidReason {
  EXPIRED,
  MANUALLY_REVOKED,
  AUTOMATICALLY_REVOKED,
}

export function isAccessTokenValid(
  token: ServerAccessToken
): AccessTokenValidationResult {
  if (token.manually_revoked_timestamp) {
    return {
      valid: false,
      reason: AccessTokenInvalidReason.MANUALLY_REVOKED,
    };
  }

  if (token.automatically_revoked_timestamp) {
    return {
      valid: false,
      reason: AccessTokenInvalidReason.AUTOMATICALLY_REVOKED,
    };
  }

  if (token.expiration_timestamp <= new Date()) {
    return {
      valid: false,
      reason: AccessTokenInvalidReason.EXPIRED,
    };
  }

  return { valid: true };
}

/**
 * A tokenless query that adds an access token. Last use and creation timestamp will be set to now.
 *
 * @throws Error If the database query fails.
 */
export async function addAccessToken(
  _scope: DALTokenlessQueryScope,
  token: string,
  alias: string,
  userId: string,
  expirationTimestamp: Date
) {
  try {
    const now = new Date();
    const result = await db.query(
      `INSERT INTO access_tokens (
        token,
        alias,
        user_id,
        expiration_timestamp,
        last_use_timestamp,
        creation_timestamp
      )
      VALUES (
        $1, $2, $3, $4, $5, $6
      );`,
      [token, alias, userId, expirationTimestamp, now, now]
    );
    if (result.rowCount == 0) {
      // todo: for all the insert into, is this actually useful? should we include this check? currently we only have this check  here.
      throw Error("Couldn't insert token.");
    }
  } catch (error) {
    throw error;
  }
}

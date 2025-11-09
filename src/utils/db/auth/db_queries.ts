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
  lastUseTimestamp: Date | null
) {
  try {
    await db.query(
      `INSERT INTO access_tokens (
        token,
        user_id,
        expiration_timestamp,
        last_use_timestamp
      )
      VALUES (
        $1, $2, $3, $4
      );`,
      [token, userId, expirationTimestamp, lastUseTimestamp]
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

export async function deleteAccessToken(token: string) {
  try {
    await db.query(`DELETE FROM access_tokens WHERE token = $1;`, [token]);
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
        deletion_timestamp
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7
      );`,
      [
        user.id,
        user.username,
        user.email,
        user.hashed_password,
        user.creation_timestamp,
        user.last_login_timestamp,
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
      await db.query<ServerPermission>( // I don't really get this query entirely...
        `
        SELECT 
          user_permissions.permission_name AS name, 
          permissions.description
        FROM user_permissions
        JOIN permissions 
          ON permissions.name = user_permissions.permission_name
        WHERE user_permissions.user_id = $1
      `,
        [userId]
      );
    return result.rows;
  } catch (error) {
    throw error;
  }
}

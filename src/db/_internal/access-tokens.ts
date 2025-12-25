import "server-only";

import { QueryResult } from "pg";
import { ServerAccessToken } from "./server_types";
import db from "../db";
import { SecureDBScope } from "../dal";

export async function getAccessToken(
  _scope: SecureDBScope,
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

/**
 * Returns all access tokens for user, regardless of whether the token is revoked or expired
 * Throws error if no tokens exist for this user.
 *
 * Besides permissions, no further authentication checks are required.
 * No further arguments, so no need to check validity of arguments.
 */
export async function getUserAccessTokens(
  _scope: SecureDBScope,
  requesterUserId: string
): Promise<ServerAccessToken[]> {
  try {
    const result: QueryResult<ServerAccessToken> =
      await db.query<ServerAccessToken>(
        "SELECT * FROM ACCESS_TOKENS WHERE user_id = $1",
        [requesterUserId]
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
 * Updates the manually_revoked_timestamp field of an access token.
 *
 * Will only update the access token if its owner is the requester user ID.
 * Besides permissions, no further checks are required.
 */
export async function updateAccessTokenManuallyRevokedTimestamp(
  _scope: SecureDBScope,
  requesterUserId: string,
  token: string
) {
  try {
    const result = await db.query(
      `UPDATE access_tokens SET manually_revoked_timestamp = $1 WHERE token = $2 AND user_id = $3;`,
      [new Date(), token, requesterUserId]
    );
    if (result.rowCount == 0) {
      throw Error("Token not found.");
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Updates the automatically_revoked_timestamp field of an access token.
 *
 * Will only update the access token if its owner is the requester user ID.
 * Besides permissions, no further checks are required.
 */
export async function updateAccessTokenAutomaticallyRevokedTimestamp(
  _scope: SecureDBScope,
  requesterUserId: string,
  token: string
) {
  try {
    const result = await db.query(
      `UPDATE access_tokens SET automatically_revoked_timestamp = $1 WHERE token = $2 AND user_id = $3;`,
      [new Date(), token, requesterUserId]
    );
    if (result.rowCount == 0) {
      throw Error("Token not found.");
    }
  } catch (error) {
    throw error;
  }
}

//todo: move the userid-less functions to their own .ts file?

/**
 * UserID-less function. CAN BE USED WITHOUT ACCESS TOKEN.
 * Adds a new access token.
 * Last use and creation timestamps will be set to now.
 */
export async function addAccessToken(
  _scope: SecureDBScope,
  token: string,
  userId: string,
  expirationTimestamp: Date
) {
  try {
    const now = new Date();
    const result = await db.query(
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
      [token, userId, expirationTimestamp, now, now]
    );
    if (result.rowCount == 0) {
      // todo: for all the insert into, is this actually useful? should we include this check? currently we only have this check  here.
      throw Error("Token not found.");
    }
  } catch (error) {
    throw error;
  }
}

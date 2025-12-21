import "server-only";

// file 1 (internal stuff) - assumes userid is authentic and belongs to requester. does not check permissions. some functions may check requester user id.

import { QueryResult } from "pg";
import { ServerAccessToken } from "../../utils/server_types";
import db from "../../utils/db/db";
import { SecureDBScope } from "../dal";

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

/**
 * Updates the default_token_expiry_seconds field of a user.
 *
 * Besides permissions, no further checks are required.
 */
export async function updateDefaultTokenExpiry(
  _scope: SecureDBScope,
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
  _scope: SecureDBScope,
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

import { QueryResult } from "pg";
import { DALScope } from "@/src/db/dal";
import db from "@/src/db/db";

export interface ServerAccessToken {
  token: string;
  user_id: string;
  creation_timestamp: Date;
  expiration_timestamp: Date;
  last_use_timestamp: Date | null;
  manually_revoked_timestamp: Date | null;
  automatically_revoked_timestamp: Date | null;
}

/**
 * Returns all access tokens associated with a user.
 * This includes tokens that are expired or revoked.
 *
 * The query is performed with the provided `userId`, or with the requester user ID if `userId` is not specified.
 * @param userId Optional target user ID whose tokens should be returned.
 * @throws Error If no access tokens exist for the target user.
 * @throws Error If the database query fails.
 */
export async function getUserAccessTokens(
  _scope: DALScope,
  requesterUserId: string,
  userId?: string
): Promise<ServerAccessToken[]> {
  try {
    const result: QueryResult<ServerAccessToken> =
      await db.query<ServerAccessToken>(
        "SELECT * FROM ACCESS_TOKENS WHERE user_id = $1",
        [userId ?? requesterUserId]
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
  _scope: DALScope,
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
  _scope: DALScope,
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
  _scope: DALScope,
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

import { QueryResult } from "pg";
import { DALScope } from "@/src/db/dal";
import db from "@/src/db/db";

export interface ServerAccessToken {
  token: string;
  alias: string;
  user_id: string;
  creation_timestamp: Date;
  expiration_timestamp: Date;
  last_use_timestamp: Date | null;
  manually_revoked_timestamp: Date | null;
  automatically_revoked_timestamp: Date | null;
}

/**
 * An authenticated query that returns all access tokens associated with the provided user ID.
 * This includes tokens that are expired or revoked.
 *
 * @throws Error If the database query fails.
 */
export async function getUserAccessTokens(
  _scope: DALScope,
  userId: string
): Promise<ServerAccessToken[]> {
  const result: QueryResult<ServerAccessToken> =
    await db.query<ServerAccessToken>(
      "SELECT * FROM ACCESS_TOKENS WHERE user_id = $1",
      [userId]
    );
  return result.rows;
}

/**
 * An authenticated query that updates the manually_revoked_timestamp field of an access token to now.
 * Only updates it as long as the token is valid and not expired/revoked, otherwise treats it as if token doesn't exist.
 *
 * @throws Error If the access token doesn't exist.
 * @throws Error If the database query fails.
 */
export async function updateAccessTokenManuallyRevokedTimestamp(
  _scope: DALScope,
  token: string
) {
  const now = new Date();
  const result = await db.query(
    `UPDATE access_tokens SET manually_revoked_timestamp = $1 WHERE token = $2 AND expiration_timestamp > $1 AND manually_revoked_timestamp IS NULL AND automatically_revoked_timestamp IS NULL;`,
    [now, token]
  );
  if (result.rowCount == 0) {
    throw Error("Token not found.");
  }
}

/**
 * An authenticated query that updates the manually_revoked_timestamp field of an access token by alias, to now.
 * Only updates it as long as the token is valid and not expired/revoked, otherwise treats it as if token doesn't exist.
 *
 * @throws Error If the access token doesn't exist.
 * @throws Error If the database query fails.
 */
export async function updateAccessTokenManuallyRevokedTimestampByAlias(
  _scope: DALScope,
  tokenAlias: string
) {
  const now = new Date();
  const result = await db.query(
    `UPDATE access_tokens SET manually_revoked_timestamp = $1 WHERE alias = $2 AND expiration_timestamp > $1 AND manually_revoked_timestamp IS NULL AND automatically_revoked_timestamp IS NULL;`,
    [now, tokenAlias]
  );
  if (result.rowCount == 0) {
    throw Error("Token not found.");
  }
}

/**
 * An authenticated query that updates the automatically_revoked_timestamp field of an access token to now.
 * Only updates it as long as the token is valid and not expired/revoked, otherwise treats it as if token doesn't exist.
 *
 * @throws Error If the access token doesn't exist.
 * @throws Error If the database query fails.
 */
export async function updateAccessTokenAutomaticallyRevokedTimestamp(
  _scope: DALScope,
  token: string
) {
  const now = new Date();
  const result = await db.query(
    `UPDATE access_tokens SET automatically_revoked_timestamp = $1 WHERE token = $2 AND expiration_timestamp > $1 AND manually_revoked_timestamp IS NULL AND automatically_revoked_timestamp IS NULL;`,
    [now, token]
  );
  if (result.rowCount == 0) {
    throw Error("Token not found.");
  }
}

/**
 * An authenticated query that gets an access token. Returns even if revoked or expired.
 *
 * @throws Error If the database query fails.
 * @returns null if the access token doesn't exist.
 */

export async function getAccessToken(
  _scope: DALScope,
  token: string
): Promise<ServerAccessToken | null> {
  const result: QueryResult<ServerAccessToken> =
    await db.query<ServerAccessToken>(
      "SELECT * FROM ACCESS_TOKENS WHERE token = $1",
      [token]
    );
  if (result.rows.length == 0) {
    return null;
  }
  return result.rows[0];
}

/**
 * An authenticated query that gets an access token belonging to a user. Returns even if revoked or expired.
 *
 * @throws Error If the database query fails.
 * @returns null if the access token doesn't exist for this user.
 */

export async function getAccessTokenBelongingToUser(
  _scope: DALScope,
  token: string,
  userId: string
): Promise<ServerAccessToken | null> {
  const result: QueryResult<ServerAccessToken> =
    await db.query<ServerAccessToken>(
      "SELECT * FROM ACCESS_TOKENS WHERE token = $1 AND user_id = $2",
      [token, userId]
    );
  if (result.rows.length == 0) {
    return null;
  }
  return result.rows[0];
}

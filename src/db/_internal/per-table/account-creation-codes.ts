import { DALScope } from "@/src/db/dal";
import db from "@/src/db/db";
import { QueryResult } from "pg";

export interface ServerAccountCreationCode {
  code: string;
  email: string;
  creation_timestamp: Date;
  creator_user_id: string;
  account_default_token_expiry_seconds: number;
  permission_ids: string[];
  expiration_timestamp: Date;
  revoked_timestamp: Date | null;
  revoker_user_id: string | null;
  used_timestamp: Date | null;
  deletion_timestamp: Date | null;
}

/**
 * An authenticated query that gets all account creation codes, even deleted, revoked and expired ones.
 *
 * @throws Error If the database query fails.
 */
export async function getAllAccountCreationCodes(
  _scope: DALScope
): Promise<ServerAccountCreationCode[]> {
  try {
    const result: QueryResult<ServerAccountCreationCode> =
      await db.query<ServerAccountCreationCode>(
        "SELECT * FROM account_creation_codes"
      );
    return result.rows;
  } catch (error) {
    throw error;
  }
}

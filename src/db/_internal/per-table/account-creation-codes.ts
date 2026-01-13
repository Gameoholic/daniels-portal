import { Permission } from "@/src/db/_internal/per-table/permissions";
import { DALScope } from "@/src/db/dal";
import db from "@/src/db/db";
import { Titillium_Web } from "next/font/google";
import { QueryResult } from "pg";

export type AccountCreationCodeValidationResult =
  | { valid: true }
  | { valid: false; reason: AccountCreationCodeInvalidReason };

export enum AccountCreationCodeInvalidReason {
  EXPIRED,
  USED,
  REVOKED,
}

export function isAccountCreationCodeValid(
  code: ServerAccountCreationCode
): AccountCreationCodeValidationResult {
  if (code.revoked_timestamp) {
    return {
      valid: false,
      reason: AccountCreationCodeInvalidReason.REVOKED,
    };
  }

  if (code.used_timestamp) {
    return {
      valid: false,
      reason: AccountCreationCodeInvalidReason.USED,
    };
  }

  if (code.expiration_timestamp <= new Date()) {
    return {
      valid: false,
      reason: AccountCreationCodeInvalidReason.EXPIRED,
    };
  }

  return { valid: true };
}

export interface ServerAccountCreationCode {
  id: string;
  code: string;
  title: string;
  email: string;
  creation_timestamp: Date;
  creator_user_id: string;
  account_default_token_expiry_seconds: number;
  permission_ids: string[];
  expiration_timestamp: Date;
  revoked_timestamp: Date | null;
  revoker_user_id: string | null;
  used_timestamp: Date | null;
  used_on_user_id: string | null;
  on_used_email_creator: boolean;
}

/**
 * An authenticated query that gets an account creation code, even if it's deleted, expired or used.
 *
 * @throws Error If the database query fails.
 * @throws Error If account creation code doesn't exist.
 */
export async function getAccountCreationCode(
  _scope: DALScope,
  id: string
): Promise<ServerAccountCreationCode> {
  try {
    const result: QueryResult<ServerAccountCreationCode> =
      await db.query<ServerAccountCreationCode>(
        "SELECT * FROM account_creation_codes WHERE id = $1",
        [id]
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

/**
 * An authenticated query that creates a new account creation code. Sets creation timestamp to now.
 *
 * @throws Error If the database query fails.
 */
export async function createAccountCreationCode(
  _scope: DALScope,
  id: string,
  code: string,
  title: string,
  email: string,
  creatorUserId: string,
  accountDefaultTokenExpirySeconds: number,
  permissionIds: string[],
  expirationTimestamp: Date,
  onUsedEmailCreator: boolean
): Promise<void> {
  try {
    const now = new Date();
    const result = await db.query(
      `
      INSERT INTO account_creation_codes (
        id,
        code,
        title,
        email,
        creation_timestamp,
        creator_user_id,
        account_default_token_expiry_seconds,
        permission_ids,
        expiration_timestamp,
        revoked_timestamp,
        revoker_user_id,
        used_timestamp,
        on_used_email_creator
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      );
      `,
      [
        id,
        code,
        title,
        email,
        now, // creation_timestamp
        creatorUserId,
        accountDefaultTokenExpirySeconds,
        permissionIds,
        expirationTimestamp,
        null, // revoked_timestamp
        null, // revoker_user_id
        null, // used_timestamp
        onUsedEmailCreator,
      ]
    );

    if (result.rowCount === 0) {
      throw new Error("Couldn't insert account creation code.");
    }
  } catch (error) {
    throw error;
  }
}

/**
 * An authenticated query that updates the revoked_timestamp field of an access token to now and revoker_user_id.
 * Only updates it as long as the code is valid and not expired/revoked, otherwise treats it as if code doesn't exist.
 *
 * @throws Error If the account creation code doesn't exist.
 * @throws Error If the database query fails.
 */
export async function revokeAccountCreationCode(
  _scope: DALScope,
  id: string,
  revokerUserId: string
) {
  try {
    const now = new Date();
    const result = await db.query(
      `UPDATE account_creation_codes SET revoked_timestamp = $1, revoker_user_id = $2 WHERE id = $3 AND expiration_timestamp > $1 AND revoked_timestamp IS NULL AND used_timestamp IS NULL;`,
      [now, revokerUserId, id]
    );
    if (result.rowCount == 0) {
      throw Error("Code not found.");
    }
  } catch (error) {
    throw error;
  }
}

/**
 * An authenticated query that removes a permission from an account creation code.
 * Only updates it as long as the code is valid and not expired/revoked, otherwise treats it as if code doesn't exist.
 *
 * @throws Error If the database query fails.
 */
export async function removePermissionFromAccountCreationCode(
  _scope: DALScope,
  id: string,
  permission: Permission
) {
  try {
    const now = new Date();
    const result = await db.query(
      `UPDATE account_creation_codes
       SET permission_ids = array_remove(permission_ids, $1)
       WHERE id = $2 AND expiration_timestamp > $3 AND revoked_timestamp IS NULL AND used_timestamp IS NULL;`,
      [permission, id, now]
    );

    if (result.rowCount === 0) {
      throw new Error("Code not found.");
    }
  } catch (error) {
    throw error;
  }
}

/**
 * An authenticated query that adds a permission to an account creation code.
 * Only updates it as long as the code is valid and not expired/revoked, otherwise treats it as if code doesn't exist.
 *
 * @throws Error If the database query fails.
 */
export async function addPermissionToAccountCreationCode(
  _scope: DALScope,
  id: string,
  permission: Permission
) {
  try {
    const now = new Date();
    const result = await db.query(
      `UPDATE account_creation_codes
       SET permission_ids = array_append(permission_ids, $1)
       WHERE id = $2 AND expiration_timestamp > $3 AND revoked_timestamp IS NULL AND used_timestamp IS NULL;`,
      [permission, id, now]
    );

    if (result.rowCount === 0) {
      throw new Error("Code not found.");
    }
  } catch (error) {
    throw error;
  }
}

/**
 * An authenticated query that updates the account_default_token_expiry_seconds field of an account creation code.
 * Only updates it as long as the code is valid and not expired/revoked, otherwise treats it as if code doesn't exist.
 *
 * @throws Error If the database query fails.
 */
export async function updateAccountCreationCodeAccountDefaultTokenExpiry(
  _scope: DALScope,
  id: string,
  expirySeconds: number
) {
  try {
    const now = new Date();
    const result = await db.query(
      `UPDATE account_creation_codes
       SET account_default_token_expiry_seconds = $1
       WHERE id = $2 AND expiration_timestamp > $3 AND revoked_timestamp IS NULL AND used_timestamp IS NULL;`,
      [expirySeconds, id, now]
    );

    if (result.rowCount === 0) {
      throw new Error("Code not found.");
    }
  } catch (error) {
    throw error;
  }
}

/**
 * An authenticated query that updates the on_used_email_creator field of an account creation code.
 * Only updates it as long as the code is valid and not expired/revoked, otherwise treats it as if code doesn't exist.
 *
 * @throws Error If the database query fails.
 */
export async function updateAccountCreationCodeOnUsedEmailCreator(
  _scope: DALScope,
  id: string,
  emailCreator: boolean
) {
  try {
    const now = new Date();
    const result = await db.query(
      `UPDATE account_creation_codes
       SET on_used_email_creator = $1
       WHERE id = $2 AND expiration_timestamp > $3 AND revoked_timestamp IS NULL AND used_timestamp IS NULL;`,
      [emailCreator, id, now]
    );

    if (result.rowCount === 0) {
      throw new Error("Code not found.");
    }
  } catch (error) {
    throw error;
  }
}

/**
 * An authenticated query that returns whether an account creation code that is valid and not expired/revoked with a specific email address exists.
 *
 * @throws Error If the database query fails.
 */
export async function doesValidAccountCreationCodeWithThisEmailExist(
  _scope: DALScope,
  email: string
) {
  try {
    const now = new Date();
    const result = await db.query(
      `SELECT 1 FROM account_creation_codes
       WHERE email = $1
       AND expiration_timestamp > $2 AND revoked_timestamp IS NULL AND used_timestamp IS NULL;`,
      [email, now]
    );

    return result.rows.length > 0;
  } catch (error) {
    throw error;
  }
}

"use server";

import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import {
  addUser,
  tokenless_getAccountCreationCode,
  tokenless_getUserByUsername,
  tokenless_setAccountCreationCodeUsed,
} from "../db/_internal/tokenless-queries";
import {
  databaseQueryError,
  databaseQuerySuccess,
  DatabaseQueryResult,
  tokenless_executeDatabaseQuery,
} from "../db/dal";

export async function verifyAccountCreationCodeAction(
  code: string
): Promise<DatabaseQueryResult<void>> {
  // Check if account creation code is valid
  const getAccountCreationCodeRequest = await tokenless_executeDatabaseQuery(
    tokenless_getAccountCreationCode,
    [code]
  );

  if (!getAccountCreationCodeRequest.success) {
    return databaseQueryError("Invalid account creation code.");
  }

  const accountCreationCode = getAccountCreationCodeRequest.result;
  if (accountCreationCode.deletion_timestamp) {
    return databaseQueryError("Invalid account creation code.");
  }
  if (accountCreationCode.used_timestamp != null) {
    return databaseQueryError(
      "Account creation code was already used to create an account."
    );
  }
  if (accountCreationCode.expiration_timestamp < new Date()) {
    return databaseQueryError("Account creation code expired.");
  }

  return databaseQuerySuccess();
}

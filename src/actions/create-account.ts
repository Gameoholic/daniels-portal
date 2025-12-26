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
  executeDatabaseQueryWithoutToken,
} from "../db/dal";

export async function createAccountAction(
  username: string,
  plaintextPassword: string,
  email: string,
  accountCreationCodePlain: string
): Promise<DatabaseQueryResult<void>> {
  // Check if account creation code is valid
  const getAccountCreationCodeRequest = await executeDatabaseQueryWithoutToken(
    tokenless_getAccountCreationCode,
    [accountCreationCodePlain]
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

  if (accountCreationCode.email != email) {
    return databaseQueryError(
      "Email does not belong to the email the code was issued to."
    );
  }

  // TODO
  // While it's impossible to tell if a username exists in the DB upon login, if you have an account creation code you can suss out users, even if
  // we remove the error code (since it'll just fail internally and return a status 500..)
  // Super minor security hole, but still would be nice to maybe fix one day. A fix would be to :
  // - Limit account creation code usage attempts (you've tried to create too many accounts with this code, please contact an administrator) <- More convenient but less secure
  // - To not let users select their own usernames (username would be created along with account creation code) <- Most secure but less convenient
  if (
    (
      await executeDatabaseQueryWithoutToken(tokenless_getUserByUsername, [
        username,
      ])
    ).success
  ) {
    return databaseQueryError("Username already exists.");
  }

  // We deliberately don't check if user with this email already exists. This shouldn't happen because when we issue account creation codes we check for this
  // and if it for some reason it does happen we don't want to expose which emails exist on the DB to the client, so it'll just fall on the 500 status error below.

  // Invalidate account creation code
  const setAccountCreationCodeUsedRequest =
    await executeDatabaseQueryWithoutToken(
      tokenless_setAccountCreationCodeUsed,
      [accountCreationCode.code]
    );
  if (!setAccountCreationCodeUsedRequest.success) {
    return databaseQueryError(
      "Could not create account due to an internal error."
    );
  }

  const userId = uuidv4();
  const defaultTokenExpirySeconds = 60 * 60 * 24 * 7; // 1 week // todo move this to env variables
  // Gen salt & hash password
  const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT_ROUNDS));
  const hashedPassword = await bcrypt.hash(plaintextPassword, salt);

  // Create account
  const createUserRequest = await executeDatabaseQueryWithoutToken(addUser, [
    userId,
    username,
    email,
    hashedPassword,
    defaultTokenExpirySeconds,
    null,
  ]);

  if (!createUserRequest.success) {
    return databaseQueryError(
      "Could not create account due to an internal error."
    );
  }

  return databaseQuerySuccess();
}

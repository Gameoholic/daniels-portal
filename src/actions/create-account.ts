"use server";

import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import {
  tokenless_addUser,
  tokenless_addUserPermission,
  tokenless_getAccountCreationCode,
  tokenless_getUser,
  tokenless_getUserByUsername,
  tokenless_setAccountCreationCodeUsed,
} from "../db/_internal/tokenless-queries";
import {
  databaseQueryError,
  databaseQuerySuccess,
  DatabaseQueryResult,
  tokenless_executeDatabaseQuery,
} from "../db/dal";
import { Resend } from "resend";
import { AccountCreatedSuccessfullyEmail } from "@/src/components/email/account-created-email";
import { AdminAccountCreationNotificationEmail } from "@/src/components/email/admin-account-creation-notification-email";

export async function createAccountAction(
  username: string,
  plaintextPassword: string,
  email: string,
  accountCreationCodePlain: string
): Promise<DatabaseQueryResult<void>> {
  // Check if account creation code is valid
  const getAccountCreationCodeRequest = await tokenless_executeDatabaseQuery(
    tokenless_getAccountCreationCode,
    [accountCreationCodePlain]
  );

  if (!getAccountCreationCodeRequest.success) {
    return databaseQueryError("Invalid account creation code.");
  }

  const accountCreationCode = getAccountCreationCodeRequest.result;
  if (accountCreationCode.revoked_timestamp) {
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
  const getUserByUsernameQuery = await tokenless_executeDatabaseQuery(
    tokenless_getUserByUsername,
    [username]
  );
  if (!getUserByUsernameQuery.success) {
    return databaseQueryError("Internal error occurred.");
  }
  if (getUserByUsernameQuery.result != null) {
    return databaseQueryError("Username already exists.");
  }

  // We deliberately don't check if user with this email already exists. This shouldn't happen because when we issue account creation codes we check for this
  // and if it for some reason it does happen we don't want to expose which emails exist on the DB to the client, so it'll just fall on the 500 status error below.

  const userId = uuidv4();
  // Invalidate account creation code
  const setAccountCreationCodeUsedRequest =
    await tokenless_executeDatabaseQuery(tokenless_setAccountCreationCodeUsed, [
      accountCreationCode.code,
      userId,
    ]);
  if (!setAccountCreationCodeUsedRequest.success) {
    return databaseQueryError(
      "Could not create account due to an internal error."
    );
  }

  const defaultTokenExpirySeconds =
    accountCreationCode.account_default_token_expiry_seconds;
  // Gen salt & hash password
  const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT_ROUNDS));
  const hashedPassword = await bcrypt.hash(plaintextPassword, salt);

  // Create account
  const createUserRequest = await tokenless_executeDatabaseQuery(
    tokenless_addUser,
    [userId, username, email, hashedPassword, defaultTokenExpirySeconds, null]
  );

  // Add permissions
  // todo don't make a db call per permission individually
  const addPermissionsQuery = await Promise.all(
    accountCreationCode.permission_ids.map(async (x) => {
      const addUserPermissionQuery = await tokenless_executeDatabaseQuery(
        tokenless_addUserPermission,
        [userId, x]
      );
      return addUserPermissionQuery;
    })
  );
  if (addPermissionsQuery.some((x) => !x.success)) {
    return databaseQueryError(
      "Could not create account due to an internal error."
    );
  }

  if (!createUserRequest.success) {
    return databaseQueryError(
      "Could not create account due to an internal error."
    );
  }

  // ------- EMAIL NOTIFICATIONS: ----

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error: userEmailError } = await resend.emails.send({
    from: `${process.env.SITE_NAME} <${process.env.EMAIL_SENDER_NAME}@${process.env.DOMAIN}>`,
    to: email,
    subject: `Welcome to ${process.env.DOMAIN}`,
    react: AccountCreatedSuccessfullyEmail({
      userId: userId,
      username: username,
    }),
  });
  if (userEmailError) {
    // todo: this is not ideal.
    return databaseQueryError(
      "Created account but couldn't send welcome email."
    );
  }

  const getAccountCreationCodeCreatorQuery =
    await tokenless_executeDatabaseQuery(tokenless_getUser, [
      accountCreationCode.creator_user_id,
    ]);
  if (
    !getAccountCreationCodeCreatorQuery.success ||
    getAccountCreationCodeCreatorQuery.result === null
  ) {
    // todo: this is not ideal.
    return databaseQueryError(
      "Created account but couldn't send email to creator of account creation code."
    );
  }
  const accountCreationCodeCreatorEmail =
    getAccountCreationCodeCreatorQuery.result.email;
  if (accountCreationCode.on_used_email_creator) {
    const { error: adminEmailError } = await resend.emails.send({
      from: `${process.env.SITE_NAME} <${process.env.EMAIL_SENDER_NAME}@${process.env.DOMAIN}>`,
      to: accountCreationCodeCreatorEmail,
      subject: `Your code was used to create an account`,
      react: AdminAccountCreationNotificationEmail({
        codeId: accountCreationCode.id,
        codeTitle: accountCreationCode.title,
        email: email,
        userId: userId,
        username: username,
        permissions: accountCreationCode.permission_ids,
      }),
    });
    if (adminEmailError) {
      // todo: this is not ideal.
      return databaseQueryError(
        "Created account but couldn't send email to creator of account creation code."
      );
    }
  }

  return databaseQuerySuccess();
}

"use server";

import {
  isAccessTokenValid,
  ServerAccessToken,
  ServerUser,
} from "../db/_internal/server_types";
import { updateUserLastLoginTimestamp } from "../db/_internal/users";
import {
  DatabaseQueryResult,
  executeDatabaseQuery,
  executeDatabaseQueryWithoutToken,
} from "../db/dal";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { invalidateTokensIfOverMaxAmountAction } from "./per-page/user-settings";
import {
  addAccessToken,
  getUserAccessTokens,
  updateAccessTokenAutomaticallyRevokedTimestamp,
} from "../db/_internal/access-tokens";
import {
  tokenless_getUserAccessTokens,
  tokenless_getUserByUsername,
  tokenless_updateAccessTokenAutomaticallyRevokedTimestamp,
} from "../db/_internal/tokenless-queries";

export interface LoginActions_LoginAction_Result {
  accessToken: string;
  loginMessage: string; // Can pass additional parameters like this in the future
}

export async function loginAction(
  username: string,
  plaintextPassword: string
): Promise<DatabaseQueryResult<LoginActions_LoginAction_Result>> {
  // Get user, check if it exists
  const getUserRequest = await executeDatabaseQueryWithoutToken(
    tokenless_getUserByUsername,
    [username]
  );
  // If get user request failed, likely because username is incorrect:
  if (!getUserRequest.success) {
    const saltJustForShow = await bcrypt.genSalt(
      Number(process.env.BCRYPT_SALT_ROUNDS)
    );
    await bcrypt.hash(plaintextPassword, saltJustForShow);
    // Instead of returning early, we spend time hashing the password the user provided, so it seems as if the account exists. This is to prevent
    // timing attacks where attackers can guess that the username doesn't exist because we returned early without hashing and it took significantly
    // less time to process the request.
    return { success: false, errorString: "Invalid login credentials." };
  }

  // Check if password matches
  // Salt is already included in the DB hash field as a prefix, this function does everything we need
  const user: ServerUser = getUserRequest.result;
  if (!(await bcrypt.compare(plaintextPassword, user.hashed_password))) {
    return { success: false, errorString: "Invalid login credentials." };
  }

  // Delete older tokens if maxTokensAtATime setting is turned on
  if (user.max_tokens_at_a_time) {
    const invalidateTokensIfOverMaxAmountRequest =
      await invalidateTokensIfOverMaxAmount(
        user.id,
        user.max_tokens_at_a_time - 1
      ); // -1 since we want to create a new token immediately after this so we create space
    if (!invalidateTokensIfOverMaxAmountRequest.success) {
      return {
        success: false,
        errorString: "Could not generate access token.",
      };
    }
  }

  // Finally, generate token
  const token = crypto.randomBytes(64).toString("base64url");
  const expirationTimestamp = new Date(
    Date.now() + 1000 * user.default_token_expiry_seconds
  );
  const createAccessTokenRequest = await executeDatabaseQueryWithoutToken(
    addAccessToken,
    [token, user.id, expirationTimestamp]
  );
  if (!createAccessTokenRequest.success) {
    return {
      success: false,
      errorString: "Could not generate access token.",
    };
  }

  // Update user last successful login
  const updateUserLastLoginTimestampRequest = await executeDatabaseQuery(
    token,
    updateUserLastLoginTimestamp,
    []
  );
  if (!updateUserLastLoginTimestampRequest.success) {
    return {
      success: false,
      errorString: "Could not update last login timestamp.",
    };
  }

  return {
    success: true,
    result: { accessToken: token, loginMessage: "Placeholder login message." },
  };
}

//todo: not ideal since this is repeated logic from the already existing action (but we can't call it since actions require userid and thus can't be called from here)
// maybe we just create an _internal function, that gets a token array and user id etc. and does most of the logic (besides the awaited calls) there?
async function invalidateTokensIfOverMaxAmount(
  userId: string,
  maxTokensAllowed: number
): Promise<DatabaseQueryResult<void>> {
  // Get all user's access tokens
  const getUserAccessTokensQuery = await executeDatabaseQueryWithoutToken(
    tokenless_getUserAccessTokens,
    [userId]
  );
  if (!getUserAccessTokensQuery.success) {
    return { success: false, errorString: "Couldn't get access tokens." };
  }
  const validAccessTokens = getUserAccessTokensQuery.result.filter(
    (x) => isAccessTokenValid(x).valid
  );

  // 'Automatically' revoke all tokens that go over the max allowed tokens limit
  if (maxTokensAllowed < validAccessTokens.length) {
    const amountOfTokensToRemove = validAccessTokens.length - maxTokensAllowed;
    const sortedTokens = validAccessTokens.sort(
      (a, b) => a.creation_timestamp.getTime() - b.creation_timestamp.getTime()
    );
    for (let i = 0; i < amountOfTokensToRemove; i++) {
      // Revoke each token that goes over the allowed amount
      const updateAccessTokenAutomaticallyRevokedTimestampQuery =
        await executeDatabaseQueryWithoutToken(
          tokenless_updateAccessTokenAutomaticallyRevokedTimestamp,
          [userId, sortedTokens[i].token]
        );
      if (!updateAccessTokenAutomaticallyRevokedTimestampQuery.success) {
        return { success: false, errorString: "Couldn't revoke access token" };
      }
    }
  }

  return { success: true, result: undefined };
}

"use server"; // All server actions must have this, turns this into callable from client. Otherwise, it turns into import("server-only") and then it's inaccessible to client
import {
  getUserAccessTokens,
  isAccessTokenValid,
  updateAccessTokenAutomaticallyRevokedTimestamp,
} from "@/src/db/_internal/per-table/access-tokens";
import {
  getUser,
  ServerUser,
  updateDefaultTokenExpiry,
  updateMaxTokensAtATime,
} from "@/src/db/_internal/per-table/users";
import {
  executeDatabaseQuery,
  getAccessTokenFromBrowser,
  DatabaseQueryResult,
} from "@/src/db/dal";
import { cookies } from "next/headers";

//todo: check permissions

export interface UserSettingsActions_GetUserAccessTokensAction_Result {
  token: string;
  creationTimestamp: Date;
  expirationTimestamp: Date;
  lastUseTimestamp: Date | null;
}
/**
 * @returns Only valid (non-expired and non-revoked) access tokens
 */
export async function getUserAccessTokensAction(): Promise<
  DatabaseQueryResult<UserSettingsActions_GetUserAccessTokensAction_Result[]>
> {
  // Get all user's access tokens
  const getUserAccessTokensQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getUserAccessTokens,
    []
  );
  if (!getUserAccessTokensQuery.success) {
    return getUserAccessTokensQuery;
  }

  // Filter out invalid access tokens
  const allAccessTokens = getUserAccessTokensQuery.result;
  const onlyValidAccessTokens = allAccessTokens.filter(
    (x) => isAccessTokenValid(x).valid
  );
  // Minimize data passed to client to only necessary data
  const minimizedDataAccessTokens = onlyValidAccessTokens.map((x) => ({
    token: x.token,
    creationTimestamp: x.creation_timestamp,
    expirationTimestamp: x.expiration_timestamp,
    lastUseTimestamp: x.last_use_timestamp,
  }));

  return {
    success: true,
    result: minimizedDataAccessTokens,
  };
}

/**
 * 'Automatically' revokes the oldest access tokens for a user if the total number
 * of tokens exceeds the allowed maximum.
 *
 * @param plusOneToken - If true, the function assumes a new token is about to be created
 * and temporarily reduces maxTokensAllowed by one to make room for it.
 */
export async function invalidateTokensIfOverMaxAmountAction(
  maxTokensAllowed: number,
  plusOneToken: boolean
): Promise<DatabaseQueryResult<void>> {
  // Validate passed argument
  if (maxTokensAllowed <= 0) {
    return {
      success: false,
      errorString: "Invalid max tokens allowed argument.",
    };
  }

  // Get all user's access tokens
  const getUserAccessTokensQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getUserAccessTokens,
    []
  );
  if (!getUserAccessTokensQuery.success) {
    return { success: false, errorString: "Couldn't revoke access token." };
  }
  const validAccessTokens = getUserAccessTokensQuery.result.filter(
    (x) => isAccessTokenValid(x).valid
  );

  // 'Automatically' revoke all tokens that go over the max allowed tokens limit
  if (plusOneToken) {
    maxTokensAllowed--;
  }
  if (maxTokensAllowed < validAccessTokens.length) {
    const amountOfTokensToRemove = validAccessTokens.length - maxTokensAllowed;
    const sortedTokens = validAccessTokens.sort(
      (a, b) => a.creation_timestamp.getTime() - b.creation_timestamp.getTime()
    );
    for (let i = 0; i < amountOfTokensToRemove; i++) {
      // Revoke each token that goes over the allowed amount
      const updateAccessTokenAutomaticallyRevokedTimestampQuery =
        await executeDatabaseQuery(
          await getAccessTokenFromBrowser(),
          updateAccessTokenAutomaticallyRevokedTimestamp,
          [sortedTokens[i].token]
        );
      if (!updateAccessTokenAutomaticallyRevokedTimestampQuery.success) {
        return { success: false, errorString: "Couldn't revoke access token" };
      }
    }
  }

  return {
    success: true,
    result: undefined, // void
  };
}

/**
 * Updates the default token expiry in seconds of a user.
 */
export async function changeDefaultTokenExpiryAction(
  seconds: number
): Promise<DatabaseQueryResult<void>> {
  // Verify arguments are valid
  if (seconds <= 0) {
    return {
      success: false,
      errorString: "Faulty parameters.",
    };
  }

  const updateDefaultTokenExpiryQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    updateDefaultTokenExpiry,
    [seconds]
  );
  if (!updateDefaultTokenExpiryQuery.success) {
    return { success: false, errorString: "Couldn't update token expiry." };
  }

  return {
    success: true,
    result: undefined, // void
  };
}

/**
 * Updates the max tokens of a user.
 * Does NOT 'automatically' invalidate already existing tokens. A separate function call is required for this.
 */
export async function changeMaxTokensAtATimeAction(
  max: number | null
): Promise<DatabaseQueryResult<void>> {
  // Verify parameters are valid
  if (max != null && (max <= 0 || max > 10)) {
    return {
      success: false,
      errorString: "Faulty max tokens at a time parameter.",
    };
  }

  const updateMaxTokensAtATimeQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    updateMaxTokensAtATime,
    [max]
  );
  if (!updateMaxTokensAtATimeQuery.success) {
    return { success: false, errorString: "Couldn't update max tokens." };
  }

  return {
    success: true,
    result: undefined, // void
  };
}

/**
 * 'Manually' revokes a token.
 */
export async function revokeTokenAction(
  token: string
): Promise<DatabaseQueryResult<void>> {
  const updateAccessTokenManuallyRevokedTimestampQuery =
    await executeDatabaseQuery(
      await getAccessTokenFromBrowser(),
      updateAccessTokenAutomaticallyRevokedTimestamp,
      [token]
    );

  if (!updateAccessTokenManuallyRevokedTimestampQuery.success) {
    return { success: false, errorString: "Couldn't revoke access token." };
  }

  return {
    success: true,
    result: undefined, // void
  };
}

/**
 * 'Manually' revokes the user's token and deletes their cookies. Used for logging out.
 */
export async function revokeSelfTokenAction(): Promise<
  DatabaseQueryResult<void>
> {
  let token = await getAccessTokenFromBrowser();
  if (!token) {
    return {
      success: false,
      errorString: "Invalid access token.",
    };
  }
  const revokeTokenActionResult = revokeTokenAction(token);
  if (!(await revokeTokenActionResult).success) {
    return {
      success: false,
      errorString: "Couldn't revoke token.",
    };
  }
  (await cookies()).delete("access-token");
  return {
    success: true,
    result: undefined, // void
  };
}

export interface UserSettingsActions_GetUserAction_Result {
  id: string;
  email: string;
  creationTimestamp: Date;
  lastLoginTimestamp: Date | null;
  defaultTokenExpirySeconds: number;
  maxTokensAtATime: number | null;
  username: string;
}
/**
 * @returns User.
 */
export async function getUserAction(): Promise<
  DatabaseQueryResult<UserSettingsActions_GetUserAction_Result>
> {
  // Get all user's access tokens
  const getUserQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getUser,
    []
  );
  if (!getUserQuery.success) {
    return getUserQuery;
  }

  const user: ServerUser = getUserQuery.result;

  // Minimize data passed to client to only necessary data
  const minimizedDataUser: UserSettingsActions_GetUserAction_Result = {
    username: user.username,
    id: user.id,
    email: user.email,
    creationTimestamp: user.creation_timestamp,
    lastLoginTimestamp: user.last_login_timestamp,
    defaultTokenExpirySeconds: user.default_token_expiry_seconds,
    maxTokensAtATime: user.max_tokens_at_a_time,
  };

  return {
    success: true,
    result: minimizedDataUser,
  };
}

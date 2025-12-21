"use server"; // All server actions must have this, turns this into callable from client. Otherwise, it turns into import("server-only") and then it's inaccessible to client
import {
  executeDatabaseQuery,
  getAccessTokenFromBrowser,
  SecureDBScope,
} from "../db/dal";
import {
  getUserAccessTokens,
  updateAccessTokenAutomaticallyRevokedTimestamp,
  updateDefaultTokenExpiry,
  updateMaxTokensAtATime,
} from "../db/_internal/user-settings";
import {
  ClientAccessToken,
  ClientDatabaseQueryResult,
} from "../utils/client_types";
import { isAccessTokenValid } from "../utils/server_types";

//todo: check permissions
//todo: custom type for return result.
// todo: check requester id if needed.

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
  ClientDatabaseQueryResult<
    UserSettingsActions_GetUserAccessTokensAction_Result[]
  >
> {
  getUserAccessTokens({} as SecureDBScope, ""); // TODO REMVOE THISSSSSSSSSSSSSSSSSSSSSSSSSSSSSSsssssssssssssssssss

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
  const onlyValidAccessTokens = allAccessTokens.filter((x) =>
    isAccessTokenValid(x)
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
): Promise<ClientDatabaseQueryResult<void>> {
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
  const accessTokens = getUserAccessTokensQuery.result;

  // 'Automatically' revoke all tokens that go over the max allowed tokens limit
  if (plusOneToken) {
    maxTokensAllowed--;
  }
  if (maxTokensAllowed < accessTokens.length) {
    const amountOfTokensToRemove = accessTokens.length - maxTokensAllowed;
    const sortedTokens = accessTokens.sort(
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
): Promise<ClientDatabaseQueryResult<void>> {
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
): Promise<ClientDatabaseQueryResult<void>> {
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

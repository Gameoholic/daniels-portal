"use server"; // All actions must have this, turns this into callable from client. Otherwise, it turns into import("server-only") and then it's inaccessible to client

import {
  requestAddExpense,
  requestGetExpenses,
} from "@/src/utils/db/book-keeping/expenses/db_actions";
import {
  ClientAccessToken,
  ClientDatabaseQueryResult,
  ClientExpense,
  ClientUser,
} from "@/src/utils/client_types";
import {
  ServerAccessToken,
  ServerExpense,
  ServerUser,
} from "@/src/utils/server_types";
import {
  requestGetAccessToken,
  requestGetUserAccessTokens,
  requestGetUserById,
  requestUpdateAccessTokenLastUseTimestamp,
  requestUpdateDefaultTokenExpiry,
  requestUpdateMaxTokensAtATime,
  requestUpdateAccessTokenManuallyRevokedTimestamp,
  requestUpdateAccessTokenAutomaticallyRevokedTimestamp,
} from "@/src/utils/db/auth/db_actions";
import { cookies } from "next/headers";
import { getAndVerifyAccessToken } from "./auth";

export async function logUserOut(): Promise<ClientDatabaseQueryResult<void>> {
  // Verify access token, get user ID from it
  const getAccessTokenRequest = await getAndVerifyAccessToken();
  if (!getAccessTokenRequest.success) {
    return getAccessTokenRequest;
  }
  const token: string = getAccessTokenRequest.result.token;
  // Perform server-side request
  const getExpensesRequest =
    await requestUpdateAccessTokenManuallyRevokedTimestamp(token);

  // Convert server-types to client-types for safety, abstract away unneeded stuff
  if (!getExpensesRequest.success) {
    return {
      success: false,
      errorString: getExpensesRequest.errorString,
    };
  }

  // Delete access token cookie client-side
  (await cookies()).delete("access-token");

  return {
    success: true,
    result: undefined, // void
  };
}

export async function invalidateSelfAccessToken(
  token: string
): Promise<ClientDatabaseQueryResult<void>> {
  // Perform server-side request
  const getExpensesRequest =
    await requestUpdateAccessTokenManuallyRevokedTimestamp(token);

  // Technically we don't need to do this, but we do it because I set it as the standard for all DB calls
  // UPDATE ACCESS TOKEN LAST USE TIMESTAMP
  const updateAccessTokenLastUseTimestampRequest =
    await requestUpdateAccessTokenLastUseTimestamp(token);
  if (!updateAccessTokenLastUseTimestampRequest.success) {
    return {
      success: false,
      errorString: "Couldn't update the last use timestamp for the token.",
    };
  }

  // Convert server-types to client-types for safety, abstract away unneeded stuff
  if (!getExpensesRequest.success) {
    return {
      success: false,
      errorString: getExpensesRequest.errorString,
    };
  }

  return {
    success: true,
    result: undefined, // void
  };
}

export async function getUserAction(): Promise<
  ClientDatabaseQueryResult<ClientUser>
> {
  // Verify access token, get user ID from it
  const getAccessTokenRequest = await getAndVerifyAccessToken();
  if (!getAccessTokenRequest.success) {
    return getAccessTokenRequest;
  }
  const userId: string = getAccessTokenRequest.result.user_id;

  // Perform server-side request
  const getUserRequest = await requestGetUserById(userId);

  // Convert server-types to client-types for safety, abstract away unneeded stuff
  if (!getUserRequest.success) {
    return {
      success: false,
      errorString: getUserRequest.errorString,
    };
  }
  return {
    success: true,
    result: {
      id: getUserRequest.result.id,
      email: getUserRequest.result.email,
      creationTimestamp: getUserRequest.result.creation_timestamp,
      lastLoginTimestamp: getUserRequest.result.last_login_timestamp,
      defaultTokenExpirySeconds:
        getUserRequest.result.default_token_expiry_seconds,
      maxTokensAtATime: getUserRequest.result.max_tokens_at_a_time,
      username: getUserRequest.result.username,
    },
  };
}

// Will only return non-expired and non-revoked access tokens
export async function getUserAccessTokensAction(): Promise<
  ClientDatabaseQueryResult<ClientAccessToken[]>
> {
  // Verify access token, get user ID from it
  const getAccessTokenRequest = await getAndVerifyAccessToken();
  if (!getAccessTokenRequest.success) {
    return getAccessTokenRequest;
  }
  const userId: string = getAccessTokenRequest.result.user_id;

  // Perform server-side request
  const getUserRequest = await requestGetUserAccessTokens(userId);

  // Convert server-types to client-types for safety, abstract away unneeded stuff
  if (!getUserRequest.success) {
    return {
      success: false,
      errorString: getUserRequest.errorString,
    };
  }

  return {
    success: true,
    result: getUserRequest.result
      .filter(
        (x) =>
          x.expiration_timestamp > new Date() &&
          !x.automatically_revoked_timestamp &&
          !x.manually_revoked_timestamp
      ) // Don't include token if it's already expired or revoked
      .map((token) => ({
        token: token.token,
        userId: token.user_id,
        creationTimestamp: token.creation_timestamp,
        expirationTimestamp: token.expiration_timestamp,
        lastUseTimestamp: token.last_use_timestamp,
      })),
  };
}

/**
 * 'Automatically' revokes the oldest access tokens for a user if the total number
 * of tokens exceeds the allowed maximum.
 *
 * ⚠️ IMPORTANT:
 * - This function does NOT validate user authenticity and does not update any data on the server, except for revoking the tokens.
 * - maxTokensAllowed should be a number higher than 0.
 *
 * @param plusOneToken - If true, the function assumes a new token is about to be created
 * and temporarily reduces maxTokensAllowed by one to make room for it.
 */
export async function invalidateTokensIfOverMaxAmount(
  userId: string,
  maxTokensAllowed: number,
  plusOneToken: boolean
): Promise<ClientDatabaseQueryResult<void>> {
  const getUserAccessTokensRequest = await requestGetUserAccessTokens(userId);
  if (!getUserAccessTokensRequest.success) {
    return {
      success: false,
      errorString: "Couldn't get user access tokens.",
    };
  }

  if (plusOneToken) {
    maxTokensAllowed--;
  }
  if (maxTokensAllowed < getUserAccessTokensRequest.result.length) {
    const tokensToRemove =
      getUserAccessTokensRequest.result.length - maxTokensAllowed;
    const sortedTokens = getUserAccessTokensRequest.result.sort(
      (a, b) => a.creation_timestamp.getTime() - b.creation_timestamp.getTime()
    );
    for (let i = 0; i < tokensToRemove; i++) {
      const request =
        await requestUpdateAccessTokenAutomaticallyRevokedTimestamp(
          sortedTokens[i].token
        );
      if (!request.success) {
        return { success: false, errorString: "Couldn't delete access token" };
      }
    }
  }

  return {
    success: true,
    result: undefined, // void
  };
}

export async function changeDefaultTokenExpiry(
  seconds: number
): Promise<ClientDatabaseQueryResult<void>> {
  // Verify access token, get user ID from it
  const getAccessTokenRequest = await getAndVerifyAccessToken();
  if (!getAccessTokenRequest.success) {
    return getAccessTokenRequest;
  }
  const userId: string = getAccessTokenRequest.result.user_id;

  // Verify parameters are valid
  if (seconds <= 0) {
    return {
      success: false,
      errorString: "Faulty parameters.",
    };
  }

  // Perform server-side request
  const updateDefaultTokenExpiryRequest = await requestUpdateDefaultTokenExpiry(
    userId,
    seconds
  );

  // Convert server-types to client-types for safety, abstract away unneeded stuff
  if (!updateDefaultTokenExpiryRequest.success) {
    return {
      success: false,
      errorString: updateDefaultTokenExpiryRequest.errorString,
    };
  }
  return {
    success: true,
    result: undefined, // void
  };
}

export async function changeMaxTokensAtATime(
  max: number | null
): Promise<ClientDatabaseQueryResult<void>> {
  // Verify access token, get user ID from it
  const getAccessTokenRequest = await getAndVerifyAccessToken();
  if (!getAccessTokenRequest.success) {
    return getAccessTokenRequest;
  }
  const userId: string = getAccessTokenRequest.result.user_id;

  // Verify parameters are valid
  if (max != null && (max <= 0 || max > 10)) {
    return {
      success: false,
      errorString: "Faulty parameters.",
    };
  }

  // Perform server-side request
  const updateMaxTokensAtATimeRequest = await requestUpdateMaxTokensAtATime(
    userId,
    max
  );

  // Convert server-types to client-types for safety, abstract away unneeded stuff
  if (!updateMaxTokensAtATimeRequest.success) {
    return {
      success: false,
      errorString: updateMaxTokensAtATimeRequest.errorString,
    };
  }
  return {
    success: true,
    result: undefined, // void
  };
}

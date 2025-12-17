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
import { ServerAccessToken, ServerExpense } from "@/src/utils/server_types";
import {
  requestDeleteAccessToken,
  requestGetAccessToken,
  requestGetUserAccessTokens,
  requestGetUserById,
  requestUpdateAccessTokenLastUseTimestamp,
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
  const getExpensesRequest = await requestDeleteAccessToken(token);

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
  const getExpensesRequest = await requestDeleteAccessToken(token);

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
    result: getUserRequest.result.map((token) => ({
      token: token.token,
      userId: token.user_id,
      creationTimestamp: token.creation_timestamp,
      expirationTimestamp: token.expiration_timestamp,
      lastUseTimestamp: token.last_use_timestamp,
    })),
  };
}

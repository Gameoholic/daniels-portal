"use server"; // All actions must have this, turns this into callable from client. Otherwise, it turns into import("server-only") and then it's inaccessible to client

import {
  requestAddExpense,
  requestGetExpenses,
} from "@/src/utils/db/book-keeping/expenses/db_actions";
import {
  ClientDatabaseQueryResult,
  ClientExpense,
  ClientUser,
} from "@/src/utils/client_types";
import { ServerAccessToken, ServerExpense } from "@/src/utils/server_types";
import {
  requestDeleteAccessToken,
  requestGetAccessToken,
  requestGetUserById,
} from "@/src/utils/db/auth/db_actions";
import { cookies } from "next/headers";
import { getAccessToken } from "./auth";

export async function logUserOut(): Promise<ClientDatabaseQueryResult<void>> {
  // Verify access token, get user ID from it
  const getAccessTokenRequest = await getAccessToken();
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


export async function getUserAction(): Promise<
  ClientDatabaseQueryResult<ClientUser>
> {
  // Verify access token, get user ID from it
  const getAccessTokenRequest = await getAccessToken();
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
        username: getUserRequest.result.username
    },
  };
}

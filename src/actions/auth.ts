"use server"; // All actions must have this, turns this into callable from client. Otherwise, it turns into import("server-only") and then it's inaccessible to client

import {
  requestAddExpense,
  requestGetExpenses,
} from "@/src/utils/db/book-keeping/expenses/db_actions";
import {
  ClientDatabaseQueryResult,
  ClientExpense,
} from "@/src/utils/client_types";
import { ServerAccessToken, ServerExpense } from "@/src/utils/server_types";
import {
  requestDeleteAccessToken,
  requestGetAccessToken,
} from "@/src/utils/db/auth/db_actions";
import { cache } from "react";
import { cookies } from "next/headers";

// This cached call will be per html request, aka per page, so we don't check this multiple times per request.
const getAccessToken = cache(
  async (): Promise<ClientDatabaseQueryResult<ServerAccessToken>> => {
    const token = (await cookies()).get("access-token")?.value;
    if (!token) {
      return {
        success: false,
        errorString: "Invalid access token.",
      };
    }
    return await requestGetAccessToken(token);
  }
);

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

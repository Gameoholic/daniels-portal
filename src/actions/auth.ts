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
  requestUpdateAccessTokenLastUseTimestamp,
} from "@/src/utils/db/auth/db_actions";
import { cache } from "react";
import { cookies } from "next/headers";

// This cached call will be per html request, aka per page, so we don't check this multiple times per request.
//todo: since this is cached, check what happens if we stay on the same page, but then token gets revoked midway through.
export const getAndVerifyAccessToken = cache(
  async (): Promise<ClientDatabaseQueryResult<ServerAccessToken>> => {
    // GET ACCESS TOKEN FROM COOKIE
    const token = (await cookies()).get("access-token")?.value;
    if (!token) {
      return {
        success: false,
        errorString: "Invalid access token.",
      };
    }

    // UPDATE ACCESS TOKEN LAST USE TIMESTAMP
    const updateAccessTokenLastUseTimestampRequest =
      await requestUpdateAccessTokenLastUseTimestamp(token);
    if (!updateAccessTokenLastUseTimestampRequest.success) {
      return {
        success: false,
        errorString: "Couldn't update the last use timestamp for the token.",
      };
    }

    // THIS WILL VERIFY THE TOKEN IS ACTUALLY VALID AND RETURN FURTHER DATA
    return await requestGetAccessToken(token);
  }
);

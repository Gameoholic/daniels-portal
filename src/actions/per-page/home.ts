"use server"; // All server actions must have this, turns this into callable from client. Otherwise, it turns into import("server-only") and then it's inaccessible to client
import {
  DatabaseQueryResult,
  executeDatabaseQuery,
  getAccessTokenFromBrowser,
} from "../../db/dal";
import {
  getUserAccessTokens,
  updateAccessTokenAutomaticallyRevokedTimestamp,
  updateAccessTokenManuallyRevokedTimestamp,
} from "../../db/_internal/access-tokens";
import {
  isAccessTokenValid,
  ServerUser,
} from "../../db/_internal/server_types";
import { cookies } from "next/headers";
import {
  getUser,
  updateDefaultTokenExpiry,
  updateMaxTokensAtATime,
} from "../../db/_internal/users";

export interface HomeActions_GetUserAction_Result {
  id: string;
  username: string;
}
/**
 * @returns User.
 */
export async function getUserAction(): Promise<
  DatabaseQueryResult<HomeActions_GetUserAction_Result>
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
  const minimizedDataUser: HomeActions_GetUserAction_Result = {
    username: user.username,
    id: user.id,
  };

  return {
    success: true,
    result: minimizedDataUser,
  };
}

"use server";

import { getUserPermissions } from "../db/_internal/permissions";
import { ServerPermission } from "../db/_internal/server_types";
import {
  DatabaseQueryResult,
  executeDatabaseQuery,
  getAccessTokenFromBrowser,
} from "../db/dal";

// All server actions must have this, turns this into callable from client. Otherwise, it turns into import("server-only") and then it's inaccessible to client

export interface PermissionsActions_GetUserPermissionsAction_Result {
  permissionName: string;
}
/**
 * @returns User.
 */
export async function getUserPermissionsAction(): Promise<
  DatabaseQueryResult<PermissionsActions_GetUserPermissionsAction_Result[]>
> {
  const getUserPermissionsQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getUserPermissions,
    []
  );
  if (!getUserPermissionsQuery.success) {
    return getUserPermissionsQuery;
  }

  const permissions: ServerPermission[] = getUserPermissionsQuery.result;

  // Minimize data passed to client to only necessary data
  const minimizedDataPermissions: PermissionsActions_GetUserPermissionsAction_Result[] =
    permissions.map((x) => ({
      permissionName: x.permission_name,
    }));

  return {
    success: true,
    result: minimizedDataPermissions,
  };
}

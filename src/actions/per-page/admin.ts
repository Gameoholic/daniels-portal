"use server";

import {
  getAccessToken,
  getUserAccessTokens,
  updateAccessTokenManuallyRevokedTimestamp,
  updateAccessTokenManuallyRevokedTimestampByAlias,
} from "@/src/db/_internal/per-table/access-tokens";
import {
  addUserPermission,
  assertIsPermission as assertIsKnownPermission,
  deleteUserPermission,
  getUserPermissions,
  Permission,
  PERMISSION_DATA,
} from "@/src/db/_internal/per-table/permissions";
import {
  getAllUsers,
  getUser,
  ServerUser,
} from "@/src/db/_internal/per-table/users";
import { isAccessTokenValid } from "@/src/db/_internal/tokenless-queries";
import {
  checkForPermission,
  checkForPermissions,
  databaseQueryError,
  DatabaseQueryResult,
  databaseQuerySuccess,
  executeDatabaseQuery,
  GET_USER_ID_FROM_ACCESS_TOKEN,
  getAccessTokenFromBrowser,
} from "@/src/db/dal";
import { forbidden } from "next/navigation";

export interface AdminActions_GetUsers_Result_Permission {
  name: string;
  description: string;
}

export interface AdminActions_GetUsers_Result {
  id: string;
  username: string;
  email: string;
  creationTimestamp: Date;
  lastLoginTimestamp: Date | null;
  defaultTokenExpirySeconds: number;
  maxTokensAtATime: number | null;
  permissions: AdminActions_GetUsers_Result_Permission[];
}
/**
 * Returns all users with less data, only to display in the search view.
 * @returns User.
 */
export async function getAllUsersAction(): Promise<
  DatabaseQueryResult<AdminActions_GetUsers_Result[]>
> {
  if (
    !(
      await checkForPermissions(
        Permission.UseApp_Admin,
        Permission.App_Admin_SearchUsers
      )
    ).success
  ) {
    return databaseQueryError("No permission.");
  }

  const getAllUsersQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getAllUsers,
    []
  );
  if (!getAllUsersQuery.success) {
    return getAllUsersQuery;
  }

  const users: ServerUser[] = getAllUsersQuery.result;
  // todo: fetching permissions for every user separately is expensive.
  // Minimize data passed to client to only necessary data
  // Get permissions for every user
  const minimizedDataUsers: (AdminActions_GetUsers_Result | null)[] =
    await Promise.all(
      users.map(async (user) => {
        const getUserPermissionsRequest = await executeDatabaseQuery(
          await getAccessTokenFromBrowser(),
          getUserPermissions,
          [user.id]
        );
        if (!getUserPermissionsRequest.success) {
          return null;
        }

        const permissions: AdminActions_GetUsers_Result_Permission[] =
          getUserPermissionsRequest.result.map((x) => ({
            name: x.permission,
            description: PERMISSION_DATA[x.permission].description,
          }));

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          creationTimestamp: user.creation_timestamp,
          lastLoginTimestamp: user.last_login_timestamp,
          defaultTokenExpirySeconds: user.default_token_expiry_seconds,
          maxTokensAtATime: user.max_tokens_at_a_time,
          permissions: permissions,
        };
      })
    );

  if (minimizedDataUsers.some((x) => x == null)) {
    return databaseQueryError(
      "Couldn't get permissions for one or more users."
    );
  }

  return databaseQuerySuccess(
    minimizedDataUsers as AdminActions_GetUsers_Result[] // we check earlier that none of it is null, this is just so compiler doesn't shout
  );
}

export interface AdminActions_GetUser_Result_Permission {
  permission: string;
  description: string;
}

export interface AdminActions_GetUser_Result_AccessToken {
  alias: string;
  creationTimestamp: Date;
  expirationTimestamp: Date;
  lastUseTimestamp: Date | null;
}

export interface AdminActions_GetUser_Result {
  id: string;
  username: string;
  email: string;
  creationTimestamp: Date;
  lastLoginTimestamp: Date | null;
  defaultTokenExpirySeconds: number;
  maxTokensAtATime: number | null;
  permissions: AdminActions_GetUser_Result_Permission[];
  accessTokens: AdminActions_GetUser_Result_AccessToken[];
}
/**
 * @returns User.
 */
export async function getUserAction(
  userId: string
): Promise<DatabaseQueryResult<AdminActions_GetUser_Result>> {
  if (
    !(
      await checkForPermissions(
        Permission.UseApp_Admin,
        Permission.App_Admin_SearchUsers
      )
    ).success
  ) {
    return databaseQueryError("No permission.");
  }

  const getUserQueryPromise = executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getUser,
    [userId]
  );

  const getUserPermissionsQueryPromise = executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getUserPermissions,
    [userId]
  );

  const getUserAccessTokensQueryPromise = executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getUserAccessTokens,
    [userId]
  );

  const [getUserQuery, getUserPermissionsQuery, getUserAccessTokensQuery] =
    await Promise.all([
      getUserQueryPromise,
      getUserPermissionsQueryPromise,
      getUserAccessTokensQueryPromise,
    ]);
  if (
    !getUserQuery.success ||
    getUserQuery.result == null ||
    !getUserPermissionsQuery.success ||
    !getUserAccessTokensQuery.success
  ) {
    return databaseQueryError("Couldn't get some user data.");
  }
  const user: ServerUser = getUserQuery.result;

  // Filter out invalid access tokens
  const allAccessTokens = getUserAccessTokensQuery.result;
  const onlyValidAccessTokens = allAccessTokens.filter(
    (x) => isAccessTokenValid(x).valid
  );

  // Minimize data passed to client to only necessary data
  const minimizedDataUserPermissions: AdminActions_GetUser_Result_Permission[] =
    getUserPermissionsQuery.result.map((x) => ({
      permission: x.permission,
      description: PERMISSION_DATA[x.permission].description,
    }));
  const minimizedDataUserAccessTokens: AdminActions_GetUser_Result_AccessToken[] =
    onlyValidAccessTokens.map((x) => ({
      alias: x.alias,
      creationTimestamp: x.creation_timestamp,
      expirationTimestamp: x.expiration_timestamp,
      lastUseTimestamp: x.last_use_timestamp,
    }));

  const minimizedDataUser: AdminActions_GetUser_Result = {
    id: user.id,
    username: user.username,
    email: user.email,
    creationTimestamp: user.creation_timestamp,
    lastLoginTimestamp: user.last_login_timestamp,
    defaultTokenExpirySeconds: user.default_token_expiry_seconds,
    maxTokensAtATime: user.max_tokens_at_a_time,
    permissions: minimizedDataUserPermissions,
    accessTokens: minimizedDataUserAccessTokens,
  };

  return databaseQuerySuccess(minimizedDataUser);
}

/**
 *
 */
export async function deleteUserPermissionAction(
  userId: string,
  permissionToRemove: string
): Promise<DatabaseQueryResult<void>> {
  if (
    !(
      await checkForPermissions(
        Permission.UseApp_Admin,
        Permission.App_Admin_ManageUsers_ManagePermissions
      )
    ).success
  ) {
    return databaseQueryError("No permission.");
  }

  if (!assertIsKnownPermission(permissionToRemove)) {
    return databaseQueryError("Permission doesn't exist.");
  }

  // Ensure that provided user ID is not self
  const getUserQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getUser,
    [GET_USER_ID_FROM_ACCESS_TOKEN]
  );
  if (!getUserQuery.success || getUserQuery.result == null) {
    return databaseQueryError("Couldn't delete permission.");
  }
  if (getUserQuery.result.id === userId) {
    return databaseQueryError("Can't delete your own permissions.");
  }

  const deleteUserPermissionQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    deleteUserPermission,
    [userId, permissionToRemove]
  );
  if (!deleteUserPermissionQuery.success) {
    return databaseQueryError("Couldn't delete permission.");
  }

  return databaseQuerySuccess();
}

/**
 *
 */
export async function addUserPermissionAction(
  userId: string,
  permissionToAdd: string
): Promise<DatabaseQueryResult<void>> {
  if (
    !(
      await checkForPermissions(
        Permission.UseApp_Admin,
        Permission.App_Admin_ManageUsers_ManagePermissions
      )
    ).success
  ) {
    return databaseQueryError("No permission.");
  }

  if (!assertIsKnownPermission(permissionToAdd)) {
    return databaseQueryError("Permission doesn't exist.");
  }

  // Ensure that provided user ID is not self
  const getUserQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getUser,
    [GET_USER_ID_FROM_ACCESS_TOKEN]
  );
  if (!getUserQuery.success || getUserQuery.result == null) {
    return databaseQueryError("Couldn't add permission.");
  }
  if (getUserQuery.result.id === userId) {
    return databaseQueryError("Can't add permissions to yourself.");
  }

  const addUserPermissionQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    addUserPermission,
    [userId, permissionToAdd]
  );
  if (!addUserPermissionQuery.success) {
    return databaseQueryError("Couldn't add permission.");
  }

  return databaseQuerySuccess();
}

/**
 * 'Manually' revokes a token using its alias.
 */
export async function revokeTokenAction(
  tokenAlias: string
): Promise<DatabaseQueryResult<void>> {
  if (
    !(
      await checkForPermissions(
        Permission.UseApp_Admin,
        Permission.App_Admin_ManageUsers_ManageAccessTokens
      )
    ).success
  ) {
    return databaseQueryError("No permission.");
  }

  const updateAccessTokenManuallyRevokedTimestampQuery =
    await executeDatabaseQuery(
      await getAccessTokenFromBrowser(),
      updateAccessTokenManuallyRevokedTimestampByAlias,
      [tokenAlias]
    );

  if (!updateAccessTokenManuallyRevokedTimestampQuery.success) {
    return { success: false, errorString: "Couldn't revoke access token." };
  }

  return {
    success: true,
    result: undefined, // void
  };
}

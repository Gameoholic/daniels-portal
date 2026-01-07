"use server";

import {
  getAccessToken,
  getUserAccessTokens,
} from "@/src/db/_internal/per-table/access-tokens";
import {
  assertIsPermission as assertIsKnownPermission,
  deleteUserPermission,
  getUserPermissions,
  Permission,
  PERMISSIONS_WITH_DESCRIPTIONS,
} from "@/src/db/_internal/per-table/permissions";
import {
  getAllUsers,
  getUser,
  ServerUser,
} from "@/src/db/_internal/per-table/users";
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
            description: PERMISSIONS_WITH_DESCRIPTIONS[x.permission],
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
  aliasToken: string;
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

  // Minimize data passed to client to only necessary data
  const minimizedDataUserPermissions: AdminActions_GetUser_Result_Permission[] =
    getUserPermissionsQuery.result.map((x) => ({
      permission: x.permission,
      description: PERMISSIONS_WITH_DESCRIPTIONS[x.permission],
    }));
  const minimizedDataUserAccessTokens: AdminActions_GetUser_Result_AccessToken[] =
    getUserAccessTokensQuery.result.map((x) => ({
      aliasToken:
        "thisistemporary_admin.ts action. add token-alias property to access token and pass that instead of this.",
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

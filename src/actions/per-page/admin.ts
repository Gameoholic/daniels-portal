import {
  getAccessToken,
  getUserAccessTokens,
} from "@/src/db/_internal/per-table/access-tokens";
import { getUserPermissions } from "@/src/db/_internal/per-table/permissions";
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

export interface AdminActions_GetUsers_Result {
  id: string;
  username: string;
  email: string;
  creationTimestamp: Date;
  lastLoginTimestamp: Date | null;
  defaultTokenExpirySeconds: number;
  maxTokensAtATime: number | null;
  permissions: string[];
  canIssueAccountCreationCodes: boolean;
  hasDangerousAdminPermissions: boolean;
}
/**
 * @returns User.
 */
export async function getAllUsersAction(): Promise<
  DatabaseQueryResult<AdminActions_GetUsers_Result[]>
> {
  if (
    !(await checkForPermissions("use_app_admin", "admin_search_users")).success
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

  const DANGEROUS_ADMIN_PERMISSIONS = new Set([
    "app_admin:search_users",
    "app_admin:admin_manage_users:delete_users",
    "app_admin:admin_manage_users:ban_users",
    "app_admin:admin_manage_users:manage_access_tokens",
    "app_admin:admin_manage_users:manage_permissions",
    "app_admin:admin_manage_users:manage_permissions_lite",
  ]);

  const CREATE_CODES_PERMISSION =
    "app_admin:admin_create_account_creation_codes";

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

        const permissions = getUserPermissionsRequest.result.map(
          (p) => p.permission_name
        );
        const canIssueAccountCreationCodes = permissions.includes(
          CREATE_CODES_PERMISSION
        );
        const hasDangerousAdminPermissions = permissions.some((x) =>
          DANGEROUS_ADMIN_PERMISSIONS.has(x)
        );
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          creationTimestamp: user.creation_timestamp,
          lastLoginTimestamp: user.last_login_timestamp,
          defaultTokenExpirySeconds: user.default_token_expiry_seconds,
          maxTokensAtATime: user.max_tokens_at_a_time,
          permissions: permissions,
          canIssueAccountCreationCodes: canIssueAccountCreationCodes,
          hasDangerousAdminPermissions: hasDangerousAdminPermissions,
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
  permissions: string[];
  accessTokens: AdminActions_GetUser_Result_AccessToken[];
}
/**
 * @returns User.
 */
export async function getUserAction(
  userId: string
): Promise<DatabaseQueryResult<AdminActions_GetUser_Result>> {
  if (
    !(await checkForPermissions("use_app_admin", "app_admin:search_users"))
      .success
  ) {
    return databaseQueryError("No permission.");
  }

  const getUserActionPromise = executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getUser,
    [userId]
  );

  const getUserPermissionsActionPromise = executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getUserPermissions,
    [userId]
  );

  const getUserAccessTokensActionPromise = executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getUserAccessTokens,
    [userId]
  );

  const [
    getUserActionResult,
    getUserPermissionsActionResult,
    getUserAccessTokensActionResult,
  ] = await Promise.all([
    getUserActionPromise,
    getUserPermissionsActionPromise,
    getUserAccessTokensActionPromise,
  ]);
  if (
    !getUserActionResult.success ||
    getUserActionResult.result == null ||
    !getUserPermissionsActionResult.success ||
    !getUserAccessTokensActionResult.success
  ) {
    return databaseQueryError("Couldn't get some user data.");
  }
  const user: ServerUser = getUserActionResult.result;

  // Minimize data passed to client to only necessary data
  const minimizedDataUserPermissions =
    getUserPermissionsActionResult.result.map((x) => x.permission_name);
  const minimizedDataUserAccessTokens: AdminActions_GetUser_Result_AccessToken[] =
    getUserAccessTokensActionResult.result.map((x) => ({
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

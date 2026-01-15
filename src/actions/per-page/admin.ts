"use server";

import {
  getAccessToken,
  getUserAccessTokens,
  updateAccessTokenManuallyRevokedTimestamp,
  updateAccessTokenManuallyRevokedTimestampByAlias,
} from "@/src/db/_internal/per-table/access-tokens";
import {
  addPermissionToAccountCreationCode,
  createAccountCreationCode,
  doesValidAccountCreationCodeWithThisEmailExist,
  getAccountCreationCode,
  getAllAccountCreationCodes,
  isAccountCreationCodeValid,
  removePermissionFromAccountCreationCode,
  revokeAccountCreationCode,
  ServerAccountCreationCode,
  updateAccountCreationCodeAccountDefaultTokenExpiry,
  updateAccountCreationCodeOnUsedEmailCreator,
} from "@/src/db/_internal/per-table/account-creation-codes";
import {
  addUserPermission,
  assertIsPermission as assertIsKnownPermission,
  assertIsPermission,
  deleteUserPermission,
  getUserPermissions,
  Permission,
  PERMISSION_DATA,
} from "@/src/db/_internal/per-table/permissions";
import {
  getAllUsers,
  getUser,
  getUserByEmail,
  ServerUser,
} from "@/src/db/_internal/per-table/users";
import { isAccessTokenValid } from "@/src/db/_internal/tokenless-queries";
import { v4 as uuidv4 } from "uuid";
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
import { ExpiryUnit, getSeconds } from "@/src/util/duration";
import { Resend } from "resend";
import { InvitationToJoinSiteEmail } from "@/src/components/email/invitation-account-creation-code-email";
import { render } from "@react-email/render";

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
export async function revokeAccessTokenAction(
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

export interface AdminActions_GetAccountCreationCodes_Result_Permission {
  name: string;
  description: string;
  isPrivileged: boolean;
}

export interface AdminActions_GetAccountCreationCodes_Result {
  id: string;
  title: string;
  email: string;
  creationTimestamp: Date;
  creatorUserId: string;
  creatorUsername: string;
  expirationTimestamp: Date;
  accountDefaultTokenExpirySeconds: number;
  permissions: AdminActions_GetAccountCreationCodes_Result_Permission[];
  onUsedEmailCreator: boolean;
}

/**
 * Returns all account creation codes.
 */
export async function getAllAccountCreationCodesAction(): Promise<
  DatabaseQueryResult<AdminActions_GetAccountCreationCodes_Result[]>
> {
  if (
    !(
      await checkForPermissions(
        Permission.UseApp_Admin,
        Permission.App_Admin_ManageAccountCreationCodes
      )
    ).success
  ) {
    return databaseQueryError("No permission.");
  }
  const getAllAccountCreationCodesQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getAllAccountCreationCodes,
    []
  );
  if (!getAllAccountCreationCodesQuery.success) {
    return getAllAccountCreationCodesQuery;
  }
  const allCodes: ServerAccountCreationCode[] =
    getAllAccountCreationCodesQuery.result;

  // Filter out invalid codes
  const onlyValidCodes = allCodes.filter(
    (x) => isAccountCreationCodeValid(x).valid
  );

  // Minimize data passed to client to only necessary data
  const minimizedDataAccountCreationCodes: (AdminActions_GetAccountCreationCodes_Result | null)[] =
    await Promise.all(
      onlyValidCodes.map(async (code) => {
        const permissions: AdminActions_GetAccountCreationCodes_Result_Permission[] =
          code.permission_ids
            .map((perm) => {
              const permission = assertIsPermission(perm);
              if (!permission) {
                return null;
              }
              return {
                name: perm,
                description: PERMISSION_DATA[permission].description,
                isPrivileged: PERMISSION_DATA[permission].isPrivileged,
              };
            })
            .filter((x) => x !== null);

        const getUserQuery = await executeDatabaseQuery(
          await getAccessTokenFromBrowser(),
          getUser,
          [code.creator_user_id]
        );
        if (!getUserQuery.success || !getUserQuery.result) {
          return null;
        }
        return {
          id: code.id,
          title: code.title,
          email: code.email,
          creationTimestamp: code.creation_timestamp,
          creatorUserId: getUserQuery.result.id,
          creatorUsername: getUserQuery.result.username,
          expirationTimestamp: code.expiration_timestamp,
          accountDefaultTokenExpirySeconds:
            code.account_default_token_expiry_seconds,
          permissions: permissions,
          onUsedEmailCreator: code.on_used_email_creator,
        };
      })
    );

  if (minimizedDataAccountCreationCodes.some((x) => x == null)) {
    return databaseQueryError("Couldn't get one or more users from code.");
  }

  return databaseQuerySuccess(
    minimizedDataAccountCreationCodes as AdminActions_GetAccountCreationCodes_Result[]
  ); // we check earlier that none of it is null, this is just so compiler doesn't shout
}

/**
 * Revokes an account creation code.
 */
export async function revokeAccountCreationCodeAction(
  id: string
): Promise<DatabaseQueryResult<void>> {
  if (
    !(
      await checkForPermissions(
        Permission.UseApp_Admin,
        Permission.App_Admin_ManageAccountCreationCodes
      )
    ).success
  ) {
    return databaseQueryError("No permission.");
  }

  const revokeAccountCreationCodeQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    revokeAccountCreationCode,
    [id, GET_USER_ID_FROM_ACCESS_TOKEN]
  );

  if (!revokeAccountCreationCodeQuery.success) {
    return {
      success: false,
      errorString: "Couldn't revoke account creation code.",
    };
  }

  return {
    success: true,
    result: undefined, // void
  };
}

/**
 * Removes a permission from an account creation code.
 */
export async function removePermissionFromAccountCreationCodeAction(
  id: string,
  permissionToRemove: string
): Promise<DatabaseQueryResult<void>> {
  if (
    !(
      await checkForPermissions(
        Permission.UseApp_Admin,
        Permission.App_Admin_ManageAccountCreationCodes
      )
    ).success
  ) {
    return databaseQueryError("No permission.");
  }

  // Validate permission is valid
  if (!assertIsKnownPermission(permissionToRemove)) {
    return databaseQueryError("Permission doesn't exist.");
  }

  // Validate account creation code is valid
  const getAccountCreationCodeQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getAccountCreationCode,
    [id]
  );
  if (!getAccountCreationCodeQuery.success) {
    return databaseQueryError("Couldn't remove permission.");
  }
  const accountCreationCode = getAccountCreationCodeQuery.result;
  if (!isAccountCreationCodeValid(accountCreationCode)) {
    return databaseQueryError("Couldn't remove permission.");
  }
  // Validate permission exists on code
  if (!accountCreationCode.permission_ids.includes(permissionToRemove)) {
    return databaseQueryError("Permission doesn't exist on code.");
  }

  // Finally, remove the permission
  const removePermissionFromAccountCreationCodeQuery =
    await executeDatabaseQuery(
      await getAccessTokenFromBrowser(),
      removePermissionFromAccountCreationCode,
      [id, permissionToRemove]
    );
  if (!removePermissionFromAccountCreationCodeQuery.success) {
    return { success: false, errorString: "Couldn't remove permission." };
  }

  return {
    success: true,
    result: undefined, // void
  };
}

/**
 * Adds a permission to an account creation code.
 */
export async function addPermissionToAccountCreationCodeAction(
  id: string,
  permissionToAdd: string
): Promise<DatabaseQueryResult<void>> {
  if (
    !(
      await checkForPermissions(
        Permission.UseApp_Admin,
        Permission.App_Admin_ManageAccountCreationCodes
      )
    ).success
  ) {
    return databaseQueryError("No permission.");
  }

  // Validate permission is valid
  if (!assertIsKnownPermission(permissionToAdd)) {
    return databaseQueryError("Permission doesn't exist.");
  }

  // Validate account creation code is valid
  const getAccountCreationCodeQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getAccountCreationCode,
    [id]
  );
  if (!getAccountCreationCodeQuery.success) {
    return databaseQueryError("Couldn't add permission.");
  }
  const accountCreationCode = getAccountCreationCodeQuery.result;
  if (!isAccountCreationCodeValid(accountCreationCode)) {
    return databaseQueryError("Couldn't add permission.");
  }
  // Validate permission doesn't exist on code
  if (accountCreationCode.permission_ids.includes(permissionToAdd)) {
    return databaseQueryError("Permission already exists on code.");
  }

  // Finally, add the permission
  const addPermissionToAccountCreationCodeQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    addPermissionToAccountCreationCode,
    [id, permissionToAdd]
  );
  if (!addPermissionToAccountCreationCodeQuery.success) {
    return { success: false, errorString: "Couldn't add permission." };
  }

  return {
    success: true,
    result: undefined, // void
  };
}

export async function addAccountCreationCodeAction(
  title: string,
  email: string,
  accountDefaultTokenExpirySeconds: number,
  permissionIds: string[],
  expirationTimestamp: Date,
  onUsedEmailCreator: boolean
): Promise<DatabaseQueryResult<void>> {
  if (
    !(
      await checkForPermissions(
        Permission.UseApp_Admin,
        Permission.App_Admin_ManageAccountCreationCodes
      )
    ).success
  ) {
    return databaseQueryError("No permission.");
  }

  // Validate account creation code is valid
  // TODO: validate email is real here
  if (email === "invalid") {
    return databaseQueryError("Invalid email argument.");
  }

  // Verify that VALID code with this email doesn't already exist (an invalid one could exist, that's fine.)
  const doesValidAccountCreationCodeWithThisEmailExistQuery =
    await executeDatabaseQuery(
      await getAccessTokenFromBrowser(),
      doesValidAccountCreationCodeWithThisEmailExist,
      [email]
    );
  if (!doesValidAccountCreationCodeWithThisEmailExistQuery.success) {
    return databaseQueryError("Couldn't create code.");
  }
  if (doesValidAccountCreationCodeWithThisEmailExistQuery.result == true) {
    return databaseQueryError(
      "Account creation code with this email already exists."
    );
  }

  // Verify that user with this email doesn't already exist
  const getUserByEmailQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getUserByEmail,
    [email]
  );
  if (!getUserByEmailQuery.success) {
    return databaseQueryError("Couldn't create code.");
  }
  if (getUserByEmailQuery.result != null) {
    return databaseQueryError("User with this email already exists.");
  }

  if (
    accountDefaultTokenExpirySeconds <= 0 ||
    accountDefaultTokenExpirySeconds > getSeconds(ExpiryUnit.YEARS, 1)
  ) {
    return databaseQueryError("Invalid default token expiry argument.");
  }

  const now = new Date();
  if (
    expirationTimestamp <= now ||
    (expirationTimestamp.getTime() - now.getTime()) / 1000 >
      getSeconds(ExpiryUnit.YEARS, 1)
  ) {
    return databaseQueryError("Invalid expiration date argument.");
  }

  if (title.length >= 20) {
    return databaseQueryError("Invalid title argument.");
  }

  // Generate random code
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  const id = uuidv4();

  const createAccountCreationCodeQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    createAccountCreationCode,
    [
      id,
      code,
      title,
      email,
      GET_USER_ID_FROM_ACCESS_TOKEN,
      accountDefaultTokenExpirySeconds,
      permissionIds,
      expirationTimestamp,
      onUsedEmailCreator,
    ]
  );
  if (!createAccountCreationCodeQuery.success) {
    return databaseQueryError("Couldn't create code.");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: `${process.env.SITE_NAME} <${process.env.EMAIL_SENDER_NAME}@${process.env.DOMAIN}>`,
    to: email,
    subject: `Invitation to join ${process.env.SITE_NAME}`,
    react: InvitationToJoinSiteEmail({
      code: code,
      codeExpirationTimestamp: expirationTimestamp,
    }),
  });
  if (error) {
    // todo: this is not ideal.
    return databaseQueryError("Created code but couldn't send email to user.");
  }

  return {
    success: true,
    result: undefined, // void
  };
}

export async function updateAccountCreationCodeAccountDefaultTokenExpiryAction(
  id: string,
  expirySeconds: number
): Promise<DatabaseQueryResult<void>> {
  if (
    !(
      await checkForPermissions(
        Permission.UseApp_Admin,
        Permission.App_Admin_ManageAccountCreationCodes
      )
    ).success
  ) {
    return databaseQueryError("No permission.");
  }

  // Validate expiry value is valid
  if (expirySeconds < 0 || expirySeconds > getSeconds(ExpiryUnit.YEARS, 1)) {
    return databaseQueryError("Invalid expiry seconds parameter.");
  }

  // Validate account creation code is valid
  const getAccountCreationCodeQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getAccountCreationCode,
    [id]
  );
  if (!getAccountCreationCodeQuery.success) {
    return databaseQueryError("Couldn't update default token expiry.");
  }

  // Finally, update the value
  const addPermissionToAccountCreationCodeQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    updateAccountCreationCodeAccountDefaultTokenExpiry,
    [id, expirySeconds]
  );
  if (!addPermissionToAccountCreationCodeQuery.success) {
    return {
      success: false,
      errorString: "Couldn't update default token expiry.",
    };
  }

  return {
    success: true,
    result: undefined, // void
  };
}

export async function updateAccountCreationCodeOnUsedEmailCreatorAction(
  id: string,
  emailCreator: boolean
): Promise<DatabaseQueryResult<void>> {
  if (
    !(
      await checkForPermissions(
        Permission.UseApp_Admin,
        Permission.App_Admin_ManageAccountCreationCodes
      )
    ).success
  ) {
    return databaseQueryError("No permission.");
  }

  // Validate account creation code is valid
  const getAccountCreationCodeQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getAccountCreationCode,
    [id]
  );
  if (!getAccountCreationCodeQuery.success) {
    return databaseQueryError("Couldn't update email setting.");
  }

  // Finally, update the value
  const addPermissionToAccountCreationCodeQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    updateAccountCreationCodeOnUsedEmailCreator,
    [id, emailCreator]
  );
  if (!addPermissionToAccountCreationCodeQuery.success) {
    return {
      success: false,
      errorString: "Couldn't update email setting.",
    };
  }

  return {
    success: true,
    result: undefined, // void
  };
}

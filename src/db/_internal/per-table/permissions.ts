import "server-only";

import { QueryResult } from "pg";
import { DALScope } from "@/src/db/dal";
import db from "@/src/db/db";

export enum Permission {
  UseApp_Gym = "use_app_gym",
  UseApp_BookKeeping = "use_app_book_keeping",
  UseApp_Expenses = "use_app_expenses",
  UseApp_Admin = "use_app_admin",
  UseApp_Car = "use_app_car",
  UseApp_Wanikani = "use_app_wanikani",
  UseApp_Obsidian = "use_app_obsidian",
  UseApp_Git = "use_app_git",

  App_Admin_ManageAccountCreationCodes = "app_admin:manage_account_creation_codes",
  App_Admin_SearchUsers = "app_admin:search_users",

  App_Admin_ManageUsers_DeleteUsers = "app_admin:manage_users:delete_users",
  App_Admin_ManageUsers_ManagePermissions = "app_admin:manage_users:manage_permissions",
  App_Admin_ManageUsers_BanUsers = "app_admin:manage_users:ban_users",
  App_Admin_ManageUsers_ManageAccessTokens = "app_admin:manage_users:manage_access_tokens",
}

export const PERMISSIONS_WITH_DESCRIPTIONS: Record<Permission, string> = {
  [Permission.UseApp_Gym]: "Allows usage of the gym app.",
  [Permission.UseApp_BookKeeping]: "Allows usage of the book keeping app.",
  [Permission.UseApp_Expenses]: "Allows usage of the expenses app.",
  [Permission.UseApp_Car]: "Allows usage of the car app.",
  [Permission.UseApp_Wanikani]: "Allows usage of the WaniKani app.",
  [Permission.UseApp_Obsidian]: "Allows usage of the Obsidian app.",
  [Permission.UseApp_Git]: "Allows usage of the Git app..",
  [Permission.UseApp_Admin]:
    "Allows usage of the admin app where the user can utilize the rest of their admin permissions. If just by itself, it doesn't really allow anything besides allowing access to an empty page.",

  [Permission.App_Admin_ManageAccountCreationCodes]:
    "Allows viewing, issuing and managing account creation codes. Coupled with the permission management permission, can add permissions to user immediately.",
  [Permission.App_Admin_SearchUsers]:
    "Allows searching users and accessing their data (including: basic user data, redacted access tokens, permissions).",

  [Permission.App_Admin_ManageUsers_DeleteUsers]:
    "Allows permanently deleting user accounts.",
  [Permission.App_Admin_ManageUsers_ManagePermissions]:
    "MOST DANGEROUS: Allows granting and revoking any permissions, including to yourself.",
  [Permission.App_Admin_ManageUsers_BanUsers]:
    "Allows banning and unbanning users.",
  [Permission.App_Admin_ManageUsers_ManageAccessTokens]:
    "Allows revoking and managing user access tokens.",
};

/**
 * Permission row as it exists in the database (raw).
 * Never use this outside of _internal.
 */
export interface DBPermissionRow {
  user_id: string;
  permission_name: string;
}

export interface ServerPermission {
  user_id: string;
  permission: Permission;
}

/**
 * Convert DB string value to enum.
 * Returns null if unknown permission (one that doesn't have enum value).
 */
export function assertIsPermission(value: string): Permission | null {
  if (Object.values(Permission).includes(value as Permission)) {
    return value as Permission;
  }
  return null;
}

/**
 * An authenticated query that gets all user's permissions (only known permissions that have an enum value in this file).
 *
 * @throws Error If the database query fails.
 */
export async function getUserPermissions(
  _scope: DALScope,
  userId: string
): Promise<ServerPermission[]> {
  try {
    const result: QueryResult<DBPermissionRow> =
      await db.query<DBPermissionRow>(
        `SELECT * FROM user_permissions WHERE user_id = $1`,
        [userId]
      );
    return result.rows
      .map((row) => {
        const permission = assertIsPermission(row.permission_name);
        if (!permission) return null;
        return {
          user_id: row.user_id,
          permission,
        };
      })
      .filter((x): x is ServerPermission => x !== null);
  } catch (error) {
    throw error;
  }
}

/**
 * An authenticated query that deletes a user's permission COMPLETELY from the database.
 *
 * @throws Error If the database query fails.
 */
export async function deleteUserPermission(
  _scope: DALScope,
  userId: string,
  permission: Permission
): Promise<void> {
  try {
    const result = await db.query(
      `DELETE FROM user_permissions WHERE user_id = $1 AND permission_name = $2;`,
      [userId, permission]
    );
    if (result.rowCount == 0) {
      throw Error("Permission does not exist.");
    }
  } catch (error) {
    throw error;
  }
}

import "server-only";

import { QueryResult } from "pg";
import { DALScope } from "@/src/db/dal";
import db from "@/src/db/db";

export enum PermissionCategory {
  App = "Use App",
  Admin = "Admin",
  IssuableOnlyBySystem = "IssuableOnlyBySystem",
}

export enum Permission {
  UseApp_Gym = "use_app_gym",
  UseApp_BookKeeping = "use_app_book_keeping",
  UseApp_Expenses = "use_app_expenses",
  UseApp_Admin = "use_app_admin",
  UseApp_Car = "use_app_car",
  UseApp_Wanikani = "use_app_wanikani",
  UseApp_Obsidian = "use_app_obsidian",
  UseApp_Git = "use_app_git",
  UseApp_TimeManagement = "use_app_time_management",

  App_Admin_ManageAccountCreationCodes = "app_admin:manage_account_creation_codes",
  App_Admin_SearchUsers = "app_admin:search_users",
  App_Admin_ManageUsers_DeleteUsers = "app_admin:manage_users:delete_users",
  App_Admin_ManageUsers_ManagePermissions = "app_admin:manage_users:manage_permissions",
  App_Admin_ManageUsers_BanUsers = "app_admin:manage_users:ban_users",
  App_Admin_ManageUsers_ManageAccessTokens = "app_admin:manage_users:manage_access_tokens",

  SUDO = "sudo",
}

export interface PermissionData {
  description: string;
  category: PermissionCategory;
  isPrivileged: boolean;
}

/** Permission metadata object */
export const PERMISSION_DATA: Record<Permission, PermissionData> = {
  [Permission.UseApp_Gym]: {
    description: "Allows usage of the gym app.",
    category: PermissionCategory.App,
    isPrivileged: false,
  },
  [Permission.UseApp_BookKeeping]: {
    description: "Allows usage of the book keeping app.",
    category: PermissionCategory.App,
    isPrivileged: false,
  },
  [Permission.UseApp_Expenses]: {
    description: "Allows usage of the expenses app.",
    category: PermissionCategory.App,
    isPrivileged: false,
  },
  [Permission.UseApp_Car]: {
    description: "Allows usage of the car app.",
    category: PermissionCategory.App,
    isPrivileged: false,
  },
  [Permission.UseApp_Wanikani]: {
    description: "Allows usage of the WaniKani app.",
    category: PermissionCategory.App,
    isPrivileged: false,
  },
  [Permission.UseApp_Obsidian]: {
    description: "Allows usage of the Obsidian app.",
    category: PermissionCategory.App,
    isPrivileged: false,
  },
  [Permission.UseApp_Git]: {
    description: "Allows usage of the Git app.",
    category: PermissionCategory.App,
    isPrivileged: false,
  },
  [Permission.UseApp_TimeManagement]: {
    description: "Allows usage of the time management app.",
    category: PermissionCategory.App,
    isPrivileged: false,
  },
  [Permission.UseApp_Admin]: {
    description:
      "Allows usage of the admin app where the user can utilize other admin permissions.",
    category: PermissionCategory.Admin,
    isPrivileged: true,
  },

  [Permission.App_Admin_ManageAccountCreationCodes]: {
    description: "Allows viewing, issuing and managing account creation codes.",
    category: PermissionCategory.Admin,
    isPrivileged: true,
  },
  [Permission.App_Admin_SearchUsers]: {
    description:
      "Allows searching users and accessing their data (basic info, redacted access tokens, permissions).",
    category: PermissionCategory.Admin,
    isPrivileged: true,
  },

  [Permission.App_Admin_ManageUsers_DeleteUsers]: {
    description: "Allows permanently deleting user accounts (excluding self).",
    category: PermissionCategory.Admin,
    isPrivileged: true,
  },
  [Permission.App_Admin_ManageUsers_ManagePermissions]: {
    description:
      "Allows granting and revoking ANY permissions to ANYONE (excluding self).",
    category: PermissionCategory.Admin,
    isPrivileged: true,
  },
  [Permission.App_Admin_ManageUsers_BanUsers]: {
    description: "Allows banning and unbanning users (including self).",
    category: PermissionCategory.Admin,
    isPrivileged: true,
  },
  [Permission.App_Admin_ManageUsers_ManageAccessTokens]: {
    description:
      "Allows revoking and managing user access tokens (including self).",
    category: PermissionCategory.Admin,
    isPrivileged: true,
  },

  [Permission.SUDO]: {
    description: "Any permission check wil succeed.",
    category: PermissionCategory.IssuableOnlyBySystem,
    isPrivileged: true,
  },
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
  userId: string,
): Promise<ServerPermission[]> {
  const result: QueryResult<DBPermissionRow> = await db.query<DBPermissionRow>(
    `SELECT * FROM user_permissions WHERE user_id = $1`,
    [userId],
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
}

/**
 * An authenticated query that deletes a user's permission COMPLETELY from the database.
 *
 * @throws Error If the database query fails.
 */
export async function deleteUserPermission(
  _scope: DALScope,
  userId: string,
  permission: Permission,
): Promise<void> {
  const result = await db.query(
    `DELETE FROM user_permissions WHERE user_id = $1 AND permission_name = $2;`,
    [userId, permission],
  );
  if (result.rowCount == 0) {
    throw Error("Permission does not exist.");
  }
}

/**
 * An authenticated query that adds a permissin to a user.
 *
 * @throws Error If the database query fails.
 */
export async function addUserPermission(
  _scope: DALScope,
  userId: string,
  permission: Permission,
): Promise<void> {
  await db.query(
    `INSERT INTO user_permissions (
        user_id,
        permission_name
      )
      VALUES (
        $1, $2
      );`,
    [userId, permission],
  );
}

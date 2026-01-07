import "server-only";

import { Suspense } from "react";
import {
  AdminActions_GetUser_Result,
  AdminActions_GetUser_Result_Permission,
  getAllUsersAction,
  getUserAction,
} from "@/src/actions/per-page/admin";
import { getUserPermissionsAction } from "@/src/actions/permissions";
import UserManagementUser from "@/src/components/admin/user-management/user/User";
import {
  assertIsPermission,
  Permission,
  PERMISSION_DATA,
} from "@/src/db/_internal/per-table/permissions";
import {
  databaseQueryError,
  DatabaseQueryResult,
  databaseQuerySuccess,
} from "@/src/db/dal";

export default async function UserPage({
  params,
}: {
  params: { userId: string };
}) {
  const { userId } = await params;
  return (
    <section>
      <Suspense
        fallback={
          <UserManagementUser
            user={null}
            loading={true}
            errorString=""
            canManagePermissions={false}
            availablePermissions={{}}
            userPermissions={{}}
          />
        }
      >
        <UserDataLoader userId={userId} />
      </Suspense>
    </section>
  );
}

export interface PermissionData {
  description: string;
  category: string;
  isPrivileged: boolean;
}

async function UserDataLoader({ userId }: { userId: string }) {
  const getUserActionPromise = getUserAction(userId);
  const getAdminUserPermissionsActionPromise = getUserPermissionsAction();
  const [getUserActionResult, getAdminUserPermissionsActionResult] =
    await Promise.all([
      getUserActionPromise,
      getAdminUserPermissionsActionPromise,
    ]);

  let availablePermissions: Record<string, PermissionData> = {};
  let canManagePermissions = false;
  let canManagePermissionsLite = false;
  if (getAdminUserPermissionsActionResult.success) {
    const adminUserPermissions = getAdminUserPermissionsActionResult.result;
    canManagePermissions = adminUserPermissions.some(
      (x) => x.name === Permission.App_Admin_ManageUsers_ManagePermissions
    );

    if (canManagePermissions) {
      availablePermissions = Object.fromEntries(
        Object.entries(PERMISSION_DATA).map(([permissionKey, data]) => [
          permissionKey,
          {
            description: data.description,
            category: data.category,
            isPrivileged: data.isPrivileged,
          },
        ])
      );
    }
  }

  let userPermissions: Record<string, PermissionData> = {};
  if (getUserActionResult.success) {
    userPermissions = getExpandedPermissionData(
      getUserActionResult.result.permissions
    );
  }

  return (
    <UserManagementUser
      user={getUserActionResult.success ? getUserActionResult.result : null}
      loading={false}
      errorString={
        getUserActionResult.success ? "" : getUserActionResult.errorString
      }
      canManagePermissions={canManagePermissions || canManagePermissionsLite}
      availablePermissions={availablePermissions}
      userPermissions={userPermissions}
    />
  );
}

function getExpandedPermissionData(
  permissions: AdminActions_GetUser_Result_Permission[]
): Record<string, PermissionData> {
  return Object.fromEntries(
    permissions
      .map(({ permission, description }) => {
        const permissionEnum = assertIsPermission(permission);
        if (!permissionEnum) return null;

        const permissionMeta = PERMISSION_DATA[permissionEnum];

        return [
          permission,
          {
            description: description || permissionMeta?.description || "",
            category: permissionMeta?.category || "Unknown",
            isPrivileged: permissionMeta?.isPrivileged || false,
          },
        ] as [string, PermissionData];
      })
      .filter(Boolean) as [string, PermissionData][] // remove nulls producted by assertIsPermission being null (should never happen in theory)
  );
}

async function fetchUserPermissions(): Promise<
  DatabaseQueryResult<Record<string, PermissionData>>
> {
  const getUserActionResult = await getUserAction("");
  if (!getUserActionResult.success) {
    return databaseQueryError("Couldn't get permissions.");
  }
  return databaseQuerySuccess(
    getExpandedPermissionData(getUserActionResult.result.permissions)
  );
}

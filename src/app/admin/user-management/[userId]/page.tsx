import "server-only";

import { Suspense } from "react";
import {
  AdminActions_GetUser_Result_Permission,
  getAllUsersAction,
  getUserAction,
} from "@/src/actions/per-page/admin";
import { getUserPermissionsAction } from "@/src/actions/permissions";
import UserManagementUser from "@/src/components/admin/user-management/user/User";
import {
  Permission,
  PERMISSIONS_WITH_DESCRIPTIONS,
} from "@/src/db/_internal/per-table/permissions";

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
            availablePermissions={[]}
          />
        }
      >
        <UserDataLoader userId={userId} />
      </Suspense>
    </section>
  );
}

async function UserDataLoader({ userId }: { userId: string }) {
  const getUserActionPromise = getUserAction(userId);
  const getAdminUserPermissionsActionPromise = getUserPermissionsAction();
  const [getUserActionResult, getAdminUserPermissionsActionResult] =
    await Promise.all([
      getUserActionPromise,
      getAdminUserPermissionsActionPromise,
    ]);

  // Get the permissions the admin can hand out to users
  let availablePermissions: AdminActions_GetUser_Result_Permission[] = [];
  let canManagePermissions = false;
  let canManagePermissionsLite = false;
  if (getAdminUserPermissionsActionResult.success) {
    const adminUserPermissions = getAdminUserPermissionsActionResult.result;
    canManagePermissions = adminUserPermissions.some(
      (x) => x.name === Permission.App_Admin_ManageUsers_ManagePermissions
    );

    if (canManagePermissions) {
      availablePermissions = Object.entries(PERMISSIONS_WITH_DESCRIPTIONS).map(
        ([permission, description]) => ({
          permission: permission,
          description: description,
        })
      );
    }
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
    />
  );
}

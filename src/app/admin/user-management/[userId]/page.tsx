import { Suspense } from "react";
import { getAllUsersAction, getUserAction } from "@/src/actions/per-page/admin";
import { getUserPermissionsAction } from "@/src/actions/permissions";
import UserManagementUser from "@/src/components/admin/user-management/user/User";

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
            canManageUsers={false}
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
  const getUserPermissionsActionPromise = getUserPermissionsAction();
  const [getUserActionResult, getAllUserPermissionsActionResult] =
    await Promise.all([getUserActionPromise, getUserPermissionsActionPromise]);

  const canManageUsers =
    getAllUserPermissionsActionResult.success &&
    getAllUserPermissionsActionResult.result.some((x) =>
      x.permissionName.startsWith("app_admin:admin_manage_users:")
    );
  return (
    <UserManagementUser
      user={getUserActionResult.success ? getUserActionResult.result : null}
      loading={false}
      errorString={
        getUserActionResult.success ? "" : getUserActionResult.errorString
      }
      canManageUsers={canManageUsers}
    />
  );
}

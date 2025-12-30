import { Suspense } from "react";
import { v4 as uuidv4 } from "uuid";
import { getAllUsersAction } from "@/src/actions/per-page/admin";
import { getUserPermissionsAction } from "@/src/actions/permissions";
import UserManagement from "@/src/components/admin/user-management/UserManagement";

export default function UserSettings() {
  return (
    <section>
      <Suspense
        fallback={
          <UserManagement
            users={null}
            loading={true}
            errorString=""
            canManageUsers={false}
          />
        }
      >
        <UserDataLoader />
      </Suspense>
    </section>
  );
}

async function UserDataLoader() {
  const getAllUsersActionPromise = getAllUsersAction();
  const getUserPermissionsActionPromise = getUserPermissionsAction();
  const [getAllUsersActionResult, getAllUserPermissionsActionResult] =
    await Promise.all([
      getAllUsersActionPromise,
      getUserPermissionsActionPromise,
    ]);

  const canManageUsers =
    getAllUserPermissionsActionResult.success &&
    getAllUserPermissionsActionResult.result.some((x) =>
      x.permissionName.startsWith("app_admin:admin_manage_users:")
    );

  return (
    <UserManagement
      users={
        getAllUsersActionResult.success ? getAllUsersActionResult.result : null
      }
      loading={false}
      errorString={
        getAllUsersActionResult.success
          ? ""
          : getAllUsersActionResult.errorString
      }
      canManageUsers={canManageUsers}
    />
  );
}

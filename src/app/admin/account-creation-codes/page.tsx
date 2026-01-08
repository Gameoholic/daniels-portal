import "server-only";

import { Suspense } from "react";
import { v4 as uuidv4 } from "uuid";
import { getAllUsersAction } from "@/src/actions/per-page/admin";
import { getUserPermissionsAction } from "@/src/actions/permissions";
import UserManagement from "@/src/components/admin/user-management/UserManagement";
import { Permission } from "@/src/db/_internal/per-table/permissions";

export default function UserSettings() {
  return (
    <section>
      <Suspense
        fallback={<UserManagement users={null} loading={true} errorString="" />}
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

  if (!getAllUserPermissionsActionResult.success) {
    return null; // todo, this is a hacky quick fix
  }

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
    />
  );
}

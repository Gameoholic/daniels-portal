import "server-only";

import { Suspense } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  getAllAccountCreationCodesAction,
  getAllUsersAction,
} from "@/src/actions/per-page/admin";
import { getUserPermissionsAction } from "@/src/actions/permissions";
import UserManagement from "@/src/components/admin/user-management/UserManagement";
import {
  Permission,
  PERMISSION_DATA,
  PermissionData,
} from "@/src/db/_internal/per-table/permissions";
import AccountCreationCodes from "@/src/components/admin/account-creation-codes/AccountCreationCodes";

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
  const getAllAccountCreationCodesActionResult =
    await getAllAccountCreationCodesAction();

  console.log("debug a");
  if (!getAllAccountCreationCodesActionResult.success) {
    return null; // todo, this is a hacky quick fix
  }
  console.log("debug b");
  let availablePermissions: Record<string, PermissionData> = {};
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
  console.log("debug c");

  return (
    <AccountCreationCodes
      accountCreationCodes={
        getAllAccountCreationCodesActionResult.success
          ? getAllAccountCreationCodesActionResult.result
          : null
      }
      availablePermissions={availablePermissions}
      loading={false}
      errorString={""}
    />
  );
}

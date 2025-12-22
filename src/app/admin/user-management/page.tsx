import { Suspense } from "react";
import { ClientUser } from "@/src/utils/client_types";
import { v4 as uuidv4 } from "uuid";
import UserManagement from "@/src/components/admin/UserManagement";
import { getAllUsersAction } from "@/src/actions/old/admin";
import { requestGetAllUsers } from "@/src/utils/db/auth/db_actions";

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
  const userAction = await getAllUsersAction();
  return (
    <UserManagement
      users={userAction.success ? userAction.result : null}
      loading={false}
      errorString={userAction.success ? "" : userAction.errorString}
    />
  );
}

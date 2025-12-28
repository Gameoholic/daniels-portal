import { Suspense } from "react";
import { v4 as uuidv4 } from "uuid";
import UserManagement from "@/src/components/admin/UserManagement";
import { getAllUsersAction } from "@/src/actions/per-page/admin";

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

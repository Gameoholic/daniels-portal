import { getAllUsers, ServerUser } from "@/src/db/_internal/per-table/users";
import {
  checkForPermission,
  checkForPermissions,
  databaseQueryError,
  DatabaseQueryResult,
  databaseQuerySuccess,
  executeDatabaseQuery,
  GET_USER_ID_FROM_ACCESS_TOKEN,
  getAccessTokenFromBrowser,
} from "@/src/db/dal";

export interface AdminActions_GetUsers_Result {
  id: string;
  username: string;
  email: string;
  creationTimestamp: Date;
  lastLoginTimestamp: Date | null;
  defaultTokenExpirySeconds: number;
  maxTokensAtATime: number | null;
}
/**
 * @returns User.
 */
export async function getAllUsersAction(): Promise<
  DatabaseQueryResult<AdminActions_GetUsers_Result[]>
> {
  if (
    !(await checkForPermissions("use_app_admin", "admin_search_users")).success
  ) {
    return databaseQueryError("No permission.");
  }

  const getAllUsersQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getAllUsers,
    []
  );
  if (!getAllUsersQuery.success) {
    return getAllUsersQuery;
  }

  const users: ServerUser[] = getAllUsersQuery.result;

  // Minimize data passed to client to only necessary data
  const minimizedDataUsers: AdminActions_GetUsers_Result[] = users.map((x) => ({
    id: x.id,
    username: x.username,
    email: x.email,
    creationTimestamp: x.creation_timestamp,
    lastLoginTimestamp: x.last_login_timestamp,
    defaultTokenExpirySeconds: x.default_token_expiry_seconds,
    maxTokensAtATime: x.max_tokens_at_a_time,
  }));

  return databaseQuerySuccess(minimizedDataUsers);
}

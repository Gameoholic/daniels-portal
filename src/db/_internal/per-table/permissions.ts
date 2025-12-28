import "server-only";

import { QueryResult } from "pg";
import { DALScope } from "@/src/db/dal";
import db from "@/src/db/db";

export interface ServerPermission {
  user_id: string;
  permission_name: string;
}

/**
 * An authenticated query that gets all user's permissions.
 *
 * @throws Error If the database query fails.
 */
export async function getUserPermissions(
  _scope: DALScope,
  userId: string
): Promise<ServerPermission[]> {
  try {
    const result: QueryResult<ServerPermission> =
      await db.query<ServerPermission>(
        `
        SELECT * FROM user_permissions WHERE user_id = $1
      `,
        [userId]
      );
    return result.rows;
  } catch (error) {
    throw error;
  }
}

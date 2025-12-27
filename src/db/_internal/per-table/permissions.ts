import "server-only";

import { QueryResult } from "pg";
import { DALScope } from "@/src/db/dal";
import db from "@/src/db/db";

export interface ServerPermission {
  user_id: string;
  permission_name: string;
}

export async function getUserPermissions(
  _scope: DALScope,
  requesterUserId: string
): Promise<ServerPermission[]> {
  try {
    const result: QueryResult<ServerPermission> =
      await db.query<ServerPermission>(
        `
        SELECT * FROM user_permissions WHERE user_id = $1
      `,
        [requesterUserId]
      );
    return result.rows;
  } catch (error) {
    throw error;
  }
}

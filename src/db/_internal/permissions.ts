import "server-only";

import { ServerPermission } from "./server_types";
import { QueryResult } from "pg";
import db from "../db";
import { SecureDBScope } from "../dal";

export async function getUserPermissions(
  _scope: SecureDBScope,
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

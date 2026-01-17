import { DALScope } from "@/src/db/dal";
import db from "@/src/db/db";
import { QueryResult } from "pg";

export interface ServerTimeManagementActivity {
  id: string;
  user_id: string;
  name: string;
  percentage: number;
}

/**
 * An authenticated query that adds an activity.
 *
 * @throws Error If the database query fails.
 */
export async function addTimeManagementActivity(
  _scope: DALScope,
  id: string,
  userId: string,
  name: string,
  percentage: number
): Promise<void> {
  await db.query(
    `INSERT INTO time_management_activities (
        id,
        user_id,
        name,
        percentage
      )
      VALUES (
        $1, $2, $3, $4
      );`,
    [id, userId, name, percentage]
  );
}

/**
 * An authenticated query that gets all user's activites.
 *
 * @throws Error If the database query fails.
 * @returns The user's expenses ordered by timestamp.
 */
export async function getUserTimeManagementActivities(
  _scope: DALScope,
  userId: string
): Promise<ServerTimeManagementActivity[]> {
  const result: QueryResult<ServerTimeManagementActivity> =
    await db.query<ServerTimeManagementActivity>(
      "SELECT * FROM time_management_activities WHERE user_id = $1",
      [userId]
    );

  return result.rows;
}

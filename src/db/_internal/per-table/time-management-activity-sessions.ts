import { DALScope } from "@/src/db/dal";
import db from "@/src/db/db";
import { QueryResult } from "pg";

export interface ServerTimeManagementActivitySession {
  id: string;
  user_id: string;
  activity_id: string;
  start_timestamp: Date;
  end_timestamp: Date | null;
}

/**
 * An authenticated query that adds a session of an activity.
 *
 * @throws Error If the database query fails.
 */
export async function addTimeManagementActivitySession(
  _scope: DALScope,
  id: string,
  userId: string,
  activityId: string,
  startTimestamp: Date,
  endTimestamp: Date | null
): Promise<void> {
  await db.query(
    `INSERT INTO time_management_activity_sessions (
        id,
        user_id,
        activity_id,
        start_timestamp,
        end_timestamp
      )
      VALUES (
        $1, $2, $3, $4, $5
      );`,
    [id, userId, activityId, startTimestamp, endTimestamp]
  );
}

/**
 * An authenticated query that gets all user's activites.
 *
 * @throws Error If the database query fails.
 * @returns The user's expenses ordered by timestamp.
 */
export async function getUserTimeManagementActivitySessions(
  _scope: DALScope,
  userId: string
): Promise<ServerTimeManagementActivitySession[]> {
  const result: QueryResult<ServerTimeManagementActivitySession> =
    await db.query<ServerTimeManagementActivitySession>(
      "SELECT * FROM time_management_activity_sessions WHERE user_id = $1",
      [userId]
    );

  return result.rows;
}

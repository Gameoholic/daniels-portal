import { QueryResult } from "pg";
import { DALScope } from "@/src/db/dal";
import { v4 as uuidv4 } from "uuid";
import db from "@/src/db/db";

export interface ServerGymWeight {
  id: string;
  user_id: string;
  timestamp: Date;
  weight: number;
  deletion_timestamp: Date | null;
  last_edited_timestamp: Date | null;
  last_accessed_timestamp: Date;
  creation_timestamp: Date;
}

/**
 * An authenticated query that updates the gym weights of a user, ordered by timestamp.
 *
 * @throws Error If the database query fails.
 */
export async function getGymWeights(
  _scope: DALScope,
  userId: string
): Promise<ServerGymWeight[]> {
  try {
    const result: QueryResult<ServerGymWeight> =
      await db.query<ServerGymWeight>(
        "SELECT * FROM gym_weights WHERE user_id = $1 ORDER BY timestamp ASC",
        [userId]
      );
    return result.rows;
  } catch (error) {
    throw error;
  }
}

/**
 * An authenticated query that adds a gym weight. Sets a unique ID for the weight entry and sets the creation and last accessed timestamps to now.
 *
 * @throws Error If the database query fails.
 */
export async function addGymWeight(
  _scope: DALScope,
  userId: string,
  weight: number,
  timestamp: Date
) {
  try {
    const now = new Date();
    await db.query(
      `INSERT INTO gym_weights (
        id,
        user_id,
        timestamp,
        weight,
        deletion_timestamp,
        last_edited_timestamp,
        last_accessed_timestamp,
        creation_timestamp
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      );`,
      [uuidv4(), userId, timestamp, weight, null, null, now, now]
    );
  } catch (error) {
    throw error;
  }
}

// export async function deleteGymWeight(
//   _scope: DALScope,
//   weight: ServerGymWeight
// ) {
//   try {
//     const result = await db.query(
//       `DELETE FROM gym_weight WHERE user_id = $1 AND timestamp = $2 AND amount = $3;`,
//       [weight.user_id, weight.timestamp, weight.amount]
//     );
//     if (result.rowCount == 0) {
//       throw Error("Weight does not exist.");
//     }
//   } catch (error) {
//     console.error("Error deleting weight:", error);
//     throw error;
//   }
// }
// todo: replace the above with deletion_timestamp

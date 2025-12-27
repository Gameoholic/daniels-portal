import { QueryResult } from "pg";
import { DALScope } from "@/src/db/dal";
import db from "@/src/db/db";

export interface ServerGymWeight {
  user_id: string;
  amount: number;
  timestamp: Date;
}

/**
 * @returns The gym weights ordered by timestamp.
 */
export async function getGymWeights(
  _scope: DALScope,
  requesterUserId: string
): Promise<ServerGymWeight[]> {
  try {
    const result: QueryResult<ServerGymWeight> =
      await db.query<ServerGymWeight>(
        "SELECT * FROM gym_weight WHERE user_id = $1 ORDER BY timestamp ASC",
        [requesterUserId]
      );

    return result.rows;
  } catch (error) {
    throw error;
  }
}

/**
 * Does NOT check whether the requester user id is the owner of the weight - CHECK BEFORE RUNNING.
 */
export async function addGymWeight(
  _scope: DALScope,
  _requesterUserId: string,
  weight: ServerGymWeight
) {
  try {
    await db.query(
      `INSERT INTO gym_weight (
        user_id,
        amount,
        timestamp
      )
      VALUES (
        $1, $2, $3
      );`,
      [weight.user_id, weight.amount, weight.timestamp]
    );
  } catch (error) {
    console.error("Error inserting weight:", error);
    throw error;
  }
}

/**
 * Does NOT check whether the requester user id is the owner of the weight - CHECK BEFORE RUNNING.
 */
export async function deleteGymWeight(
  _scope: DALScope,
  _requesterUserId: string,
  weight: ServerGymWeight
) {
  try {
    const result = await db.query(
      `DELETE FROM gym_weight WHERE user_id = $1 AND timestamp = $2 AND amount = $3;`,
      [weight.user_id, weight.timestamp, weight.amount]
    );
    if (result.rowCount == 0) {
      throw Error("Weight does not exist.");
    }
  } catch (error) {
    console.error("Error deleting weight:", error);
    throw error;
  }
}

// todo: replace the above with deletion_timestamp, and add an update gym weight query

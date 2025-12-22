// import "server-only";

// import type { ServerExpense, ServerGymWeight } from "@/src/utils/server_types";
// import { QueryResult } from "pg";
// import db from "@/src/utils/db/db";

// export async function getGymWeights(
//   userId: string
// ): Promise<ServerGymWeight[]> {
//   try {
//     const result: QueryResult<ServerGymWeight> =
//       await db.query<ServerGymWeight>(
//         "SELECT * FROM gym_weight WHERE user_id = $1 ORDER BY timestamp ASC",
//         [userId]
//       );

//     return result.rows;
//   } catch (error) {
//     throw error;
//   }
// }

// export async function addGymWeight(weight: ServerGymWeight) {
//   try {
//     await db.query(
//       `INSERT INTO gym_weight (
//         user_id,
//         amount,
//         timestamp
//       )
//       VALUES (
//         $1, $2, $3
//       );`,
//       [weight.user_id, weight.amount, weight.timestamp]
//     );
//   } catch (error) {
//     console.error("Error inserting weight:", error);
//     throw error;
//   }
// }

// export async function deleteGymWeight(weight: ServerGymWeight) {
//   try {
//     const result = await db.query(
//       `DELETE FROM gym_weight WHERE user_id = $1 AND timestamp = $2 AND amount = $3;`,
//       [weight.user_id, weight.timestamp, weight.amount]
//     );
//     if (result.rowCount == 0) {
//       // TODO: add these checks to all db_queries.ts including auth for example logging account, everything that modifies or deletes.
//       throw Error("Weight does not exist.");
//     }
//   } catch (error) {
//     console.error("Error deleting weight:", error);
//     throw error;
//   }
// }

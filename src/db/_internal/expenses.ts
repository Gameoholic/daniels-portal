import { QueryResult } from "pg";
import db from "../db";
import { ServerExpense } from "./server_types";
import { SecureDBScope } from "../dal";

/**
 * @returns The user's expenses ordered by timestamp.
 */
export async function getExpenses(
  _scope: SecureDBScope,
  requesterUserId: string
): Promise<ServerExpense[]> {
  try {
    const result: QueryResult<ServerExpense> = await db.query<ServerExpense>(
      "SELECT * FROM expenses WHERE user_id = $1 ORDER BY timestamp ASC",
      [requesterUserId]
    );

    return result.rows;
  } catch (error) {
    throw error;
  }
}

import { QueryResult } from "pg";
import { DALScope } from "@/src/db/dal";
import db from "@/src/db/db";

export interface ServerExpense {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  amount: number;
  payment_method: string;
  subscription_id: string | null;
  reimbursement_expected_amount: number;
  reimbursement_notes: string;
  reimbursement_income_ids: string[];
  timestamp: Date;
  deletion_timestamp: Date | null;
  last_edited_timestamp: Date | null;
  last_accessed_timestamp: Date;
  creation_timestamp: Date;
}

/**
 * An authenticated query that gets all user's expenses, EVEN DELETED ONES.
 *
 * @throws Error If the database query fails.
 * @returns The user's expenses ordered by timestamp.
 */
export async function getUserExpenses(
  _scope: DALScope,
  userId: string
): Promise<ServerExpense[]> {
  try {
    const result: QueryResult<ServerExpense> = await db.query<ServerExpense>(
      "SELECT * FROM expenses WHERE user_id = $1 ORDER BY timestamp ASC",
      [userId]
    );

    return result.rows;
  } catch (error) {
    throw error;
  }
}

import "server-only";

import type { ServerExpense } from "@/src/utils/server_types";
import { QueryResult } from "pg";
import db from "@/src/utils/db/db";

// THIS FUNCTION SOHULD ONLY BE CALLED AFTER USER'S VERIFICATION CODE IDENTIFIED, FOR EVERY SQL QUERY. NOT JUST ONCE.
// ALSO, MAKE SURE EVERYTHING IS RENDERED SERVERSIDE
export async function getExpenses(userId: string): Promise<ServerExpense[]> {
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

export async function addExpense(expense: ServerExpense) {
  try {
    await db.query(
      `INSERT INTO expenses (
        id,
        user_id,
        title,
        description,
        category,
        amount,
        payment_method,
        subscription_id,
        reimbursement_expected_amount,
        reimbursement_notes,
        reimbursement_income_ids,
        timestamp,
        deletion_timestamp,
        last_edited_timestamp,
        last_accessed_timestamp,
        creation_timestamp
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16
      );`,
      [
        expense.id,
        expense.user_id,
        expense.title,
        expense.description,
        expense.category,
        expense.amount,
        expense.payment_method,
        expense.subscription_id,
        expense.reimbursement_expected_amount,
        expense.reimbursement_notes,
        expense.reimbursement_income_ids,
        expense.timestamp,
        expense.deletion_timestamp,
        expense.last_edited_timestamp,
        expense.last_accessed_timestamp,
        expense.creation_timestamp,
      ]
    );
  } catch (error) {
    console.error("Error inserting expense:", error);
    throw error;
  }
}

// export async function deleteFile(path: string) {
//   try {
//     await db.query("DELETE FROM files WHERE path = $1", [path]);
//   } catch (error) {
//     throw error;
//   }
// }

// export async function toggleTodo(id: number): Promise<Todo | null> {
//   try {
//     const result = await db.query<Todo>(
//       "UPDATE todo SET is_done = NOT is_done WHERE id = $1 RETURNING *",
//       [id],
//     );
//     revalidatePath("/");
//     return result.rows[0];
//   } catch (error) {
//     console.error("Error toggling todo:", error);
//     return null;
//   }
// }

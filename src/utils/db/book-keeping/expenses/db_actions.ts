// import "server-only";

// import {
//   ServerExpense,
//   ServerDatabaseQueryResult,
// } from "@/src/utils/server_types";
// import {
//   addExpense,
//   getExpenses,
// } from "@/src/utils/db/book-keeping/expenses/db_queries";
// import { requestGetAccessToken } from "../../auth/db_actions";
// import { executeDatabaseQuery } from "@/src/utils/db/db";

// export async function requestGetExpenses(
//   userId: string
// ): Promise<ServerDatabaseQueryResult<ServerExpense[]>> {
//   return await executeDatabaseQuery(() => getExpenses(userId), {});
// }

// export async function requestAddExpense(
//   expense: ServerExpense
// ): Promise<ServerDatabaseQueryResult<void>> {
//   return await executeDatabaseQuery(() => addExpense(expense));
// }

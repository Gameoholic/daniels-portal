"use server"; // All server actions must have this, turns this into callable from client. Otherwise, it turns into import("server-only") and then it's inaccessible to client
import {
  getExpenses,
  ServerExpense,
} from "@/src/db/_internal/per-table/expenses";
import {
  checkForPermission,
  DatabaseQueryResult,
  executeDatabaseQuery,
  getAccessTokenFromBrowser,
} from "../../db/dal";

import { cookies } from "next/headers";

export interface ExpensesActions_GetUserExpenses_Result {
  id: string;
  title: string;
  description: string;
  category: string;
  amount: number;
  paymentMethod: string;
  subscriptionId: string | null;
  reimbursementExpectedAmount: number;
  reimbursementNotes: string;
  reimbursementIncomeIds: string[];
  timestamp: Date;
}
/**
 * @returns User.
 */
export async function getUserExpensesAction(): Promise<
  DatabaseQueryResult<ExpensesActions_GetUserExpenses_Result[]>
> {
  checkForPermission("use_app_book_keeping");

  const getUserQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getExpenses,
    []
  );
  if (!getUserQuery.success) {
    return getUserQuery;
  }

  const expenses: ServerExpense[] = getUserQuery.result;
  // todo: update last accessed timestamp for the expense. and somewhere else- also the last edited etc.

  // Minimize data passed to client to only necessary data
  const minimizedDataExpenses: ExpensesActions_GetUserExpenses_Result[] =
    expenses.map((x) => ({
      id: x.id,
      title: x.title,
      description: x.description,
      category: x.category,
      amount: x.amount,
      paymentMethod: x.payment_method,
      subscriptionId: x.subscription_id,
      reimbursementExpectedAmount: x.reimbursement_expected_amount,
      reimbursementNotes: x.reimbursement_notes,
      reimbursementIncomeIds: x.reimbursement_income_ids,
      timestamp: x.timestamp,
    }));

  return {
    success: true,
    result: minimizedDataExpenses,
  };
}

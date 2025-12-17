"use server"; // All actions must have this, turns this into callable from client. Otherwise, it turns into import("server-only") and then it's inaccessible to client

// TODO lots of boilerplate code here. Move all of it to a global db_actions or something. With all the token checks there

import {
  requestAddExpense,
  requestGetExpenses,
} from "@/src/utils/db/book-keeping/expenses/db_actions";
import {
  ClientDatabaseQueryResult,
  ClientExpense,
} from "@/src/utils/client_types";
import { ServerAccessToken, ServerExpense } from "@/src/utils/server_types";
import { requestGetAccessToken } from "@/src/utils/db/auth/db_actions";
import { cache } from "react";
import { cookies } from "next/headers";
import { getAndVerifyAccessToken } from "./auth";

export async function getExpensesAction(): Promise<
  ClientDatabaseQueryResult<ClientExpense[]>
> {
  // Verify access token, get user ID from it
  const getAccessTokenRequest = await getAndVerifyAccessToken();
  if (!getAccessTokenRequest.success) {
    return getAccessTokenRequest;
  }
  const userId: string = getAccessTokenRequest.result.user_id;

  // Perform server-side request
  const getExpensesRequest = await requestGetExpenses(userId);

  // Convert server-types to client-types for safety, abstract away unneeded stuff
  if (!getExpensesRequest.success) {
    return {
      success: false,
      errorString: getExpensesRequest.errorString,
    };
  }
  return {
    success: true,
    result: getExpensesRequest.result.map((serverExpense) => ({
      id: serverExpense.id,
      title: serverExpense.title,
      description: serverExpense.description,
      category: serverExpense.category,
      amount: serverExpense.amount,
      paymentMethod: serverExpense.payment_method,
      subscriptionId: serverExpense.subscription_id,
      reimbursementExpectedAmount: serverExpense.reimbursement_expected_amount,
      reimbursementNotes: serverExpense.reimbursement_notes,
      reimbursementIncomeIds: serverExpense.reimbursement_income_ids,
      timestamp: serverExpense.timestamp,
      lastEditedTimestamp: serverExpense.last_edited_timestamp,
      lastAccessedTimestamp: serverExpense.last_accessed_timestamp,
      creationTimestamp: serverExpense.creation_timestamp,
    })),
  };
}

export async function addExpenseAction(
  expense: ClientExpense
): Promise<ClientDatabaseQueryResult<void>> {
  // Verify access token, get user ID from it
  const getAccessTokenRequest = await getAndVerifyAccessToken();
  if (!getAccessTokenRequest.success) {
    return getAccessTokenRequest;
  }
  const userId: string = getAccessTokenRequest.result.user_id;

  // Perform server-side request
  const serverExpense: ServerExpense = {
    id: expense.id,
    user_id: userId,
    title: expense.title,
    description: expense.description,
    category: expense.category,
    amount: expense.amount,
    payment_method: expense.paymentMethod,
    subscription_id: expense.subscriptionId,
    reimbursement_expected_amount: expense.reimbursementExpectedAmount,
    reimbursement_notes: expense.reimbursementNotes,
    reimbursement_income_ids: expense.reimbursementIncomeIds,
    timestamp: expense.timestamp,
    last_edited_timestamp: expense.lastEditedTimestamp,
    last_accessed_timestamp: expense.lastAccessedTimestamp,
    creation_timestamp: expense.creationTimestamp,
    deletion_timestamp: null,
  };
  const addExpenseRequest = await requestAddExpense(serverExpense);

  // Convert server-types to client-types for safety, abstract away unneeded stuff
  if (!addExpenseRequest.success) {
    return {
      success: false,
      errorString: addExpenseRequest.errorString,
    };
  }
  return {
    success: true,
    result: undefined, // void
  };
}

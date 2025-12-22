// "use server"; // All actions must have this, turns this into callable from client. Otherwise, it turns into import("server-only") and then it's inaccessible to client

// import {
//   requestAddExpense,
//   requestGetExpenses,
// } from "@/src/utils/db/book-keeping/expenses/db_actions";
// import {
//   ClientAccessToken,
//   ClientDatabaseQueryResult,
//   ClientExpense,
//   ClientUser,
// } from "@/src/utils/client_types";
// import {
//   ServerAccessToken,
//   ServerExpense,
//   ServerUser,
// } from "@/src/db/_internal/server_types";
// import {
//   requestGetAccessToken,
//   requestGetUserAccessTokens,
//   requestGetUserById,
//   requestUpdateAccessTokenLastUseTimestamp,
//   requestUpdateDefaultTokenExpiry,
//   requestUpdateMaxTokensAtATime,
//   requestUpdateAccessTokenManuallyRevokedTimestamp,
//   requestUpdateAccessTokenAutomaticallyRevokedTimestamp,
//   requestGetAllUsers,
// } from "@/src/utils/db/auth/db_actions";
// import { cookies } from "next/headers";
// import { getAndVerifyAccessToken } from "./auth";

// export async function getAllUsersAction(): Promise<
//   ClientDatabaseQueryResult<ClientUser[]>
// > {
//   // Verify access token, get user ID from it
//   const getAccessTokenRequest = await getAndVerifyAccessToken();
//   if (!getAccessTokenRequest.success) {
//     return getAccessTokenRequest;
//   }
//   const userId: string = getAccessTokenRequest.result.user_id;

//   // Perform server-side request
//   const getUsersRequest = await requestGetAllUsers();

//   // Convert server-types to client-types for safety, abstract away unneeded stuff
//   if (!getUsersRequest.success) {
//     return {
//       success: false,
//       errorString: getUsersRequest.errorString,
//     };
//   }
//   return {
//     success: true,
//     result: getUsersRequest.result.map((x) => ({
//       id: x.id,
//       email: x.email,
//       creationTimestamp: x.creation_timestamp,
//       lastLoginTimestamp: x.last_login_timestamp,
//       defaultTokenExpirySeconds: x.default_token_expiry_seconds,
//       maxTokensAtATime: x.max_tokens_at_a_time,
//       username: x.username,
//     })),
//   };
// }

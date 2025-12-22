// "use server"; // All actions must have this, turns this into callable from client. Otherwise, it turns into import("server-only") and then it's inaccessible to client

// // TODO lots of boilerplate code here. Move all of it to a global db_actions or something. With all the token checks there

// import {
//   requestAddExpense,
//   requestGetExpenses,
// } from "@/src/utils/db/book-keeping/expenses/db_actions";
// import {
//   ClientDatabaseQueryResult,
//   ClientExpense,
//   ClientGymWeight,
// } from "@/src/utils/client_types";
// import {
//   ServerAccessToken,
//   ServerExpense,
//   ServerGymWeight,
// } from "@/src/db/_internal/server_types";
// import { requestGetAccessToken } from "@/src/utils/db/auth/db_actions";
// import { cache } from "react";
// import { cookies } from "next/headers";
// import {
//   requestAddGymWeight,
//   requestDeleteGymWeight,
//   requestGetGymWeights,
// } from "../utils/db/gym/weight/db_actions";
// import { getAndVerifyAccessToken } from "./auth";

// export async function getGymWeightsAction(): Promise<
//   ClientDatabaseQueryResult<ClientGymWeight[]>
// > {
//   // Verify access token, get user ID from it
//   const getAccessTokenRequest = await getAndVerifyAccessToken();
//   if (!getAccessTokenRequest.success) {
//     return getAccessTokenRequest;
//   }
//   const userId: string = getAccessTokenRequest.result.user_id;

//   // Perform server-side request
//   const getWeightsRequest = await requestGetGymWeights(userId);

//   // Convert server-types to client-types for safety, abstract away unneeded stuff
//   if (!getWeightsRequest.success) {
//     return {
//       success: false,
//       errorString: getWeightsRequest.errorString,
//     };
//   }
//   return {
//     success: true,
//     result: getWeightsRequest.result.map((serverWeight) => ({
//       timestamp: serverWeight.timestamp,
//       amount: serverWeight.amount,
//     })),
//   };
// }

// export async function addGymWeightAction(
//   weight: ClientGymWeight
// ): Promise<ClientDatabaseQueryResult<void>> {
//   // Verify access token, get user ID from it
//   const getAccessTokenRequest = await getAndVerifyAccessToken();
//   if (!getAccessTokenRequest.success) {
//     return getAccessTokenRequest;
//   }
//   const userId: string = getAccessTokenRequest.result.user_id;

//   //todo: verify parameters here

//   // Perform server-side request
//   const serverGymWeight: ServerGymWeight = {
//     user_id: userId,
//     timestamp: weight.timestamp,
//     amount: weight.amount,
//   };
//   const addGymWeightRequest = await requestAddGymWeight(serverGymWeight);

//   // Convert server-types to client-types for safety, abstract away unneeded stuff
//   if (!addGymWeightRequest.success) {
//     return {
//       success: false,
//       errorString: addGymWeightRequest.errorString,
//     };
//   }
//   return {
//     success: true,
//     result: undefined, // void
//   };
// }

// export async function deleteGymWeightAction(
//   weight: ClientGymWeight
// ): Promise<ClientDatabaseQueryResult<void>> {
//   // Verify access token, get user ID from it
//   const getAccessTokenRequest = await getAndVerifyAccessToken();
//   if (!getAccessTokenRequest.success) {
//     return getAccessTokenRequest;
//   }
//   const userId: string = getAccessTokenRequest.result.user_id;

//   // Perform server-side request
//   const serverGymWeight: ServerGymWeight = {
//     user_id: userId,
//     timestamp: weight.timestamp,
//     amount: weight.amount,
//   };
//   const deleteGymWeightRequest = await requestDeleteGymWeight(serverGymWeight);

//   // Convert server-types to client-types for safety, abstract away unneeded stuff
//   if (!deleteGymWeightRequest.success) {
//     return {
//       success: false,
//       errorString: deleteGymWeightRequest.errorString,
//     };
//   }
//   return {
//     success: true,
//     result: undefined, // void
//   };
// }

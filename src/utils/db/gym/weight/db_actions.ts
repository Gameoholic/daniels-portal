// import "server-only";

// import {
//   ServerExpense,
//   ServerDatabaseQueryResult,
//   ServerGymWeight,
// } from "@/src/utils/server_types";
// import {
//   getGymWeights,
//   addGymWeight,
//   deleteGymWeight,
// } from "@/src/utils/db/gym/weight/db_queries";
// import { requestGetAccessToken } from "../../auth/db_actions";
// import { executeDatabaseQuery } from "@/src/utils/db/db";

// export async function requestGetGymWeights(
//   userId: string
// ): Promise<ServerDatabaseQueryResult<ServerGymWeight[]>> {
//   return await executeDatabaseQuery(() => getGymWeights(userId), {});
// }

// export async function requestAddGymWeight(
//   expense: ServerGymWeight
// ): Promise<ServerDatabaseQueryResult<void>> {
//   return await executeDatabaseQuery(() => addGymWeight(expense));
// }

// export async function requestDeleteGymWeight(
//   expense: ServerGymWeight
// ): Promise<ServerDatabaseQueryResult<void>> {
//   return await executeDatabaseQuery(() => deleteGymWeight(expense));
// }

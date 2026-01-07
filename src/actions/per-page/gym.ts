"use server"; // All server actions must have this, turns this into callable from client. Otherwise, it turns into import("server-only") and then it's inaccessible to client
import {
  addGymWeight,
  getGymWeights,
  ServerGymWeight,
} from "@/src/db/_internal/per-table/gym-weights";
import {
  checkForPermission,
  databaseQueryError,
  DatabaseQueryResult,
  executeDatabaseQuery,
  getAccessTokenFromBrowser,
  verifyAccessTokenFromBrowser,
} from "../../db/dal";

import { cookies } from "next/headers";
import { Permission } from "@/src/db/_internal/per-table/permissions";

export interface GymActions_GetUserGymWeights_Result {
  id: string;
  weight: number;
  timestamp: Date;
}

export async function getUserGymWeightsAction(): Promise<
  DatabaseQueryResult<GymActions_GetUserGymWeights_Result[]>
> {
  if (!(await checkForPermission(Permission.UseApp_Gym)).success) {
    return databaseQueryError("No permission.");
  }

  const getGymWeightsQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getGymWeights,
    []
  );
  if (!getGymWeightsQuery.success) {
    return getGymWeightsQuery;
  }

  const gymWeights: ServerGymWeight[] = getGymWeightsQuery.result;

  // Minimize data passed to client to only necessary data
  const minimizedGymWeights: GymActions_GetUserGymWeights_Result[] =
    gymWeights.map((x) => ({
      id: x.id,
      weight: x.weight,
      timestamp: x.timestamp,
    }));

  return {
    success: true,
    result: minimizedGymWeights,
  };
}

export interface GymActions_AddGymWeight_GymWeightParameter {
  amount: number;
  timestamp: Date;
}

export async function addGymWeightAction(
  gymWeight: GymActions_AddGymWeight_GymWeightParameter
): Promise<DatabaseQueryResult<void>> {
  if (!(await checkForPermission(Permission.UseApp_Gym)).success) {
    return databaseQueryError("No permission.");
  }

  return { success: false, errorString: "todo implement this action." };
  // Verify passed data
  if (gymWeight.amount <= 0) {
    return {
      success: false,
      errorString: "Invalid argument.",
    };
  }

  // Convert passed gym weight to server gym weight
  const accessTokenQuery = await verifyAccessTokenFromBrowser();
  if (!accessTokenQuery.success) {
    return {
      success: false,
      errorString: "Invalid token.",
    };
  }
  const userId = accessTokenQuery.result.user_id;
  const serverGymWeight: ServerGymWeight = {
    user_id: userId,
    weight: gymWeight.amount,
    timestamp: gymWeight.timestamp,
  };

  const addGymWeightQuery = await executeDatabaseQuery(
    accessTokenQuery.result.token,
    addGymWeight,
    [serverGymWeight]
  );

  if (!addGymWeightQuery.success) {
    return {
      success: false,
      errorString: "Couldn't add gym weight.",
    };
  }

  return {
    success: true,
    result: undefined, // void
  };
}

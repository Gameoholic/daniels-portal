"use server"; // All server actions must have this, turns this into callable from client. Otherwise, it turns into import("server-only") and then it's inaccessible to client
import {
  checkForPermission,
  DatabaseQueryResult,
  executeDatabaseQuery,
  getAccessTokenFromBrowser,
  verifyAccessTokenFromBrowser,
} from "../../db/dal";
import {
  getUserAccessTokens,
  updateAccessTokenAutomaticallyRevokedTimestamp,
  updateAccessTokenManuallyRevokedTimestamp,
} from "../../db/_internal/access-tokens";
import {
  isAccessTokenValid,
  ServerAccessToken,
  ServerExpense,
  ServerGymWeight,
  ServerUser,
} from "../../db/_internal/server_types";
import { cookies } from "next/headers";
import {
  getUser,
  updateDefaultTokenExpiry,
  updateMaxTokensAtATime,
} from "../../db/_internal/users";
import { getUserPermissions } from "@/src/db/_internal/permissions";
import { getExpenses } from "@/src/db/_internal/expenses";
import { addGymWeight, getGymWeights } from "@/src/db/_internal/gym-weights";

export interface GymActions_GetUserGymWeights_Result {
  amount: number;
  timestamp: Date;
}

export async function getUserGymWeightsAction(): Promise<
  DatabaseQueryResult<GymActions_GetUserGymWeights_Result[]>
> {
  checkForPermission("use_app_gym");

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
      amount: x.amount,
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
  checkForPermission("use_app_gym");

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
    amount: gymWeight.amount,
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

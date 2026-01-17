"use server"; // All server actions must have this, turns this into callable from client. Otherwise, it turns into import("server-only") and then it's inaccessible to client
import {
  checkForPermission,
  DatabaseQueryResult,
  executeDatabaseQuery,
  getAccessTokenFromBrowser,
  GET_USER_ID_FROM_ACCESS_TOKEN,
  databaseQueryError,
} from "../../db/dal";

import { cookies } from "next/headers";
import { Permission } from "@/src/db/_internal/per-table/permissions";
import {
  getUserTimeManagementActivities,
  ServerTimeManagementActivity,
} from "@/src/db/_internal/per-table/time-management-activities";
import {
  getUserTimeManagementActivitySessions,
  ServerTimeManagementActivitySession,
} from "@/src/db/_internal/per-table/time-management-activity-sessions";

export interface TimeManagementActions_GetUserActivities_Result {
  id: string;
  name: string;
  percentage: number;
}
/**
 * @returns
 */
export async function getUserActivities(): Promise<
  DatabaseQueryResult<TimeManagementActions_GetUserActivities_Result[]>
> {
  if (!(await checkForPermission(Permission.UseApp_TimeManagement)).success) {
    return databaseQueryError("No permission.");
  }

  const getUserTimeManagementActivitiesQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getUserTimeManagementActivities,
    [GET_USER_ID_FROM_ACCESS_TOKEN]
  );
  if (!getUserTimeManagementActivitiesQuery.success) {
    return getUserTimeManagementActivitiesQuery;
  }

  const activities: ServerTimeManagementActivity[] =
    getUserTimeManagementActivitiesQuery.result;

  // Minimize data passed to client to only necessary data
  const minimizedDataActivities: TimeManagementActions_GetUserActivities_Result[] =
    activities.map((x) => ({
      id: x.id,
      name: x.name,
      percentage: x.percentage,
    }));

  return {
    success: true,
    result: minimizedDataActivities,
  };
}

export interface TimeManagementActions_GetUserActivitySessions_Result {
  id: string;
  activityId: string;
  startTimestamp: Date;
  endTimestamp: Date | null;
}
/**
 * @returns Returns the activity sessions from TODAY.
 */
export async function getUserActivitySessions(): Promise<
  DatabaseQueryResult<TimeManagementActions_GetUserActivitySessions_Result[]>
> {
  if (!(await checkForPermission(Permission.UseApp_TimeManagement)).success) {
    return databaseQueryError("No permission.");
  }

  const getUserTimeManagementActivitySessionsQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getUserTimeManagementActivitySessions,
    [GET_USER_ID_FROM_ACCESS_TOKEN]
  );
  if (!getUserTimeManagementActivitySessionsQuery.success) {
    return getUserTimeManagementActivitySessionsQuery;
  }

  const activitySessions: ServerTimeManagementActivitySession[] =
    getUserTimeManagementActivitySessionsQuery.result.filter(
      (x) => x.start_timestamp.getUTCDate() == new Date().getUTCDate()
    );

  // Minimize data passed to client to only necessary data
  const minimizedDataActivitySessions: TimeManagementActions_GetUserActivitySessions_Result[] =
    activitySessions.map((x) => ({
      id: x.id,
      activityId: x.activity_id,
      startTimestamp: x.start_timestamp,
      endTimestamp: x.end_timestamp,
    }));

  return {
    success: true,
    result: minimizedDataActivitySessions,
  };
}
